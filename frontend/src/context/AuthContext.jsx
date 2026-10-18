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
  const [refreshToken, setRefreshToken] = useState(() => {
    try {
      return localStorage.getItem('refreshToken') || null
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

  useEffect(() => {
    try {
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
      else localStorage.removeItem('refreshToken')
    } catch (e) {
      // ignore
    }
  }, [refreshToken])

  const login = (authData) => {
    if (!authData) return
    setUser(authData.user || null)
    setToken(authData.token || null)
    setRefreshToken(authData.refreshToken || null)
  }

  const updateTokens = ({ token: newToken, refreshToken: newRefreshToken }) => {
    if (newToken) setToken(newToken)
    if (newRefreshToken) setRefreshToken(newRefreshToken)
  }

  const logout = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken') || refreshToken
      if (storedRefreshToken) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
          credentials: 'include'
        }).catch(() => {})
      }
    } catch (err) {
      // ignore logout network errors
    } finally {
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      localStorage.removeItem('authUser')
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, isAuthenticated: !!token, login, logout, updateTokens }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
