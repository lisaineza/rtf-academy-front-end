import { Bar, BarChart, ResponsiveContainer, XAxis } from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import { ADMIN_STATS } from '../../data/mockData'
import ProgressBar from '../../components/common/ProgressBar.jsx'

const statusColors = {
  Complete: 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Failed: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { user } = useAuth()

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
