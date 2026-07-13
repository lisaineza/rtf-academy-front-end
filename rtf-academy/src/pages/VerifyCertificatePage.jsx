import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api.js'

export default function VerifyCertificatePage() {
  const { code } = useParams()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const res = await api.verifyCertificate(code)
        if (!mounted) return
        setResult(res)
      } catch (err) {
        if (err.status === 404) setResult({ valid: false })
        else setResult({ valid: false })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [code])

  if (loading) return <div className="py-10 text-center">Checking…</div>

  if (!result || !result.valid) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-navy mb-2">Certificate Not Found</h1>
        <p className="text-sm text-gray-500">We could not verify that certificate code.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="border-2 border-gold rounded-lg p-6">
        <h1 className="text-xl font-bold text-navy mb-2">Certificate Verified</h1>
        <p className="text-sm text-gray-600 mb-2">Student: <strong>{result.student_name}</strong></p>
        <p className="text-sm text-gray-600 mb-2">Course: <strong>{result.course_title}</strong></p>
        <p className="text-sm text-gray-500">Issued: {result.issued_at}</p>
        <p className="mt-4 text-xs text-gray-500">Verification code: <span className="font-mono">{result.verification_code}</span></p>
      </div>
    </div>
  )
}
