import { createContext, useContext, useEffect, useState } from 'react'
import { COURSES } from '../data/mockData'

const ProgressContext = createContext(null)
const STORAGE_KEY = 'rtf_academy_progress'

// Shape per course_id:
// {
//   enrolled_at, progress_percent, completed_lessons: [], status,
//   certificate: null | { code, issued_date },
//   integrity_log: [{ type, timestamp }]   <- assessment integrity events
// }

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : {}
}

export function ProgressProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // Mirrors POST /enrollments
  function enroll(courseId) {
    setState((prev) => {
      if (prev[courseId]) return prev
      return {
        ...prev,
        [courseId]: {
          enrolled_at: new Date().toISOString(),
          progress_percent: 0,
          completed_lessons: [],
          status: 'active',
          certificate: null,
          integrity_log: [],
        },
      }
    })
  }

  function isEnrolled(courseId) {
    return Boolean(state[courseId])
  }

  function getEnrollment(courseId) {
    return state[courseId] || null
  }

  // Mirrors POST /progress/lesson
  function completeLesson(courseId, lessonId) {
    setState((prev) => {
      const course = COURSES.find((c) => c.id === Number(courseId))
      const totalLessons = course
        ? course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 1
        : 1
      const entry = prev[courseId] || {
        enrolled_at: new Date().toISOString(),
        progress_percent: 0,
        completed_lessons: [],
        status: 'active',
        certificate: null,
        integrity_log: [],
      }
      const completed = entry.completed_lessons.includes(lessonId)
        ? entry.completed_lessons
        : [...entry.completed_lessons, lessonId]
      const progress_percent = Math.min(100, Math.round((completed.length / totalLessons) * 100))
      return {
        ...prev,
        [courseId]: {
          ...entry,
          completed_lessons: completed,
          progress_percent,
          status: progress_percent >= 100 ? 'completed' : 'active',
        },
      }
    })
  }

  // Mirrors POST /certificates/generate/{course_id}
  function generateCertificate(courseId, learnerName) {
    let cert = null
    setState((prev) => {
      const entry = prev[courseId]
      if (!entry || entry.progress_percent < 100 || entry.certificate) return prev
      cert = {
        code: `RTF-2026-CERT-${String(courseId).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
        issued_date: new Date().toISOString().slice(0, 10),
        learner_name: learnerName,
      }
      return { ...prev, [courseId]: { ...entry, certificate: cert } }
    })
    return cert
  }

  // Records an assessment-integrity event (tab switch, paste attempt, etc.)
  // so admins/facilitators have a light audit trail for that submission.
  function logIntegrityEvent(courseId, event) {
    setState((prev) => {
      const entry = prev[courseId]
      if (!entry) return prev
      return {
        ...prev,
        [courseId]: {
          ...entry,
          integrity_log: [...entry.integrity_log, { ...event, timestamp: new Date().toISOString() }],
        },
      }
    })
  }

  function allEnrollments() {
    return Object.entries(state).map(([courseId, data]) => ({
      course_id: Number(courseId),
      ...data,
    }))
  }

  return (
    <ProgressContext.Provider
      value={{
        enroll,
        isEnrolled,
        getEnrollment,
        completeLesson,
        generateCertificate,
        logIntegrityEvent,
        allEnrollments,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider')
  return ctx
}
