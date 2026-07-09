import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { COURSES, SAMPLE_ASSESSMENT } from '../../data/mockData'
import { useProgress } from '../../context/ProgressContext.jsx'
import QuizIntegrityWrapper from '../../components/assessment/QuizIntegrityWrapper.jsx'
import QuizTimer from '../../components/assessment/QuizTimer.jsx'
import Button from '../../components/common/Button.jsx'

export default function AssessmentPage() {
  const { id, moduleId } = useParams()
  const course = COURSES.find((c) => c.id === Number(id))
  const { completeLesson, logIntegrityEvent } = useProgress()
  const navigate = useNavigate()

  const assessment = SAMPLE_ASSESSMENT // in production: GET /assessments/module/{moduleId}
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  function handleAnswer(qId, value) {
    setAnswers((a) => ({ ...a, [qId]: value }))
  }

  function handleSubmit(flagged) {
    // Mirrors POST /assessments/{id}/submit — scoring stubbed client-side.
    const score = Math.round((Object.keys(answers).length / assessment.questions.length) * 100)
    const passed = score >= assessment.passing_threshold
    setResult({ score, passed, flagged })
    setSubmitted(true)
    if (passed) {
      const module = course.modules.find((m) => m.id === Number(moduleId))
      const quizLesson = module?.lessons.find((l) => l.type === 'quiz')
      if (quizLesson) completeLesson(course.id, quizLesson.id)
    }
  }

  if (!course) return null

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {result.passed ? '✓' : '✕'}
        </div>
        <h1 className="text-xl font-bold text-navy mb-1">
          {result.passed ? 'Quiz submitted successfully!' : 'Please review the lesson and try again.'}
        </h1>
        <p className="text-sm text-gray-500 mb-2">Score: {result.score}% (passing: {assessment.passing_threshold}%)</p>
        {result.flagged && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-md px-3 py-2 mb-4">
            This attempt was flagged for facilitator review due to activity detected during the quiz.
          </p>
        )}
        <Button onClick={() => navigate(`/learn/${course.id}`)} className="mt-4">Back to Course</Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-navy">{assessment.title}</h1>
        <QuizTimer minutes={assessment.time_limit_minutes} onExpire={() => handleSubmit(false)} />
      </div>

      <QuizIntegrityWrapper
        onViolation={(type) => logIntegrityEvent(course.id, { type, assessment_id: assessment.assessment_id })}
      >
        {({ violations, flagged }) => (
          <div>
            <div className="space-y-5 mb-6">
              {assessment.questions.map((q, idx) => (
                <div key={q.id} className="bg-white border border-gray-100 rounded-lg p-4 shadow-card">
                  <p className="font-medium text-navy text-sm mb-3">{idx + 1}. {q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === opt}
                          onChange={() => handleAnswer(q.id, opt)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => handleSubmit(flagged)} className="w-full">Submit Assessment</Button>
          </div>
        )}
      </QuizIntegrityWrapper>
    </div>
  )
}
