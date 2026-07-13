import { Route, Routes } from 'react-router-dom'
import Header from '../components/layout/Header.jsx'
import Footer from '../components/layout/Footer.jsx'
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx'

import HomePage from '../pages/HomePage.jsx'
import RegisterPage from '../pages/auth/RegisterPage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx'

import StudentDashboard from '../pages/student/StudentDashboard.jsx'
import CourseCatalogPage from '../pages/student/CourseCatalogPage.jsx'
import CourseDetailPage from '../pages/student/CourseDetailPage.jsx'
import LessonPage from '../pages/student/LessonPage.jsx'
import EnrollmentSuccessPage from '../pages/student/EnrollmentSuccessPage.jsx'
import CoursePage from '../pages/student/CoursePage.jsx'
import AssessmentPage from '../pages/student/AssessmentPage.jsx'
import CourseCompletePage from '../pages/student/CourseCompletePage.jsx'
import CertificatesPage from '../pages/student/CertificatesPage.jsx'
import VerifyCertificatePage from '../pages/VerifyCertificatePage.jsx'

import AdminDashboard from '../pages/admin/AdminDashboard.jsx'

export default function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/courses" element={<CourseCatalogPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/enrollment-success/:id" element={<ProtectedRoute><EnrollmentSuccessPage /></ProtectedRoute>} />
          <Route path="/learn/:id" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
          <Route path="/lessons/:id" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
          <Route path="/learn/:id/assessment/:moduleId" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
          <Route path="/course-complete/:id" element={<ProtectedRoute><CourseCompletePage /></ProtectedRoute>} />
          <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          <Route path="/verify/:code" element={<VerifyCertificatePage />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-2xl font-bold text-navy mb-2">Page Not Found</h1>
      <p className="text-gray-500">The page you are looking for does not exist or has been moved.</p>
    </div>
  )
}
