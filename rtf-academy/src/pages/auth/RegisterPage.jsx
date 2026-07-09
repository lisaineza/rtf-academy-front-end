import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'
import GoogleButton from '../../components/common/GoogleButton.jsx'

export default function RegisterPage() {
  const { register, loginWithGoogle, firebaseEnabled } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', agree: false })
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.full_name) return setError('Full name is required.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Please enter a valid email address.')
    if (form.password.length < 8) return setError('Passwords must contain at least 8 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (!form.agree) return setError('Please agree to the Terms of Service.')

    await register({ full_name: form.full_name, email: form.email, password: form.password })
    navigate('/dashboard')
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-navy mb-6">Create Account</h1>

      {error && <p className="text-sm text-red-600 mb-4 bg-red-50 rounded-md px-3 py-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-navy">Full Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Email</label>
          <input
            type="email"
            placeholder="Enter email address"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Password</label>
          <input
            type="password"
            placeholder="Enter password"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-navy">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" checked={form.agree} onChange={(e) => update('agree', e.target.checked)} />
          I agree to the Terms of Service
        </label>

        <Button type="submit" className="w-full">Sign Up</Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-gray-200 flex-1" />
        <span className="text-xs text-gray-400">or continue with</span>
        <div className="h-px bg-gray-200 flex-1" />
      </div>

      <GoogleButton onClick={handleGoogle} disabled={googleLoading} />
      {!firebaseEnabled && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          Google sign-in needs Firebase config — see .env.example.
        </p>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? <Link to="/login" className="text-green-700 font-medium">Log in</Link>
      </p>
    </div>
  )
}
