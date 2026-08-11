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
export const contactService = {
  get: () => api.get('/website/contact').then((r) => r.data),
  update: (payload) => api.put('/website/contact', payload).then((r) => r.data),
}

// ---------------- Sankalp Exam ----------------
export const syllabusService = makeCrudService('/sankalp/syllabus')
export const answerKeyService = makeCrudService('/sankalp/answer-keys')
export const resultCheckService = makeCrudService('/sankalp/results')
export const resultPdfService = makeCrudService('/sankalp/result-pdfs')

// ---------------- File upload helper ----------------
// Use for image / pdf uploads (gallery photos, download PDFs, result PDFs, etc.)
export const uploadFile = (file, folder = 'general') => {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)
  return apiUpload.post('/files/upload', form).then((r) => r.data) // -> { url }
}
