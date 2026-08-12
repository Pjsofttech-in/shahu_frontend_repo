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

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

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

  clear: () => {
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('authUser')
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

  if (isDev && devToken) {
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
    const token = tokenStore.get()

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = 'Bearer ' + token
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
    if (error.response?.status === 401) {
      tokenStore.clear()

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export const apiUpload = axios.create({
  baseURL: API_BASE_URL
})

apiUpload.interceptors.request.use((config) => {
  const token = tokenStore.get()

  if (token) {
    config.headers = config.headers || {}
      config.headers.Authorization = 'Bearer ' + token
  }

  return config
})

export default api


