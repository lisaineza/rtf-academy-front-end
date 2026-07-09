import { Link } from 'react-router-dom'
import { COURSES } from '../data/mockData'

export default function HomePage() {
  return (
    <div>
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
            Learn Without Limits
          </h1>
          <p className="max-w-xl mx-auto text-gray-300 mb-6">
            Access quality education, develop digital skills, and build your future through
            online learning designed for refugee youth and underserved communities.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/register" className="bg-gold text-navy-dark font-semibold px-6 py-2.5 rounded-md">
              Start Learning
            </Link>
            <Link to="/courses" className="border border-gray-500 text-white px-6 py-2.5 rounded-md">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-navy mb-1">Featured Courses</h2>
        <p className="text-gray-500 text-sm mb-6">Free structured courses designed for refugee youth.</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {COURSES.map((course) => (
            <div key={course.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-card bg-white">
              <img src={course.thumbnail} alt={course.title} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="font-semibold text-navy">{course.title}</p>
                <p className="text-xs text-gray-500 mb-3">
                  {course.duration_hours} hours · {course.enrollment_count} enrolled
                </p>
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

      <section className="bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold text-navy mb-4">Why Learn With Us?</h2>
          <p className="text-gray-600 mb-8">
            Raise Them Foundation provides accessible online education opportunities that help
            learners gain knowledge, practical skills, and certificates to support their personal
            and professional growth.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-semibold text-navy">
            <div className="bg-white rounded-lg py-4 shadow-card">Flexible Learning</div>
            <div className="bg-white rounded-lg py-4 shadow-card">Practical Skills</div>
            <div className="bg-white rounded-lg py-4 shadow-card">Progress Tracking</div>
            <div className="bg-white rounded-lg py-4 shadow-card">Verified Certificates</div>
          </div>
        </div>
      </section>

      <section className="bg-navy-dark text-white py-12 text-center">
        <h2 className="font-serif text-2xl font-bold mb-4">Ready to Begin Your Learning Journey?</h2>
        <Link to="/register" className="bg-gold text-navy-dark font-semibold px-6 py-2.5 rounded-md">
          Create Free Account
        </Link>
      </section>
    </div>
  )
}
