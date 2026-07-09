import { createContext, useContext, useEffect, useState } from 'react'
import { firebaseEnabled } from '../services/firebase.js'

const AuthContext = createContext(null)
const STORAGE_KEY = 'rtf_academy_user'

function buildUserRecord({ email, full_name, role = 'student' }) {
  return {
    uid: 'local_' + Date.now(),
    email,
    full_name,
    role,
    created_at: new Date().toISOString(),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [backendReachable] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  async function register({ full_name, email }) {
    const newUser = buildUserRecord({ email, full_name, role: 'student' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }

  async function login({ email }) {
    const existing = localStorage.getItem(STORAGE_KEY)
    const parsed = existing ? JSON.parse(existing) : null
    const loggedIn = parsed && parsed.email === email
      ? parsed
      : buildUserRecord({
          email,
          full_name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'student',
        })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn))
    setUser(loggedIn)
    return loggedIn
  }

  async function loginWithGoogle() {
    throw new Error('Google sign-in is unavailable without Firebase config.')
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  async function getToken() {
    return null
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, loginWithGoogle, logout, getToken, firebaseEnabled, backendReachable }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
