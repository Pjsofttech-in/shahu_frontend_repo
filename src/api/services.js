import api, { apiUpload, dynamicApi, dynamicApiUpload } from './axiosConfig'

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

export const makeDynamicCrudService = (basePath) => ({
  getAll: (params) => dynamicApi.get(basePath, { params }).then((r) => r.data),
  getById: (id) => dynamicApi.get(`${basePath}/${id}`).then((r) => r.data),
  create: (payload) => dynamicApi.post(basePath, payload).then((r) => r.data),
  update: (id, payload) => dynamicApi.put(`${basePath}/${id}`, payload).then((r) => r.data),
  remove: (id) => dynamicApi.delete(`${basePath}/${id}`).then((r) => r.data),
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
export const galleryService = makeDynamicCrudService('/gallery')
export const topperService = makeDynamicCrudService('/toppers')
export const testimonialService = makeDynamicCrudService('/testimonials')
export const courseService = makeDynamicCrudService('/courses')
export const downloadService = makeCrudService('/downloads')
export const footerService = {
  get: () => dynamicApi.get('/website/footer').then((r) => r.data),
  update: (payload) => dynamicApi.put('/website/footer', payload).then((r) => r.data),
}
export const visionMissionService = {
  get: () => dynamicApi.get('/website/vision-mission').then((r) => r.data),
  update: (payload) => dynamicApi.put('/website/vision-mission', payload).then((r) => r.data),
}
export const contactService = makeCrudService('/contacts')

const getWebsiteRequestParams = (user = {}) => ({
  url: import.meta.env.VITE_DYNAMIC_PROFILE_URL?.trim() || import.meta.env.VITE_WEBSITE_URL?.trim() || window.location.origin,
  role: user?.role || 'ADMIN',
  email: user?.email || '',
})

export const aboutUsService = {
  getAll: (user) => dynamicApi.get('/getAllAboutUs', { params: { url: getWebsiteRequestParams(user).url } }).then((r) => r.data),
  create: (values, image, user) => {
    const form = new FormData()
    form.append('aboutUs', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams(user).url)
    if (image) form.append('aboutUsImageName', image)
    return dynamicApiUpload.post('/createAboutUs', form).then((r) => r.data)
  },
  update: (id, values, image, user) => {
    const form = new FormData()
    form.append('aboutUs', JSON.stringify(values))
    const params = getWebsiteRequestParams(user)
    form.append('role', params.role)
    form.append('email', params.email)
    form.append('url', params.url)
    if (image) form.append('aboutUsImage', image)
    return dynamicApiUpload.put(`/updateAboutUs/${id}`, form).then((r) => r.data)
  },
  remove: (id, user) => dynamicApi.delete(`/deleteAboutUs/${id}`, { params: getWebsiteRequestParams(user) }).then((r) => r.data),
}

export const visionMissionDynamicService = {
  getAll: () => dynamicApi.get('/getAllVisionMissions', { params: { url: getWebsiteRequestParams().url } }).then((r) => r.data),
  create: (values, image) => {
    const form = new FormData()
    form.append('vm', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams().url)
    if (image) form.append('directorImage', image)
    return dynamicApiUpload.post('/createVisionMission', form).then((r) => r.data)
  },
  update: (id, values, image) => {
    const form = new FormData()
    form.append('vm', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams().url)
    if (image) form.append('directorImage', image)
    return dynamicApiUpload.put(`/updateVisionMission/${id}`, form).then((r) => r.data)
  },
  remove: (id) => dynamicApi.delete(`/deleteVisionMission/${id}`, { params: { url: getWebsiteRequestParams().url } }).then((r) => r.data),
}

export const awardService = {
  getAll: () => dynamicApi.get('/getAllAwards', { params: { url: getWebsiteRequestParams().url } }).then((r) => r.data),
  create: (values, image) => {
    const form = new FormData()
    form.append('award', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams().url)
    form.append('awardImageName', image)
    return dynamicApiUpload.post('/createAward', form).then((r) => r.data)
  },
  update: (id, values, image) => {
    const form = new FormData()
    form.append('award', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams().url)
    if (image) form.append('awardImage', image)
    return dynamicApiUpload.put(`/updateAward/${id}`, form).then((r) => r.data)
  },
  remove: (id) => dynamicApi.delete(`/deleteAward/${id}`, { params: { url: getWebsiteRequestParams().url } }).then((r) => r.data),
}

export const facultyService = {
  getAll: () => dynamicApi.get('/getAllFacilities', { params: { url: getWebsiteRequestParams().url } }).then((r) => r.data),
  create: (values, image) => {
    const form = new FormData()
    form.append('facility', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams().url)
    form.append('facilityImageName', image)
    return dynamicApiUpload.post('/createFacility', form).then((r) => r.data)
  },
  update: (id, values, image) => {
    const form = new FormData()
    form.append('facility', JSON.stringify(values))
    form.append('url', getWebsiteRequestParams().url)
    if (image) form.append('facilityImage', image)
    return dynamicApiUpload.put(`/updateFacility/${id}`, form).then((r) => r.data)
  },
  remove: (id) => dynamicApi.delete(`/deleteFacility/${id}`, { params: { url: getWebsiteRequestParams().url } }).then((r) => r.data),
}

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
