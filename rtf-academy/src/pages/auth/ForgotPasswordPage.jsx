import { useState } from 'react'
import Button from '../../components/common/Button.jsx'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-navy mb-6">Reset Your Password</h1>
      {sent ? (
        <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
          Password reset instructions have been sent to your email.
        </p>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-navy">Email Address</label>
            <input
              type="email"
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Send Reset Link</Button>
        </form>
      )}
    </div>
  )
}
