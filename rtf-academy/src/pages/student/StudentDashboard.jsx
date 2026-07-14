import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import StatCard from '../../components/common/StatCard.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'

function courseId(e) {
  return e.course && typeof e.course === 'object' ? e.course.id : e.course
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { enrollments, certificates } = useProgress()

  const active    = enrollments.filter((e) => !e.is_completed)
  const completed = enrollments.filter((e) => e.is_completed)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-4">
        Hi, {user?.full_name?.split(' ')[0] || 'Learner'}!
      </h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard value={active.length}       label="Active Courses" />
        <StatCard value={completed.length}    label="Completed" />
        <StatCard value={certificates.length} label="Certificates" />
      </div>

      <section className="mb-8">
        <h2 className="font-semibold text-navy mb-3">Continue Learning</h2>
        {active.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
            You have not enrolled in any courses yet.
            <div className="mt-3">
              <Link to="/courses" className="text-navy font-semibold underline">Explore Courses</Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {active.map((enr) => (
              <div key={enr.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
                <div className="h-20 bg-navy flex items-center justify-center px-3">
                  <p className="text-white text-xs font-medium text-center">
                    {enr.course_title || (enr.course && typeof enr.course === 'object' ? enr.course.title : 'Course')}
                  </p>
                </div>
                <div className="p-3">
                  <ProgressBar percent={enr.progress_percentage || 0} />
                  <p className="text-xs text-gray-400 mt-1 mb-2">{enr.progress_percentage || 0}% complete</p>
                  <Link
                    to={`/learn/${courseId(enr)}`}
                    className="inline-block bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold text-navy mb-3">Completed Courses</h2>
          <div className="space-y-2">
            {completed.map((enr) => (
              <div key={enr.id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <span className="text-green-600 text-lg">✓</span>
                <div>
                  <p className="text-sm font-medium text-navy">
                    {enr.course_title || (enr.course && typeof enr.course === 'object' ? enr.course.title : 'Course')}
                  </p>
                  <Link to="/certificates" className="text-xs text-navy underline">View Certificate</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {certificates.length > 0 && (
        <section>
          <h2 className="font-semibold text-navy mb-3">My Certificates</h2>
          <div className="space-y-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-navy">
                    {cert.course?.title || 'Certificate'}
                  </p>
                  <p className="text-xs text-gray-400">{cert.verification_code}</p>
                </div>
                <Link to="/certificates" className="text-xs text-navy underline">View</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
