import { Link, useNavigate, useParams } from 'react-router-dom'
import { COURSES } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import Button from '../../components/common/Button.jsx'

export default function CourseDetailPage() {
  const { id } = useParams()
  const course = COURSES.find((c) => c.id === Number(id))
  const { user } = useAuth()
  const { enroll, isEnrolled } = useProgress()
  const navigate = useNavigate()

  if (!course) return <p className="text-center py-10">Course not found.</p>

  const totalLessons = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)

  function handleEnroll() {
    if (!user) return navigate('/login')
    enroll(course.id)
    navigate(`/enrollment-success/${course.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/courses`} className="text-sm text-navy mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-navy mb-1">{course.subtitle}</h1>
      <p className="text-xs text-gray-500 mb-4">
        {course.modules.length} modules · {totalLessons} lessons · {course.duration_hours} hours ·{' '}
        <span className="text-gold-dark font-medium">{course.level}</span> · {course.enrollment_count} Enrolled
      </p>

      <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-white shadow-card">
        <p className="font-semibold text-navy mb-2">About this course</p>
        <p className="text-sm text-gray-600">{course.description}</p>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-white shadow-card">
        <p className="font-semibold text-navy mb-2">What You will Learn</p>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          {course.outcomes.map((o) => <li key={o}>{o}</li>)}
        </ul>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 mb-6 bg-white shadow-card">
        <p className="font-semibold text-navy mb-3">Course Module</p>
        <div className="space-y-2">
          {course.modules.map((m) => (
            <div key={m.id} className="flex items-center gap-3 text-sm">
              <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">
                {m.order}
              </span>
              <span className="text-gray-700">{m.title} · {m.lessons?.length || 0} lessons</span>
            </div>
          ))}
        </div>
      </div>

      {isEnrolled(course.id) ? (
        <Button className="w-full" onClick={() => navigate(`/learn/${course.id}`)}>Go to Course</Button>
      ) : (
        <Button className="w-full" onClick={handleEnroll}>Enroll Now</Button>
      )}
    </div>
  )
}
