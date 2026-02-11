import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('authUser')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('authToken') || null
    } catch (e) {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) localStorage.setItem('authUser', JSON.stringify(user))
      else localStorage.removeItem('authUser')
    } catch (e) {
      // ignore
    }
  }, [user])

  useEffect(() => {
    try {
      if (token) localStorage.setItem('authToken', token)
      else localStorage.removeItem('authToken')
    } catch (e) {
      // ignore
    }
  }, [token])

  const login = (authData) => {
    if (!authData) return
    setUser(authData.user || null)
    setToken(authData.token || null)
  }
  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
