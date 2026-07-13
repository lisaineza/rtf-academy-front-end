import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../services/api.js'
import { COURSES as MOCK_COURSES } from '../../data/mockData'
import Button from '../../components/common/Button.jsx'

export default function CourseDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [enrollment, setEnrollment] = useState(null)
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await api.getCourse(id)
        if (!mounted) return
        if (data) {
          setCourse(data)
        } else {
          // try local mock fallback
          const fallback = MOCK_COURSES.find((c) => String(c.id) === String(id) || c.id === Number(id))
          if (fallback) {
            setCourse(fallback)
          }
        }

        // check enrollment status
        try {
          const enr = await api.getEnrollment(id)
          if (mounted) setEnrollment(enr)
        } catch (e) {
          // 404 means not enrolled
        }

        // fetch progress to know completed lesson ids (used for locking)
        try {
          const prog = await api.getCourseProgress(id)
          if (mounted && Array.isArray(prog.completed_lesson_ids)) {
            setCompletedLessonIds(new Set(prog.completed_lesson_ids))
          }
        } catch (e) {
          // ignore progress errors
        }
      } catch (err) {
        console.error('Failed to load course', err)
        // fallback to mock data if available
        const fallback = MOCK_COURSES.find((c) => String(c.id) === String(id) || c.id === Number(id))
        if (fallback && mounted) setCourse(fallback)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  async function handleEnroll() {
    if (!user) return navigate('/login')
    try {
      const res = await api.enroll(id)
      const enr = res.enrollment || res
      setEnrollment(enr)
      // navigate to course page (refresh to show enrolled state)
      window.location.reload()
    } catch (err) {
      console.error('Enroll failed', err)
      alert(err.message || err.detail || 'Failed to enroll')
    }
  }

  if (loading) return <div className="py-10 text-center">Loading…</div>
  if (!course) return <p className="text-center py-10">Course not found.</p>

  const totalLessons = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0)

  function moduleIsComplete(module) {
    const lessonIds = (module.lessons || []).map((l) => l.id)
    return lessonIds.every((id) => completedLessonIds.has(id))
  }

  function moduleLocked(index) {
    // first module never locked
    if (index === 0) return false
    // previous module must be complete
    const prev = course.modules[index - 1]
    return !moduleIsComplete(prev)
  }

  function lessonClick(lesson, locked) {
    if (locked) {
      alert('Complete the previous module first.')
      return
    }
    navigate(`/lessons/${lesson.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/courses`} className="text-sm text-navy mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-bold text-navy mb-1">{course.title}</h1>
      <p className="text-xs text-gray-500 mb-4">{course.modules.length} modules · {totalLessons} lessons</p>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-white shadow-card">
            <p className="font-semibold text-navy mb-2">About this course</p>
            <p className="text-sm text-gray-600">{course.description}</p>
          </div>

          <div className="border border-gray-100 rounded-lg p-4 mb-4 bg-white shadow-card">
            <p className="font-semibold text-navy mb-3">What You will Learn</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              {(course.outcomes || []).map((o) => <li key={o}>{o}</li>)}
            </ul>
          </div>
        </div>

        <aside className="md:col-span-1">
          <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
            <p className="font-semibold text-navy mb-3">Syllabus</p>
            <div className="space-y-3">
              {course.modules.map((m, idx) => {
                const locked = moduleLocked(idx)
                return (
                  <div key={m.id} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">{m.sequence_order}</span>
                        <span className="font-medium text-navy">{m.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">{m.lesson_count} lessons</span>
                    </div>
                    <div className="ml-8 mt-2 space-y-1">
                      {(m.lessons || []).map((lesson) => {
                        const lessonLocked = locked
                        return (
                          <div key={lesson.id} className={`flex items-center justify-between text-gray-600 text-sm ${lessonLocked ? 'opacity-60' : 'hover:text-navy'}`}>
                            <button onClick={() => lessonClick(lesson, lessonLocked)} className="text-left flex-1">
                              {lesson.title} <span className="text-xs text-gray-400">· {lesson.estimated_minutes} min</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              {enrollment ? (
                <Button className="w-full" onClick={() => navigate(`/learn/${course.id}`)}>Continue Learning</Button>
              ) : (
                <Button className="w-full" onClick={handleEnroll}>Enroll Free</Button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
