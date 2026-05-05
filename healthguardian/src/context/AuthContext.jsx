import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { unwrapData } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('hg_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem('hg_token') || null)
  const [user,    setUser]    = useState(() => getStoredUser())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { token: tk, user: u } = data.data
      localStorage.setItem('hg_token', tk)
      localStorage.setItem('hg_user',  JSON.stringify(u))
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`
      setToken(tk)
      setUser(u)
      toast.success(`Welcome back, ${u.name}!`)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithOtp = useCallback(async (email, code) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/login', { email, code })
      const { token: tk, user: u } = data.data
      localStorage.setItem('hg_token', tk)
      localStorage.setItem('hg_user',  JSON.stringify(u))
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`
      setToken(tk)
      setUser(u)
      toast.success(`Welcome back, ${u.name}!`)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (idToken) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/google', { idToken })
      const { token: tk, user: u } = data.data
      localStorage.setItem('hg_token', tk)
      localStorage.setItem('hg_user',  JSON.stringify(u))
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`
      setToken(tk)
      setUser(u)
      toast.success(`Welcome back, ${u.name}!`)
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', payload)
      const { token: tk, user: u } = data.data
      localStorage.setItem('hg_token', tk)
      localStorage.setItem('hg_user',  JSON.stringify(u))
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`
      setToken(tk)
      setUser(u)
      toast.success(
        payload.role === 'doctor' && !u.isApproved
          ? 'Account created. Awaiting admin approval before you can use the doctor dashboard.'
          : 'Account created successfully!'
      )
      return u
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('hg_token')
    localStorage.removeItem('hg_user')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const setSessionUser = useCallback((u) => {
    localStorage.setItem('hg_user', JSON.stringify(u))
    setUser(u)
  }, [])

  const setSessionFromAuth = useCallback((tk, u) => {
    if (tk) {
      localStorage.setItem('hg_token', tk)
      setToken(tk)
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`
    }
    if (u) {
      localStorage.setItem('hg_user', JSON.stringify(u))
      setUser(u)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await api.get('/auth/me')
    const inner = unwrapData(res)
    const u = inner?.user
    if (u) {
      localStorage.setItem('hg_user', JSON.stringify(u))
      setUser(u)
    }
    return u
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, loginWithOtp, loginWithGoogle, register, logout, setSessionUser, setSessionFromAuth, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
