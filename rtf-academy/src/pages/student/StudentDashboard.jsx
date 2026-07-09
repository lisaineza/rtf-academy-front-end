import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import { COURSES } from '../../data/mockData'
import StatCard from '../../components/common/StatCard.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'

export default function StudentDashboard() {
  const { user } = useAuth()
  const { allEnrollments } = useProgress()
  const enrollments = allEnrollments()

  const active = enrollments.filter((e) => e.status === 'active')
  const completed = enrollments.filter((e) => e.status === 'completed')
  const certificates = enrollments.filter((e) => e.certificate)

  const recommended = COURSES.filter((c) => !enrollments.some((e) => e.course_id === c.id)).slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-4">Hi, {user?.full_name?.split(' ')[0] || 'Learner'}!</h1>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <StatCard value={active.length} label="Active Courses" />
        <StatCard value={completed.length} label="Completed" />
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
            {active.map((enr) => {
              const course = COURSES.find((c) => c.id === enr.course_id)
              if (!course) return null
              return (
                <div key={course.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
                  <img src={course.thumbnail} alt={course.title} className="h-24 w-full object-cover" />
                  <div className="p-3">
                    <p className="font-semibold text-navy text-sm mb-1">{course.title}</p>
                    <ProgressBar percent={enr.progress_percent} />
                    <Link
                      to={`/learn/${course.id}`}
                      className="inline-block mt-3 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md"
                    >
                      Continue
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-navy mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {enrollments.length === 0 && <p className="text-sm text-gray-400">Nothing yet — your activity will show up here.</p>}
          {completed.map((enr) => {
            const course = COURSES.find((c) => c.id === enr.course_id)
            return (
              <div key={enr.course_id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <span className="text-green-600">✓</span>
                <div>
                  <p className="text-sm font-medium text-navy">Completed "{course?.title}"</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-navy mb-3">Recommended for You</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {recommended.map((course) => (
            <div key={course.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
              <img src={course.thumbnail} alt={course.title} className="h-24 w-full object-cover" />
              <div className="p-3">
                <p className="font-semibold text-navy text-sm mb-2">{course.title}</p>
                <Link
                  to={`/courses/${course.id}`}
                  className="inline-block bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
