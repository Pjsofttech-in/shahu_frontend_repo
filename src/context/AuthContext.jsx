import React, {
  createContext,
  useContext,
  useState,
  useCallback
} from 'react'

import { tokenStore } from '../api/axiosConfig'
import { authService as auth } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => tokenStore.getUser())
  const [token, setToken] = useState(() => tokenStore.get())

  const login = useCallback(async (email, password) => {
    const authResponse = await auth.login(email, password)
    const receivedToken = authResponse?.token

    if (!receivedToken) {
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

    tokenStore.set(receivedToken)
    tokenStore.setUser(receivedUser)

    setToken(receivedToken)
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
    isAuthenticated: !!token,
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