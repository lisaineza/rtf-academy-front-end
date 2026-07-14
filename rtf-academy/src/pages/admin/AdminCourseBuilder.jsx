import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {type === 'textarea'
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            rows={3} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy" />
        : <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy" />
      }
    </div>
  )
}

export default function AdminCourseBuilder() {
  const { getToken } = useAuth()
  const [courses, setCourses]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [expandedCourse, setExpanded] = useState(null)
  const [error, setError]             = useState('')
  const [saving, setSaving]           = useState(false)

  // Course form
  const [newCourse, setNewCourse] = useState({ title: '', description: '', is_published: true })
  // Module form per course
  const [newModule, setNewModule] = useState({})
  // Lesson form per module
  const [newLesson, setNewLesson] = useState({})

  async function refresh() {
    const token = await getToken()
    const data = await api.listCourses(token)
    // Fetch full detail for each course to get modules
    const full = await Promise.all(
      (Array.isArray(data) ? data : []).map((c) => api.getCourse(c.id, token))
    )
    setCourses(full)
  }

  useEffect(() => {
    refresh().catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])

  async function handleCreateCourse() {
    if (!newCourse.title.trim()) return
    setSaving(true)
    try {
      const token = await getToken()
      await api.createCourse(newCourse, token)
      setNewCourse({ title: '', description: '', is_published: true })
      await refresh()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  async function handleDeleteCourse(id) {
    if (!window.confirm('Delete this course and all its content?')) return
    const token = await getToken()
    await api.deleteCourse(id, token).catch((e) => setError(e.message))
    await refresh()
  }

  async function handleCreateModule(courseId) {
    const title = (newModule[courseId] || '').trim()
    if (!title) return
    const course = courses.find((c) => c.id === courseId)
    const seq = (course?.modules?.length || 0) + 1
    setSaving(true)
    try {
      const token = await getToken()
      await api.createModule(courseId, { title, sequence_order: seq }, token)
      setNewModule((p) => ({ ...p, [courseId]: '' }))
      await refresh()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  async function handleCreateLesson(moduleId, courseId) {
    const key = `${courseId}_${moduleId}`
    const state = newLesson[key] || {}
    if (!state.title?.trim()) return
    const course = courses.find((c) => c.id === courseId)
    const mod = (course?.modules || []).find((m) => m.id === moduleId)
    const seq = (mod?.lessons?.length || 0) + 1
    setSaving(true)
    try {
      const token = await getToken()
      await api.createLesson(moduleId, {
        title: state.title,
        text_content: state.text_content || '',
        video_s3_url: state.video_s3_url || null,
        sequence_order: seq,
        estimated_minutes: parseInt(state.estimated_minutes) || 10,
      }, token)
      setNewLesson((p) => ({ ...p, [key]: {} }))
      await refresh()
    } catch (e) { setError(e.message) }
    setSaving(false)
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Loading…</p>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-navy">Course Builder</h1>
        <Link to="/admin" className="text-sm text-navy underline">← Dashboard</Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error} <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Create new course */}
      <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card mb-6">
        <p className="font-semibold text-navy mb-3">Create New Course</p>
        <Field label="Title" value={newCourse.title} onChange={(v) => setNewCourse((p) => ({ ...p, title: v }))} placeholder="Course title" />
        <Field label="Description" value={newCourse.description} onChange={(v) => setNewCourse((p) => ({ ...p, description: v }))} type="textarea" placeholder="Brief description" />
        <label className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <input type="checkbox" checked={newCourse.is_published} onChange={(e) => setNewCourse((p) => ({ ...p, is_published: e.target.checked }))} />
          Publish immediately
        </label>
        <Button onClick={handleCreateCourse} disabled={saving || !newCourse.title.trim()}>
          {saving ? 'Saving…' : 'Create Course'}
        </Button>
      </div>

      {/* Existing courses */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="border border-gray-100 rounded-lg bg-white shadow-card">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-navy">{course.title}</p>
                <p className="text-xs text-gray-400">{(course.modules || []).length} modules · {(course.modules || []).reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpanded(expandedCourse === course.id ? null : course.id)}
                  className="text-xs border border-navy text-navy px-3 py-1.5 rounded-md font-semibold"
                >
                  {expandedCourse === course.id ? 'Collapse' : 'Edit Content'}
                </button>
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="text-xs border border-red-300 text-red-600 px-3 py-1.5 rounded-md font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>

            {expandedCourse === course.id && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Existing modules */}
                {(course.modules || []).map((mod) => {
                  const lessonKey = `${course.id}_${mod.id}`
                  const ls = newLesson[lessonKey] || {}
                  return (
                    <div key={mod.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-navy text-sm mb-2">📦 {mod.title}</p>
                      {(mod.lessons || []).map((l) => (
                        <p key={l.id} className="text-xs text-gray-500 ml-4 mb-1">• {l.title} ({l.estimated_minutes || 0}m)</p>
                      ))}
                      {/* Add lesson form */}
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-500 mb-2">Add Lesson</p>
                        <Field label="Title" value={ls.title || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, title: v } }))} placeholder="Lesson title" />
                        <Field label="Content" value={ls.text_content || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, text_content: v } }))} type="textarea" placeholder="Lesson text content" />
                        <Field label="Video URL" value={ls.video_s3_url || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, video_s3_url: v } }))} placeholder="e.g., https://your-bucket.s3.amazonaws.com/vid.mp4" />
                        <Field label="Duration (minutes)" value={ls.estimated_minutes || ''} onChange={(v) => setNewLesson((p) => ({ ...p, [lessonKey]: { ...ls, estimated_minutes: v } }))} type="number" placeholder="10" />
                        <Button onClick={() => handleCreateLesson(mod.id, course.id)} disabled={saving || !(ls.title || '').trim()}>
                          Add Lesson
                        </Button>
                      </div>
                    </div>
                  )
                })}

                {/* Add module form */}
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Add Module</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Module title"
                      value={newModule[course.id] || ''}
                      onChange={(e) => setNewModule((p) => ({ ...p, [course.id]: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-navy"
                    />
                    <Button onClick={() => handleCreateModule(course.id)} disabled={saving}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
