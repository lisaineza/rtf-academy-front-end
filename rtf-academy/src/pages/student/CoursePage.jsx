import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { COURSES } from '../../data/mockData'
import { useProgress } from '../../context/ProgressContext.jsx'
import ProgressBar from '../../components/common/ProgressBar.jsx'
import Button from '../../components/common/Button.jsx'

export default function CoursePage() {
  const { id } = useParams()
  const course = COURSES.find((c) => c.id === Number(id))
  const { getEnrollment, completeLesson, generateCertificate } = useProgress()
  const navigate = useNavigate()

  const extractYouTubeVideoId = (url) => {
    if (!url) return null
    // Handle youtu.be short URLs
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0]
    }
    // Handle youtube.com/shorts
    if (url.includes('youtube.com/shorts/')) {
      return url.split('youtube.com/shorts/')[1].split('?')[0]
    }
    // Handle regular youtube.com URLs
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/v=([^&]+)/)
      return match ? match[1] : null
    }
    return null
  }

  const flatLessons = useMemo(
    () => course?.modules.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, moduleId: m.id, moduleTitle: m.title }))) || [],
    [course]
  )
  const [currentLessonId, setCurrentLessonId] = useState(flatLessons[0]?.id)

  if (!course) return <p className="text-center py-10">Course not found.</p>

  const enrollment = getEnrollment(course.id)
  if (!enrollment) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        <p className="mb-4 text-gray-600">You're not enrolled in this course yet.</p>
        <Link to={`/courses/${course.id}`}><Button>View Course</Button></Link>
      </div>
    )
  }

  const currentLesson = flatLessons.find((l) => l.id === currentLessonId) || flatLessons[0]
  const currentIndex = flatLessons.findIndex((l) => l.id === currentLesson?.id)
  const isCompleted = (lessonId) => enrollment.completed_lessons.includes(lessonId)

  function handleMarkComplete() {
    if (currentLesson.type === 'quiz') {
      navigate(`/learn/${course.id}/assessment/${currentLesson.moduleId}`)
      return
    }
    completeLesson(course.id, currentLesson.id)
  }

  function goNext() {
    const next = flatLessons[currentIndex + 1]
    if (next) setCurrentLessonId(next.id)
  }
  function goPrev() {
    const prev = flatLessons[currentIndex - 1]
    if (prev) setCurrentLessonId(prev.id)
  }

  const courseComplete = enrollment.progress_percent >= 100

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-2">
        <Link to="/dashboard" className="text-sm text-navy">← Back</Link>
        <h1 className="font-semibold text-navy text-sm">{course.title}</h1>
        <div className="w-8" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500">Progress</span>
        <ProgressBar percent={enrollment.progress_percent} />
        <span className="text-xs text-gray-500">{enrollment.progress_percent}%</span>
      </div>

      <div className="rounded-lg overflow-hidden mb-4 bg-black">
        {currentLesson?.video_url ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0"
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${extractYouTubeVideoId(currentLesson.video_url)}`}
              title={currentLesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="bg-green-800 h-40 flex items-center justify-center text-white">
            <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">▶</div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="font-semibold text-navy mb-1">{currentLesson?.title}</p>
        <p className="text-sm text-gray-600 mb-3">
          Lesson content for "{currentLesson?.title}" appears here — video, reading, or activity.
        </p>
        <Button onClick={handleMarkComplete} disabled={isCompleted(currentLesson?.id)}>
          {currentLesson?.type === 'quiz'
            ? 'Take Quiz'
            : isCompleted(currentLesson?.id)
              ? 'Completed ✓'
              : 'Mark as completed'}
        </Button>
      </div>

      <div className="space-y-3 mb-6">
        {course.modules.map((m) => (
          <div key={m.id} className={`border rounded-lg p-3 ${m.locked ? 'opacity-50' : ''}`}>
            <p className="font-medium text-navy text-sm mb-2">
              {m.locked ? '🔒 ' : ''}Module {m.order}: {m.title}
            </p>
            {!m.locked && (
              <ul className="space-y-1">
                {(m.lessons || []).map((l) => (
                  <li key={l.id}>
                    <button
                      onClick={() => setCurrentLessonId(l.id)}
                      className={`text-xs w-full text-left px-2 py-1 rounded ${
                        currentLesson?.id === l.id ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isCompleted(l.id) ? '✓ ' : ''}{l.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {courseComplete && (
        <div className="mb-6">
          <Link to={`/course-complete/${course.id}`}>
            <Button variant="gold" className="w-full">View Completion Certificate 🎓</Button>
          </Link>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={goPrev} disabled={currentIndex === 0} className="text-sm text-gray-500 disabled:opacity-40">
          Previous
        </button>
        <button onClick={goNext} disabled={currentIndex === flatLessons.length - 1} className="text-sm font-semibold text-navy disabled:opacity-40">
          Next
        </button>
      </div>
    </div>
  )
}
