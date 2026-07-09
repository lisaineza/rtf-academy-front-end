import { COURSES } from '../../data/mockData'
import { useProgress } from '../../context/ProgressContext.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'

export default function CertificatesPage() {
  const { allEnrollments } = useProgress()
  const enrollments = allEnrollments()
  const earned = enrollments.filter((e) => e.certificate)
  const inProgress = enrollments.filter((e) => !e.certificate && e.progress_percent < 100)

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-6">My Certificates</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-gray-100 rounded-lg text-center py-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{earned.length}</p>
          <p className="text-xs text-gray-500">Certificate Earned</p>
        </div>
        <div className="border border-gray-100 rounded-lg text-center py-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{inProgress.length}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="font-semibold text-navy mb-3">Earned Certificates</h2>
        {earned.length === 0 && <p className="text-sm text-gray-400">Complete a course to earn your first certificate.</p>}
        <div className="space-y-2">
          {earned.map((e) => {
            const course = COURSES.find((c) => c.id === e.course_id)
            return (
              <div key={e.course_id} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <span>📄</span>
                <div>
                  <p className="text-sm font-medium text-navy">{course?.title}</p>
                  <p className="text-xs text-gray-400">Completed · {e.certificate.code}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-navy mb-3">Courses In Progress</h2>
        <div className="space-y-3">
          {inProgress.map((e) => {
            const course = COURSES.find((c) => c.id === e.course_id)
            return (
              <div key={e.course_id} className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-navy w-1/3">{course?.title}</p>
                <div className="flex-1"><ProgressBar percent={e.progress_percent} /></div>
                <span className="text-xs text-gray-500">{e.progress_percent}%</span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
