import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { api } from '../../services/api.js'
import ProgressBar from '../../components/common/ProgressBar.jsx'

export default function CertificatesPage() {
  const { getToken } = useAuth()
  const { certificates, enrollments } = useProgress()
  const [downloading, setDownloading] = useState(null)
  const [copyMsg, setCopyMsg] = useState(null)

  const inProgress = enrollments.filter((e) => !e.is_completed)

  async function handleDownload(cert) {
    setDownloading(cert.id)
    try {
      const token = await getToken()
      const data = await api.downloadCertificate(cert.id, token)
      if (data?.pdf_url) {
        window.open(data.pdf_url, '_blank')
      } else {
        alert('PDF not yet available — your certificate is valid and can be verified using the code below.')
      }
    } catch (e) {
      if (e.status === 503) {
        alert('PDF generation is coming soon. Use your verification code for now: ' + cert.verification_code)
      } else {
        alert('Download failed: ' + e.message)
      }
    }
    setDownloading(null)
  }

  async function handleShare(cert) {
    const url = `${window.location.origin}/verify/${cert.verification_code}`
    await navigator.clipboard.writeText(url).catch(() => {})
    setCopyMsg(cert.id)
    setTimeout(() => setCopyMsg(null), 2000)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-6">My Certificates</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-gray-100 rounded-lg text-center py-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{certificates.length}</p>
          <p className="text-xs text-gray-500">Certificates Earned</p>
        </div>
        <div className="border border-gray-100 rounded-lg text-center py-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{inProgress.length}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="font-semibold text-navy mb-3">Earned Certificates</h2>
        {certificates.length === 0 ? (
          <p className="text-sm text-gray-400">Complete a course to earn your first certificate.</p>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="border-2 border-gold rounded-lg p-4 bg-white shadow-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-navy">{cert.course?.title || 'Course'}</p>
                    <p className="text-xs text-gray-400">
                      Issued {cert.issued_at ? new Date(cert.issued_at).toLocaleDateString() : ''}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{cert.verification_code}</p>
                  </div>
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleDownload(cert)}
                    disabled={downloading === cert.id}
                    className="text-xs bg-navy text-white font-semibold px-3 py-1.5 rounded-md disabled:opacity-50"
                  >
                    {downloading === cert.id ? 'Loading…' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => handleShare(cert)}
                    className="text-xs border border-navy text-navy font-semibold px-3 py-1.5 rounded-md"
                  >
                    {copyMsg === cert.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <Link
                    to={`/course-complete/${cert.course?.id || ''}`}
                    className="text-xs text-gray-500 underline self-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-navy mb-3">Courses In Progress</h2>
        {inProgress.length === 0 ? (
          <p className="text-sm text-gray-400">No courses in progress.</p>
        ) : (
          <div className="space-y-3">
            {inProgress.map((enr) => (
              <div key={enr.id} className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-navy w-2/5 truncate">
                  {enr.course_title || (enr.course?.title) || 'Course'}
                </p>
                <div className="flex-1"><ProgressBar percent={enr.progress_percentage || 0} /></div>
                <span className="text-xs text-gray-500 w-8 text-right">{enr.progress_percentage || 0}%</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
