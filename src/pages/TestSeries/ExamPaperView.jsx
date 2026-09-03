import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiDownload } from 'react-icons/fi'
import { examQuestionService, examService, questionService } from '../../api/services.js'

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || data?.data || []
const questionOf = (row) => typeof row.question === 'object' ? row.question : row
const questionIdOf = (row) => row.questionId ?? row.question?.id ?? row.question?.questionId ?? row.id
const errorOf = (error) => String(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Could not load this paper.')
const optionKeys = ['A', 'B', 'C', 'D']

function QuestionBlock({ row, answerSheet }) {
  const question = questionOf(row)
  return <article className="exam-question-block"><h3>Question {row.sequence || row.questionNumber || ''} - {question.questionType || 'MCQ'} ({row.marks || 1} mark)</h3><p>{question.question || question.text || '-'}</p>{question.questionType !== 'DESCRIPTIVE' && <div className="exam-options">{optionKeys.map((key) => <div key={key} className={answerSheet && question.correctAnswer === key ? 'correct-option' : ''}>{key}. {question[`option${key}`] || '-'}</div>)}</div>}{answerSheet && question.correctAnswer && <div className="exam-answer">Correct Answer: {question.correctAnswer}</div>}{answerSheet && question.answerExplanation && <div className="exam-explanation">Explanation: {question.answerExplanation}</div>}</article>
}

export default function ExamPaperView({ mode = 'paper' }) {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const examData = await examService.getById(examId)
        setExam(examData)
        if (mode === 'ranking') setRows(rowsOf(await examService.getRanking(examId)))
        else {
          const [assignedData, questionData] = await Promise.all([examQuestionService.getAll(examId), questionService.getAll()])
          const questions = rowsOf(questionData)
          setRows(rowsOf(assignedData).map((row) => {
            const question = typeof row.question === 'object' ? row.question : questions.find((item) => String(item.id) === String(questionIdOf(row)))
            return question ? { ...row, question } : row
          }))
        }
      } catch (loadError) { setError(errorOf(loadError)) } finally { setLoading(false) }
    }
    load()
  }, [examId, mode])

  const download = () => window.print()
  const title = exam?.examName || exam?.title || `Paper #${examId}`

  return <section className={`series-manager exam-view exam-view-${mode}`}><div className="exam-view-toolbar"><button className="btn btn-outline" type="button" onClick={() => navigate('/test-series/paper')}><FiArrowLeft /> Back</button><button className="btn btn-primary" type="button" onClick={download}><FiDownload /> Download PDF</button></div>{error && <div className="login-alert">{error}</div>}{loading && <div className="card exam-loading">Loading {mode === 'ranking' ? 'ranking' : mode === 'answer' ? 'answer sheet' : 'paper'}...</div>}{!loading && mode !== 'ranking' && <div className="exam-paper"><h1>{title}</h1><div className="exam-meta"><div><b>Name:</b> __________________<br /><b>Roll No:</b> ________________<br /><b>Date:</b> __________________</div><div><b>Duration:</b> {exam?.duration ?? '-'} mins<br /><b>Total Marks:</b> {exam?.totalMarks ?? '-'}<br /><b>Total Questions:</b> {exam?.totalQuestions ?? rows.length}</div></div>{rows.map((row, index) => <QuestionBlock key={row.id || index} row={{ ...row, sequence: row.sequence || index + 1 }} answerSheet={mode === 'answer'} />)}</div>}{!loading && mode === 'ranking' && <div className="card ranking-card"><h1>Results</h1><table className="data-table"><thead><tr><th>Rank</th><th>Name</th><th>Email</th><th>Phone</th><th>Score</th><th>Total</th><th>Q.</th><th>Correct</th><th>Incorrect</th><th>Unsolved</th><th>Time</th></tr></thead><tbody>{rows.length === 0 ? <tr className="empty-row"><td colSpan="11">No ranking results found.</td></tr> : rows.map((row, index) => <tr key={row.id || index}><td>{row.rank ?? index + 1}</td><td>{row.name || row.studentName || '-'}</td><td>{row.email || '-'}</td><td>{row.phone || '-'}</td><td>{row.score ?? row.marks ?? '-'}</td><td>{row.total ?? exam?.totalMarks ?? '-'}</td><td>{row.questions ?? row.totalQuestions ?? '-'}</td><td>{row.correct ?? '-'}</td><td>{row.incorrect ?? '-'}</td><td>{row.unsolved ?? '-'}</td><td>{row.time || row.duration || '-'}</td></tr>)}</tbody></table></div>}</section>
}
