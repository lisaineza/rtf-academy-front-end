import { createContext, useContext, useEffect, useState } from 'react'
import { clearApiAuthToken, setApiAuthToken } from '../services/api.js'
import { auth, firebaseEnabled, getFirebaseToken, googleProvider } from '../services/firebase.js'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

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
  const [token, setTokenState] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!firebaseEnabled || !auth) return undefined

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setTokenState(null)
        clearApiAuthToken()
        return
      }

      const nextToken = await getFirebaseToken()
      setTokenState(nextToken)
      if (nextToken) {
        setApiAuthToken(nextToken)
      } else {
        clearApiAuthToken()
      }

      const mappedUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        role: firebaseUser.email?.includes('admin') ? 'admin' : 'student',
        created_at: new Date().toISOString(),
        photoURL: firebaseUser.photoURL,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedUser))
      setUser(mappedUser)
    })

    return unsubscribe
  }, [])

  async function persistSession(nextUser, nextToken = null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    setTokenState(nextToken)
    if (nextToken) {
      setApiAuthToken(nextToken)
    } else {
      clearApiAuthToken()
    }
    return nextUser
  }

  async function register({ full_name, email }) {
    const newUser = buildUserRecord({ email, full_name, role: 'student' })
    const nextToken = await getFirebaseToken()
    return persistSession(newUser, nextToken)
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
    const nextToken = await getFirebaseToken()
    return persistSession(loggedIn, nextToken)
  }

  async function loginWithGoogle() {
    if (!firebaseEnabled || !auth || !googleProvider) {
      throw new Error('Google sign-in is unavailable without Firebase config.')
    }

    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    const nextToken = await firebaseUser.getIdToken()
    const signedInUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
      role: firebaseUser.email?.includes('admin') ? 'admin' : 'student',
      created_at: new Date().toISOString(),
      photoURL: firebaseUser.photoURL,
    }

    return persistSession(signedInUser, nextToken)
  }

  async function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setTokenState(null)
    clearApiAuthToken()
    if (firebaseEnabled && auth) {
      await signOut(auth)
    }
  }

  async function getToken() {
    if (!firebaseEnabled || !auth?.currentUser) {
      return token
    }

    const nextToken = await getFirebaseToken()
    setTokenState(nextToken)
    if (nextToken) {
      setApiAuthToken(nextToken)
    } else {
      clearApiAuthToken()
    }
    return nextToken
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, loginWithGoogle, logout, getToken, firebaseEnabled, backendReachable, token }}
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
