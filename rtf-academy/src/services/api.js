// Thin fetch wrapper around the RTF Academy backend.
//
// IMPORTANT: set VITE_API_BASE_URL in .env to your backend's real API prefix.
// A bare Render URL (e.g. https://rtf-academy-backend.onrender.com/) almost
// always 404s at "/" for a Django app — that's expected, nothing is routed
// at the root. Check your Django urls.py for the actual prefix (commonly
// /api/ or /api/v1/) and put THAT in VITE_API_BASE_URL, e.g.:
//   VITE_API_BASE_URL=http://localhost:8000/api/v1
//
// Also note: Render's free tier spins down idle services. The first request
// after inactivity can take 30-60s while it wakes up — that's not a bug.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

let activeToken = null

export function setApiAuthToken(token) {
  activeToken = token || null
}

export function clearApiAuthToken() {
  activeToken = null
}

async function request(path, { method = 'GET', body, token, params } = {}) {
  if (!BASE_URL) {
    throw new ApiError('VITE_API_BASE_URL is not set — see .env.example', 0, null)
  }
  const url = new URL(path.replace(/^\//, ''), BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/')
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v))

  const resolvedToken = token ?? activeToken
  const headers = { 'Content-Type': 'application/json' }
  if (resolvedToken) headers.Authorization = `Bearer ${resolvedToken}`

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = null
  try {
    data = await res.json()
  } catch {
    // no JSON body
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data)
  }
  return data
}

export const api = {
  // Auth & users — Firebase authentication + current user profile
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/users/me/', { token }),

  // Courses — supports both ID formats (UUID string or integer)
  listCourses: (params) => request('/courses/', { params }),
  getCourse: (id) => request(`/courses/${id}/`),
  createCourse: (payload, token) => request('/courses/', { method: 'POST', body: payload, token }),
  deleteCourse: (id, token) => request(`/courses/${id}/`, { method: 'DELETE', token }),
  getLessonDetail: (lessonId, token) => request(`/courses/lessons/${lessonId}/`, { token }),

  // Enrollments — Django REST router generates list/create/retrieve/update/delete
  enroll: (courseId, token) => request('/enrollments/', { method: 'POST', body: { course: courseId }, token }),
  listEnrollments: (token) => request('/enrollments/', { token }),
  getEnrollment: (courseId, token) => request(`/enrollments/${courseId}/`, { token }),

  // Progress — mirrors /progress/*
  completeLesson: (lessonId, watchTimeSeconds, token) =>
    request('/progress/lesson/', { method: 'POST', body: { lesson_id: lessonId, watch_time_seconds: watchTimeSeconds }, token }),
  getCourseProgress: (courseId, token) => request(`/progress/course/${courseId}/`, { token }),

  // Assessments — mirrors /assessments/*
  getModuleAssessment: (moduleId, token) => request(`/assessments/module/${moduleId}/`, { token }),
  submitAssessment: (assessmentId, payload, token) =>
    request(`/assessments/${assessmentId}/submit/`, { method: 'POST', body: payload, token }),

  // Certificates — mirrors /certificates/*
  generateCertificate: (courseId, token) => request(`/certificates/generate/${courseId}/`, { method: 'POST', token }),
  myCertificates: (token) => request('/certificates/my/', { token }),
  verifyCertificate: (code) => request(`/certificates/verify/${code}/`),
  downloadCertificate: (certId, token) => request(`/certificates/download/${certId}/`, { token }),

  // Admin — mirrors /admin/*
  adminStats: (token) => request('/admin/stats/', { token }),
}

export { ApiError }
