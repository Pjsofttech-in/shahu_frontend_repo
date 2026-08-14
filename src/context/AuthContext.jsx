import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from 'react'

import { tokenStore } from '../api/axiosConfig'
import { authService as auth } from '../api/services'
const USE_COOKIES = (import.meta.env.VITE_API_USE_COOKIES || '').toString() === 'true'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => tokenStore.getUser())
  const [token, setToken] = useState(() => {
    const devAutoLoginEnabled = (import.meta.env.VITE_ENABLE_DEV_AUTO_LOGIN || '').toString() === 'true'
    if (USE_COOKIES && tokenStore.getCookieAuth()) return 'cookie-session'
    const storedToken = tokenStore.get()
    if (!storedToken) return null
    if (devAutoLoginEnabled) return storedToken

    // Keep a valid stored token so the app remains authenticated across refreshes.
    // Clearing it here causes false 401s and makes authorized routes redirect to /401.
    return storedToken
  })

  const login = useCallback(async (email, password) => {
    if (!USE_COOKIES) {
      tokenStore.clear()
      setToken(null)
      setUser(null)
    }

    const authResponse = await auth.login(email, password)
    const receivedToken = authResponse?.token

    if (!receivedToken && !USE_COOKIES) {
      throw new Error('Token not received from server')
    }

    let receivedUser = authResponse?.user || null

    if (!receivedUser) {
      try {
        receivedUser = await auth.me()
      } catch {
        receivedUser = {
          userId: null,
          fullName: email,
          name: email,
          email,
          role: 'ADMIN',
        }
      }
    }

    if (receivedToken) {
      tokenStore.set(receivedToken)
      setToken(receivedToken)
    } else if (USE_COOKIES) {
      tokenStore.setCookieAuth(true)
      // store a placeholder token so `isAuthenticated` becomes truthy
      setToken('cookie-session')
    }

    tokenStore.setUser(receivedUser)
    setUser(receivedUser)

    return receivedUser

  }, [])

  const logout = useCallback(() => {

    tokenStore.clear()

    setToken(null)
    setUser(null)

  }, [])

  const value = {
    user,
    token,
    isAuthenticated: !!token || (USE_COOKIES && tokenStore.getCookieAuth()),
    login,
    logout,
    setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)