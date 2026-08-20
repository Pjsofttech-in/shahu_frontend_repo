import axios from 'axios'

/*
  Local:
  Vite dev server proxies /api to your Tomcat backend on port 8080.

  Production:
  Set VITE_API_BASE_URL to your live backend URL (or keep it relative if the
  frontend is served from the same origin as the backend).
*/

const envBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = envBaseUrl || '/api'
const USE_COOKIES = (import.meta.env.VITE_API_USE_COOKIES || '').toString() === 'true'
const PUBLIC_AUTH_ENDPOINTS = [/^\/auth\/login(?:\/)?$/i, /^\/auth\/register(?:\/)?$/i, /^\/auth\/refresh(?:\/)?$/i]

const shouldSkipAuthHeader = (url = '') =>
  PUBLIC_AUTH_ENDPOINTS.some((pattern) => pattern.test(url))

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

if (USE_COOKIES) {
  api.defaults.withCredentials = true
}

const normalizeToken = (token) => {
  if (!token) return null
  return token.startsWith('Bearer ') ? token.slice(7) : token
}

// --------------------------------------------------
// TOKEN STORAGE
// --------------------------------------------------

export const tokenStore = {
  get: () => sessionStorage.getItem('authToken'),

  set: (token) => {
    const normalizedToken = normalizeToken(token)

    if (normalizedToken) {
      sessionStorage.setItem('authToken', normalizedToken)
    }
  },

  getCookieAuth: () => sessionStorage.getItem('cookieAuth') === 'true',

  setCookieAuth: (flag = true) => {
    sessionStorage.setItem('cookieAuth', flag ? 'true' : 'false')
  },
  clear: () => {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('authUser')
    sessionStorage.removeItem('cookieAuth')
  },

  getUser: () => {
    const user = sessionStorage.getItem('authUser')

    try {
      return user ? JSON.parse(user) : null
    } catch {
      return null
    }
  },

  setUser: (user) => {
    sessionStorage.setItem('authUser', JSON.stringify(user))
  },
}

// --------------------------------------------------
// DEVELOPMENT-ONLY: preload token from env if present
// --------------------------------------------------
// This loads a VITE_ADMIN_LOGIN_TOKEN (if set) into sessionStorage when running
// in development and when no token already exists. This is intended for local
// convenience only — do NOT enable or commit real tokens for production.
try {
  const devToken = (import.meta.env.VITE_ADMIN_LOGIN_TOKEN || '').trim()
  const isDev = import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development'
  const allowDevAutoLogin = (import.meta.env.VITE_ENABLE_DEV_AUTO_LOGIN || '').toString() === 'true'

  if (isDev && devToken && allowDevAutoLogin) {
    if (!tokenStore.get()) {
      tokenStore.set(devToken)
      // eslint-disable-next-line no-console
      console.info('[dev] VITE_ADMIN_LOGIN_TOKEN loaded into sessionStorage')
    }
  }
} catch (e) {
  // ignore in non-Vite environments
}

// --------------------------------------------------
// ADD JWT TO EVERY REQUEST
// --------------------------------------------------

api.interceptors.request.use(
  (config) => {
    const url = config?.url || ''
    const token = tokenStore.get()

    // Dev-only: log outgoing requests to help debug missing auth headers
    try {
      const isDev = import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development'
      if (isDev) console.debug('[api.request] url=', url, 'authorization=', token && !shouldSkipAuthHeader(url) ? 'Bearer <token>' : '(none)')
    } catch (e) {}

    if (token && !shouldSkipAuthHeader(url)) {
      config.headers = config.headers || {}
      config.headers.Authorization = 'Bearer ' + token
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization
    }

    return config
  },
  (error) => Promise.reject(error)
)

// --------------------------------------------------
// HANDLE UNAUTHORIZED TOKEN
// --------------------------------------------------

api.interceptors.response.use(
  (response) => response,

  (error) => {
    try {
      const isDev = import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development'
      if (isDev) console.debug('[api.response.error]', { url: error?.config?.url, status: error?.response?.status, data: error?.response?.data })
    } catch (e) {}

    if (error.response?.status === 401) {
      const isDev = import.meta.env.MODE === 'development' || import.meta.env.VITE_APP_ENV === 'development'

      // In local development, do not forcibly kick the user to /401 when the API is
      // still being worked on or the backend is rejecting a permission check. This
      // lets the page remain accessible for debugging while still surfacing the issue.
      if (isDev) {
        return Promise.reject(error)
      }

      tokenStore.clear()

      const currentPath = window.location.pathname
      const authEndpoint = /\/auth\//i.test(error?.config?.url || '')
      const isLoginRoute = currentPath === '/login'
      const isUnauthorizedRoute = currentPath === '/401'

      // Keep users on the login screen when attempting to sign in. Only send
      // genuinely unauthenticated app sessions to the 401 page.
      if (!isLoginRoute && !isUnauthorizedRoute && !authEndpoint) {
        window.location.href = '/401'
      }
    }

    return Promise.reject(error)
  }
)

export const apiUpload = axios.create({
  baseURL: API_BASE_URL
})

if (USE_COOKIES) {
  apiUpload.defaults.withCredentials = true
}

apiUpload.interceptors.request.use((config) => {
  const url = config?.url || ''
  const token = tokenStore.get()

  if (token && !shouldSkipAuthHeader(url)) {
    config.headers = config.headers || {}
    config.headers.Authorization = 'Bearer ' + token
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization
  }

  return config
})

export default api


