import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { COURSES as MOCK_COURSES } from '../../data/mockData'
import { useProgress } from '../../context/ProgressContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrolledIds, setEnrolledIds] = useState(new Set())
  const { user } = useAuth()
  const { enroll: localEnroll } = useProgress()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await api.listCourses()
        if (!mounted) return
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data)
        } else {
          // fallback to mock data shaped like the API
          const shaped = MOCK_COURSES.map((c) => ({
            id: String(c.id),
            title: c.title,
            description: c.description,
            thumbnail_url: c.thumbnail,
            module_count: c.modules?.length || 0,
            total_lessons: c.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0,
            is_published: true,
          }))
          setCourses(shaped)
        }

        if (user) {
          const enrolls = await api.listEnrollments().catch(() => [])
          if (!mounted) return
          setEnrolledIds(new Set(enrolls.map((e) => e.course)))
        }
      } catch (err) {
        console.error('Failed to load courses', err)
        // network error: use mock courses
        const shaped = MOCK_COURSES.map((c) => ({
          id: String(c.id),
          title: c.title,
          description: c.description,
          thumbnail_url: c.thumbnail,
          module_count: c.modules?.length || 0,
          total_lessons: c.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0,
          is_published: true,
        }))
        if (mounted) setCourses(shaped)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [user])

  async function handleEnroll(courseId) {
    try {
      const res = await api.enroll(courseId)
      // API may return either the enrollment directly (201) or a wrapper (200)
      const enrollment = res.enrollment || res
      const enrolledCourseId = enrollment.course?.id || enrollment.course
      if (enrolledCourseId) {
        setEnrolledIds((s) => new Set(Array.from(s).concat([enrolledCourseId])))
        navigate(`/courses/${enrolledCourseId}`)
      }
    } catch (err) {
      console.error('Enroll failed', err)
      // Network error or backend down — fallback to local demo enroll
      if (!err.status) {
        // call local progress enroll and navigate
        try {
          localEnroll(courseId)
          setEnrolledIds((s) => new Set(Array.from(s).concat([courseId])))
          navigate(`/courses/${courseId}`)
          return
        } catch (e) {
          console.error('Local enroll fallback failed', e)
        }
      }
      alert(err.message || err.detail || 'Failed to enroll')
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-8">Loading courses…</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-1">Courses</h1>
      <p className="text-gray-500 text-sm mb-6">Browse available programs and enroll for free.</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {courses.map((course) => (
          <div key={course.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
            <img src={course.thumbnail_url} alt={course.title} className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="font-semibold text-navy">{course.title}</p>
              <p className="text-xs text-gray-500 mb-3">{course.description}</p>
              <p className="text-xs text-gray-400 mb-3">{course.module_count} modules · {course.total_lessons} lessons</p>
              {enrolledIds.has(course.id) ? (
                <Link to={`/courses/${course.id}`} className="inline-block bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md">
                  Continue Learning
                </Link>
              ) : (
                <button onClick={() => handleEnroll(course.id)} className="inline-block bg-gold text-navy-dark text-xs font-semibold px-4 py-2 rounded-md">
                  Enroll Free
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
