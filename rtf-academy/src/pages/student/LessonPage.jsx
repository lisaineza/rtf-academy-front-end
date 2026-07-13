import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api.js'
import { COURSES as MOCK_COURSES } from '../../data/mockData'
import Button from '../../components/common/Button.jsx'

export default function LessonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completedIds, setCompletedIds] = useState(new Set())

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await api.getLessonDetail(id).catch((err) => { throw err })
        if (!mounted) return
        setLesson(data)
      } catch (err) {
        if (err && err.status === 403) {
          alert(err.message || err.body?.detail || 'This lesson is locked. Complete previous modules first.')
        } else {
          console.warn('getLessonDetail failed, falling back to mock data', err)
          // fallback: find lesson in mock courses
          const found = MOCK_COURSES.find((c) => c.modules?.some((m) => m.lessons?.some((l) => String(l.id) === String(id))))
          if (found) {
            setCourse(found)
            const mod = found.modules.find((m) => m.lessons?.some((l) => String(l.id) === String(id)))
            const les = mod.lessons.find((l) => String(l.id) === String(id))
            setLesson({ ...les, sequence_order: les.sequence_order || 1, estimated_minutes: les.duration_minutes || les.estimated_minutes || 0, text_content: les.description || '' })
          }
        }

        // try to populate course from mock if not set
        if (!course) {
          const fallbackCourse = MOCK_COURSES.find((c) => c.modules?.some((m) => m.lessons?.some((l) => String(l.id) === String(id))))
          if (fallbackCourse) setCourse(fallbackCourse)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && videoRef.current) {
        try { videoRef.current.pause() } catch {}
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    // get course progress if we have a course id
    let mounted = true
    async function loadProgress() {
      if (!course) return
      try {
        const prog = await api.getCourseProgress(String(course.id)).catch(() => null)
        if (!mounted) return
        if (prog && Array.isArray(prog.completed_lesson_ids)) setCompletedIds(new Set(prog.completed_lesson_ids))
      } catch (e) {
        // ignore
      }
    }
    loadProgress()
    return () => { mounted = false }
  }, [course])

  async function markComplete() {
    try {
      const data = await api.completeLesson(id, 0)
      if (data) {
        setCompletedIds((s) => new Set(Array.from(s).concat([id])))
        if (data.course_completed) {
          alert('Course complete!')
          navigate('/certificates')
        }
      }
    } catch (err) {
      console.error('Mark complete failed', err)
      alert(err.message || err.detail || 'Failed to mark complete')
    }
  }

  if (loading) return <div className="py-10 text-center">Loading…</div>
  if (!lesson) return <div className="py-10 text-center">Lesson not found.</div>

  // compute ordering for previous/next using mock course when available
  let prev = null, next = null
  if (course) {
    const flat = []
    course.modules.forEach((m) => (m.lessons || []).forEach((l) => flat.push({ module: m, lesson: l })))
    const idx = flat.findIndex((x) => String(x.lesson.id) === String(id))
    if (idx > 0) prev = flat[idx - 1].lesson
    if (idx < flat.length - 1) next = flat[idx + 1].lesson
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-6">
      <main className="md:col-span-2">
        {lesson.video_s3_url ? (
          <video ref={videoRef} className="w-full rounded-md bg-black" controls src={lesson.video_s3_url} />
        ) : null}

        <h1 className="text-xl font-bold text-navy mt-4">{lesson.title}</h1>
        <p className="text-sm text-gray-500 mb-4">{lesson.estimated_minutes} min</p>
        <div className="prose max-w-none text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: lesson.text_content }} />

        <div className="flex gap-2 mt-6">
          <Button onClick={() => prev ? navigate(`/lessons/${prev.id}`) : null} disabled={!prev}>Previous</Button>
          <Button onClick={() => next ? navigate(`/lessons/${next.id}`) : null} disabled={!next}>Next</Button>
          <div className="flex-1" />
          <Button className="bg-gold text-navy-dark" onClick={markComplete}>Mark as Complete</Button>
        </div>
      </main>

      <aside className="md:col-span-1">
        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
          <h3 className="font-semibold text-navy mb-3">Syllabus</h3>
          <div className="space-y-3 text-sm">
            {(course?.modules || []).map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-navy text-white text-xs flex items-center justify-center">{m.sequence_order || m.order || '?'}</span>
                    <span className="font-medium text-navy">{m.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">{(m.lessons || []).length} lessons</span>
                </div>
                <div className="ml-8 mt-2 space-y-1">
                  {(m.lessons || []).map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-sm text-gray-700">
                      <button onClick={() => navigate(`/lessons/${l.id}`)} className={`text-left flex-1 ${completedIds.has(String(l.id)) ? 'text-green-600' : ''}`}>
                        {l.title}
                      </button>
                      {completedIds.has(String(l.id)) && <span className="text-green-600">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
