import { Link, useParams } from 'react-router-dom'
import { COURSES } from '../../data/mockData'
import Button from '../../components/common/Button.jsx'

export default function EnrollmentSuccessPage() {
  const { id } = useParams()
  const course = COURSES.find((c) => c.id === Number(id))
  if (!course) return null

  const totalLessons = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)

  return (
    <div className="max-w-sm mx-auto px-4 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 text-3xl flex items-center justify-center mx-auto mb-4">
        ✓
      </div>
      <h1 className="text-xl font-bold text-navy mb-1">You're Enrolled!</h1>
      <p className="text-sm text-gray-500 mb-6">
        You have successfully enrolled in <span className="font-medium text-navy">{course.subtitle}</span>
      </p>

      <div className="border border-gray-100 rounded-lg p-4 text-left text-sm mb-6 bg-white shadow-card">
        <p className="font-semibold text-navy mb-3">Your Enrolment Summary</p>
        <div className="flex justify-between py-1"><span className="text-gray-500">Course</span><span>{course.title}</span></div>
        <div className="flex justify-between py-1"><span className="text-gray-500">Module</span><span>{course.modules.length} Mod - {totalLessons} Les</span></div>
        <div className="flex justify-between py-1"><span className="text-gray-500">Duration</span><span>~{course.duration_hours} Hours</span></div>
        <div className="flex justify-between py-1"><span className="text-gray-500">Certification</span><span className="text-green-600">Included On Completion</span></div>
      </div>

      <div className="space-y-3">
        <Link to={`/learn/${course.id}`}>
          <Button className="w-full">Start Learning →</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="outline" className="w-full">Go to My Dashboard</Button>
        </Link>
      </div>
    </div>
  )
}
