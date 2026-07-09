import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { COURSES } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'
import Button from '../../components/common/Button.jsx'
import logo from '../../assets/logo.png'

export default function CourseCompletePage() {
  const { id } = useParams()
  const course = COURSES.find((c) => c.id === Number(id))
  const { user } = useAuth()
  const { getEnrollment, generateCertificate } = useProgress()
  const [cert, setCert] = useState(null)

  useEffect(() => {
    const enr = getEnrollment(Number(id))
    if (enr?.certificate) {
      setCert(enr.certificate)
    } else if (enr?.progress_percent >= 100) {
      setCert(generateCertificate(Number(id), user?.full_name || 'Learner'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!course) return null

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-center">
      <div className="bg-green-100 text-green-700 rounded-md py-3 mb-6 font-medium">
        Course Completed Successfully!
      </div>

      <div className="border-2 border-gold rounded-lg p-6 bg-white shadow-card">
        <img src={logo} alt="Raise Them Foundation" className="h-10 w-auto mx-auto mb-2" />
        <p className="text-xs text-gray-400 mb-4">RTF E-learning Platform</p>
        <p className="text-xs text-gray-500">This is To Certify That</p>
        <p className="font-serif text-lg font-bold text-navy my-1">{user?.full_name || 'Learner'}</p>
        <p className="text-xs text-gray-500">Has successfully finished the course</p>
        <p className="font-semibold text-gold-dark my-2">{course.title}</p>
        <p className="text-xs text-gray-400">
          {course.modules.length} Modules, {course.duration_hours} Lessons · {cert?.issued_date}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Link to="/certificates"><Button className="w-full">View My Certificates</Button></Link>
        <Link to="/dashboard"><Button variant="outline" className="w-full">Back to Dashboard</Button></Link>
      </div>
    </div>
  )
}
