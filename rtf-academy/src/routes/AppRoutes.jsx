import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Layouts
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'

// Public pages
import HomePage              from '../pages/HomePage.jsx'
import LoginPage             from '../pages/auth/LoginPage.jsx'
import RegisterPage          from '../pages/auth/RegisterPage.jsx'
import ForgotPasswordPage    from '../pages/auth/ForgotPasswordPage.jsx'
import CertificateVerifyPage from '../pages/CertificateVerifyPage.jsx'

// Student pages
import CourseCatalogPage     from '../pages/student/CourseCatalogPage.jsx'
import CourseDetailPage      from '../pages/student/CourseDetailPage.jsx'
import StudentDashboard      from '../pages/student/StudentDashboard.jsx'
import CoursePage            from '../pages/student/CoursePage.jsx'
import AssessmentPage        from '../pages/student/AssessmentPage.jsx'
import CertificatesPage      from '../pages/student/CertificatesPage.jsx'
import CourseCompletePage    from '../pages/student/CourseCompletePage.jsx'
import EnrollmentSuccessPage from '../pages/student/EnrollmentSuccessPage.jsx'

// Admin pages
import AdminDashboard        from '../pages/admin/AdminDashboard.jsx'
import AdminCourseBuilder    from '../pages/admin/AdminCourseBuilder.jsx'

function WithLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function AppRoutes() {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────── */}
      <Route path="/" element={<WithLayout><HomePage /></WithLayout>} />
      <Route path="/login" element={<WithLayout><LoginPage /></WithLayout>} />
      <Route path="/register" element={<WithLayout><RegisterPage /></WithLayout>} />
      <Route path="/forgot-password" element={<WithLayout><ForgotPasswordPage /></WithLayout>} />
      <Route path="/courses" element={<WithLayout><CourseCatalogPage /></WithLayout>} />
      <Route path="/courses/:id" element={<WithLayout><CourseDetailPage /></WithLayout>} />

      {/* ── Public certificate verification (no login required) ─────── */}
      <Route path="/verify/:code" element={<CertificateVerifyPage />} />

      {/* ── Student (login required) ────────────────────────────────── */}
      <Route path="/dashboard" element={
        <ProtectedRoute><WithLayout><StudentDashboard /></WithLayout></ProtectedRoute>
      } />
      <Route path="/learn/:id" element={
        <ProtectedRoute><WithLayout><CoursePage /></WithLayout></ProtectedRoute>
      } />
      <Route path="/learn/:id/assessment/:moduleId" element={
        <ProtectedRoute><WithLayout><AssessmentPage /></WithLayout></ProtectedRoute>
      } />
      <Route path="/certificates" element={
        <ProtectedRoute><WithLayout><CertificatesPage /></WithLayout></ProtectedRoute>
      } />
      <Route path="/course-complete/:id" element={
        <ProtectedRoute><WithLayout><CourseCompletePage /></WithLayout></ProtectedRoute>
      } />
      <Route path="/enrollment-success/:id" element={
        <ProtectedRoute><WithLayout><EnrollmentSuccessPage /></WithLayout></ProtectedRoute>
      } />

      {/* ── Admin (login + admin role required) ─────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly><WithLayout><AdminDashboard /></WithLayout></ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute adminOnly><WithLayout><AdminCourseBuilder /></WithLayout></ProtectedRoute>
      } />

      {/* ── Fallback ────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
