
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useProgress } from '../../context/ProgressContext.jsx'

export default function CourseCatalogPage() {
  const { getToken } = useAuth()
  const { isEnrolled } = useProgress()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        const data = await api.listCourses(token)
        setCourses(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Failed to load courses. Please try again.')
      }
      setLoading(false)
    }
    load()
  }, [getToken])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-1">Courses</h1>
      <p className="text-gray-500 text-sm mb-6">Browse available programs and enroll for free.</p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {courses.map((course) => (
            // CHANGED: border-gray-100 is now border-[#D19A30]
            <div key={course.id} className="border border-[#D19A30] rounded-lg overflow-hidden shadow-card bg-white">
              {course.thumbnail_url
                ? <img src={course.thumbnail_url} alt={course.title} className="h-36 w-full object-cover" />
                : <div className="h-36 bg-navy flex items-center justify-center text-white text-sm font-semibold px-3 text-center">{course.title}</div>
              }
              <div className="p-4">
                <p className="font-semibold text-navy">{course.title}</p>
                <p className="text-xs text-gray-500 mb-1 line-clamp-2">{course.description}</p>
                <p className="text-xs text-gray-400 mb-3">{course.module_count || 0} modules · {course.total_lessons || 0} lessons</p>
                {isEnrolled(course.id) ? (
                  // CHANGED: bg-green-700 text-white is now bg-[#D19A30] text-navy
                  <Link to={`/learn/${course.id}`} className="inline-block bg-[#D19A30] text-navy hover:bg-opacity-90 transition-opacity text-xs font-semibold px-4 py-2 rounded-md">
                    Continue Learning
                  </Link>
                ) : (
                  <Link to={`/courses/${course.id}`} className="inline-block bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md">
                    View Course
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}