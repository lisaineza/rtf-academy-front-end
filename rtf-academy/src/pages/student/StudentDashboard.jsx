import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../services/api.js'
import StatCard from '../../components/common/StatCard.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const me = await api.me()
        if (!mounted) return

        const enrolls = await api.listEnrollments()
        if (!mounted) return
        setEnrollments(enrolls)

        const myCerts = await api.myCertificates()
        if (!mounted) return
        setCerts(myCerts)
      } catch (err) {
        console.error('Dashboard load failed', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const totalEnrolled = enrollments.length
  const totalCompleted = enrollments.filter((e) => e.is_completed).length
  const totalCertificates = certs.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-4">Welcome back, {user?.full_name || 'Learner'}!</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard value={totalEnrolled} label="Total Enrolled" />
        <StatCard value={totalCompleted} label="Completed" />
        <StatCard value={totalCertificates} label="Certificates" />
      </div>

      <section className="mb-8">
        <h2 className="font-semibold text-navy mb-3">Continue Learning</h2>
        {enrollments.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
            You have not enrolled in any courses yet.
            <div className="mt-3">
              <Link to="/courses" className="text-navy font-semibold underline">Explore Courses</Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {enrollments.map((enr) => (
              <div key={enr.course} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
                <div className="p-3">
                  <p className="font-semibold text-navy text-sm mb-1">{enr.course_title}</p>
                  <ProgressBar percent={enr.progress_percentage} />
                  <div className="flex items-center gap-2 mt-3">
                    <Link to={`/learn/${enr.course}`} className="inline-block bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md">Continue</Link>
                    {enr.is_completed && (
                      <Link to="/certificates" className="inline-block bg-white border border-gray-200 text-xs px-3 py-1 rounded-md">View Certificate</Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
