import { useState, useEffect } from 'react'
import { api } from '../../services/api.js'
import ProgressBar from '../../components/common/ProgressBar.jsx'

function formatDate(d) {
  try { return new Date(d).toLocaleDateString() } catch { return d }
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await api.myCertificates().catch(() => [])
        if (!mounted) return
        setCerts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load certificates', err)
        if (mounted) setCerts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  async function handleDownload(cert) {
    try {
      const res = await api.downloadCertificate(cert.id)
      if (res && res.pdf_url) {
        window.open(res.pdf_url, '_blank')
      } else {
        alert('PDF coming soon')
      }
    } catch (err) {
      if (err.status === 503) {
        alert('PDF generation pending — available soon')
      } else {
        console.error('Download failed', err)
        alert('Failed to download')
      }
    }
  }

  function handleShare(code) {
    const url = `${window.location.origin}/verify/${code}`
    navigator.clipboard.writeText(url).then(() => alert('Verification URL copied to clipboard'))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-6">My Certificates</h1>

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.length === 0 && <p className="text-sm text-gray-400">You have no certificates yet.</p>}
          {certs.map((c) => (
            <div key={c.id} className="border-2 border-gold rounded-lg p-4 bg-white shadow-card">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded flex items-center justify-center text-white font-bold">RTF</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-navy">{c.course?.title}</p>
                  <p className="text-xs text-gray-600">Issued: {formatDate(c.issued_at)}</p>
                  <p className="text-xs text-gray-500 mt-2">Code: <span className="font-mono text-xs">{c.verification_code}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => handleDownload(c)} className="bg-navy text-white text-xs px-3 py-1 rounded">Download PDF</button>
                <button onClick={() => handleShare(c.verification_code)} className="bg-white border border-gray-200 text-xs px-3 py-1 rounded">Share</button>
                {c.pdf_s3_url == null && <span className="text-xs text-gray-400 ml-2">PDF coming soon</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
