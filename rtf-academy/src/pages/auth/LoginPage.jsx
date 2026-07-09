import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'
import GoogleButton from '../../components/common/GoogleButton.jsx'

export default function LoginPage() {
  const { login, loginWithGoogle, firebaseEnabled } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) return setError('Invalid email or password.')
    try {
      const user = await login({ email, password })
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password.')
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      const user = await loginWithGoogle()
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-navy mb-6">Welcome Back</h1>
      {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-navy">Email</label>
          <input
            type="email"
            placeholder="jane@example.com"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-gray-500">Forgot Password?</Link>
        </div>
        <Button type="submit" className="w-full">Log In</Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-gray-400">or continue with</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <GoogleButton onClick={handleGoogle} disabled={googleLoading} />
      {!firebaseEnabled && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Google sign-in needs Firebase config — see .env.example. Meanwhile email/password
          runs in local demo mode (an email containing "admin" opens the admin dashboard).
        </p>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account? <Link to="/register" className="text-green-700 font-medium">Sign up</Link>
      </p>
    </div>
  )
}
