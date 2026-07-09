import { Link } from 'react-router-dom'
import { COURSES } from '../../data/mockData'

export default function CourseCatalogPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-1">Courses</h1>
      <p className="text-gray-500 text-sm mb-6">Browse available programs and enroll for free.</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
        {COURSES.map((course) => (
          <div key={course.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
            <img src={course.thumbnail} alt={course.title} className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="font-semibold text-navy">{course.title}</p>
              <p className="text-xs text-gray-500 mb-3">
                {course.duration_hours} hours · {course.enrollment_count} enrolled · {course.level}
              </p>
              <Link to={`/courses/${course.id}`} className="inline-block bg-navy text-white text-xs font-semibold px-4 py-2 rounded-md">
                View Course
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
