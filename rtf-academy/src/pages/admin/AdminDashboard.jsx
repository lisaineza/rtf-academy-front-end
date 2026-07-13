import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { ADMIN_STATS } from '../../data/mockData'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import { api } from '../../services/api.js'
import { COURSES as MOCK_COURSES } from '../../data/mockData'

function AdminCourseForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnail, setThumbnail] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const payload = { title, description, thumbnail_url: thumbnail }
    try {
      const res = await api.createCourse(payload).catch(() => null)
      if (res) onCreate(res)
      else onCreate({ id: Date.now(), title, description, thumbnail_url: thumbnail })
      setTitle(''); setDescription(''); setThumbnail('')
    } catch (err) {
      console.error('Create course failed', err)
      alert('Create failed')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-2 py-1" />
      <input placeholder="Thumbnail URL" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} className="w-full border rounded px-2 py-1" />
      <textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-2 py-1" />
      <button className="bg-navy text-white px-3 py-1 rounded text-sm">Create Course</button>
    </form>
  )
}

const statusColors = {
  Complete: 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Failed: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const data = await api.listCourses().catch(() => [])
        if (!mounted) return
        if (Array.isArray(data) && data.length > 0) setCourses(data)
        else setCourses(MOCK_COURSES.map((c) => ({ id: String(c.id), title: c.title, description: c.description, thumbnail_url: c.thumbnail })))
      } catch (err) {
        console.error('Failed to load courses for admin', err)
        if (mounted) setCourses(MOCK_COURSES.map((c) => ({ id: String(c.id), title: c.title, description: c.description, thumbnail_url: c.thumbnail })))
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-navy mb-6">Hi {user?.full_name?.split(' ')[0] || 'Admin'}</h1>

      <p className="font-semibold text-navy mb-3">Platform Overview</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{ADMIN_STATS.total_users}</p>
          <p className="text-xs text-green-600">{ADMIN_STATS.total_users_growth}</p>
          <p className="text-xs text-gray-500">Total Learners</p>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{ADMIN_STATS.active_courses}</p>
          <p className="text-xs text-gray-500">Active courses</p>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{ADMIN_STATS.average_completion_rate}%</p>
          <p className="text-xs text-green-600">{ADMIN_STATS.average_completion_growth}</p>
          <p className="text-xs text-gray-500">Avg completion</p>
        </div>
        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
          <p className="text-2xl font-bold text-navy">{ADMIN_STATS.certificates_issued}</p>
          <p className="text-xs text-green-600">{ADMIN_STATS.certificates_growth}</p>
          <p className="text-xs text-gray-500">Certificates</p>
        </div>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="font-semibold text-navy text-sm">Monthly Enrolments</p>
          <span className="text-xs text-gray-400">Last 6 Months</span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={ADMIN_STATS.monthly_enrollments}>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Bar dataKey="enrollments" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card mb-6">
        <p className="font-semibold text-navy text-sm mb-3">Course Performance</p>
        <div className="space-y-3">
          {ADMIN_STATS.course_performance.map((c) => (
            <div key={c.title}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{c.title}</span><span>{c.completion}%</span>
              </div>
              <ProgressBar percent={c.completion} color="bg-blue-700" />
            </div>
          ))}
        </div>
      </div>

        <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card mt-6">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-navy text-sm">Manage Courses</p>
          </div>
          <div className="mb-4">
            <AdminCourseForm onCreate={(c) => setCourses((s) => [c, ...s])} />
          </div>
          <div className="space-y-2">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white border border-gray-100 rounded px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-navy">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => {
                    if (!confirm('Delete this course?')) return
                    try {
                      await api.deleteCourse(c.id).catch(() => null)
                      setCourses((s) => s.filter((x) => String(x.id) !== String(c.id)))
                    } catch (err) { console.error('Delete failed', err); alert('Delete failed') }
                  }} className="text-sm text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      <div className="border border-gray-100 rounded-lg p-4 bg-white shadow-card">
        <p className="font-semibold text-navy text-sm mb-3">Recent Learner Activity</p>
        <div className="space-y-3">
          {ADMIN_STATS.recent_activity.map((a) => (
            <div key={a.name} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-navy">{a.name}</p>
                <p className="text-xs text-gray-500">{a.course} - {a.progress}%</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[a.status]}`}>{a.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
