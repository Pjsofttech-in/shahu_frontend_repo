import api, { apiUpload } from './axiosConfig'

// ---------------------------------------------------------------------
// Generic CRUD factory — matches the pattern used across your Spring Boot
// controllers (District/Taluka/Center/Coordinator/Gallery/etc all expose
// GET/POST/PUT/DELETE on the same base path).
// ---------------------------------------------------------------------
export const makeCrudService = (basePath) => ({
  getAll: (params) => api.get(basePath, { params }).then((r) => r.data),
  getById: (id) => api.get(`${basePath}/${id}`).then((r) => r.data),
  create: (payload) => api.post(basePath, payload).then((r) => r.data),
  update: (id, payload) => api.put(`${basePath}/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`${basePath}/${id}`).then((r) => r.data),
})

const getResponseData = (response) => response?.data ?? {}

const extractToken = (payload, response) => {
  const candidates = [
    payload?.token,
    payload?.accessToken,
    payload?.jwt,
    payload?.jwtToken,
    payload?.authorization,
    payload?.data?.token,
    payload?.data?.accessToken,
    payload?.data?.jwt,
    payload?.admin?.token,
    payload?.user?.token,
    response?.headers?.authorization,
    response?.headers?.Authorization,
    response?.headers?.['x-auth-token'],
    response?.headers?.['X-Auth-Token'],
  ]

  return candidates.find((value) => typeof value === 'string' && value.trim()) || null
}

const extractUser = (payload, response) => {
  const source = payload?.user || payload?.admin || payload?.profile || payload?.data?.user || payload?.data?.admin || payload?.data?.profile || payload || {}
  const name = source?.fullName || source?.name || source?.adminName || source?.displayName || payload?.fullName || payload?.name || payload?.email || payload?.username || ''
  const email = source?.email || source?.adminEmail || payload?.email || payload?.username || ''
  const role = source?.role || source?.authority || payload?.role || payload?.authority || 'ADMIN'
  const userId = source?.id || source?.userId || source?.adminId || payload?.id || payload?.userId || payload?.adminId || null

  if (!name && !email && !role && !userId) {
    return null
  }

  return {
    userId,
    fullName: name,
    name,
    email,
    role,
  }
}

// ---------------- Auth ----------------
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })

    // Dev-only: log response shape to help diagnose missing token vs cookie sessions
    try {
      const isDev = import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development'
      if (isDev) console.debug('[auth.login] response', { data: response.data, headers: response.headers })
    } catch (e) {
      // ignore
    }

    const payload = getResponseData(response)
    const token = extractToken(payload, response) || import.meta.env.VITE_ADMIN_LOGIN_TOKEN?.trim() || null
    const user = extractUser(payload, response)

    return {
      token,
      user,
      payload,
    }
  },
  me: async () => {
    const response = await api.get('/auth/me')
    const payload = getResponseData(response)
    return extractUser(payload, response)
  },
}

// ---------------- Location hierarchy ----------------
export const districtService = makeCrudService('/districts')
export const talukaService = makeCrudService('/talukas')
export const centerService = makeCrudService('/centers')
export const coordinatorService = makeCrudService('/coordinators')

// ---------------- Schools ----------------
export const schoolService = makeCrudService('/schools')

export const talukasByDistrict = (districtId) =>
  api.get(`/talukas/district/${districtId}`).then((r) => r.data)
export const centersByTaluka = (talukaId) =>
  api.get(`/centers/taluka/${talukaId}`).then((r) => r.data)

// ---------------- Users / Admins ----------------
export const userService = makeCrudService('/users')

// ---------------- Students ----------------
export const studentService = makeCrudService('/students')

// ---------------- Website management ----------------
export const galleryService = makeCrudService('/gallery')
export const topperService = makeCrudService('/toppers')
export const testimonialService = makeCrudService('/testimonials')
export const facultyService = makeCrudService('/faculty')
export const awardService = makeCrudService('/awards')
export const courseService = makeCrudService('/courses')
export const downloadService = makeCrudService('/downloads')
export const footerService = {
  get: () => api.get('/website/footer').then((r) => r.data),
  update: (payload) => api.put('/website/footer', payload).then((r) => r.data),
}
export const visionMissionService = {
  get: () => api.get('/website/vision-mission').then((r) => r.data),
  update: (payload) => api.put('/website/vision-mission', payload).then((r) => r.data),
}
export const contactService = makeCrudService('/contacts')

// ---------------- Sankalp Exam ----------------
export const syllabusService = makeCrudService('/sankalp/syllabus')
export const resultCheckService = makeCrudService('/sankalp/results')
export const resultPdfService = makeCrudService('/sankalp/result-pdfs')

// Answer Key — uses multipart/form-data (PDF upload) — POST/PUT /api/answerkeys
export const answerKeyService = {
  getAll: () => api.get('/answerkeys').then((r) => r.data),
  getById: (id) => api.get(`/answerkeys/${id}`).then((r) => r.data),
  downloadPdf: (id) =>
    api.get(`/answerkeys/${id}/download`, { responseType: 'blob' }).then((r) => r.data),
  create: ({ title, link, examId, active, pdf }) => {
    const form = new FormData()
    form.append('title', title)
    if (link) form.append('link', link)
    form.append('examId', examId)
    form.append('active', active ?? true)
    form.append('pdf', pdf)
    return apiUpload.post('/answerkeys', form).then((r) => r.data)
  },
  update: (id, { title, link, examId, active, pdf }) => {
    const form = new FormData()
    form.append('title', title)
    if (link) form.append('link', link)
    form.append('examId', examId)
    form.append('active', active ?? true)
    if (pdf) form.append('pdf', pdf)
    return apiUpload.put(`/answerkeys/${id}`, form).then((r) => r.data)
  },
  remove: (id) => api.delete(`/answerkeys/${id}`).then((r) => r.data),
}

// ---------------- File upload helper ----------------
// Use for image / pdf uploads (gallery photos, download PDFs, result PDFs, etc.)
export const uploadFile = async (file, folder = 'general') => {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  
  try {
    const response = await apiUpload.post('/files/upload', form)
    const data = response.data
    
    // Extract URL from various possible response structures
    const url = data?.url || 
                data?.fileUrl || 
                data?.photoUrl || 
                data?.data?.url || 
                data?.data?.fileUrl || 
                data?.message || 
                null
    
    if (!url) {
      console.warn('File upload response did not contain expected URL field:', data)
      throw new Error('File upload succeeded but no URL returned from backend')
    }
    
    return { url, data }
  } catch (error) {
    console.error('File upload error:', error?.response?.data || error?.message || error)
    throw new Error(`File upload failed: ${error?.response?.data?.message || error?.message || 'Unknown error'}`)
  }
}
