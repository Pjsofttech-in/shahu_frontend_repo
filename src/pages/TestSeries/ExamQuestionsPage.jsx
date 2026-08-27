import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiTrash2 } from 'react-icons/fi'
import { examQuestionService, examService, questionService } from '../../api/services.js'

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || []
const errorOf = (error) => String(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Could not complete this request.')
const questionIdOf = (row) => row.questionId ?? row.question?.id ?? row.id
const questionTextOf = (row, questions) => row.question?.question || questions.find((question) => question.id === questionIdOf(row))?.question || `Question #${questionIdOf(row)}`

export default function ExamQuestionsPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [questions, setQuestions] = useState([])
  const [assigned, setAssigned] = useState([])
  const [questionId, setQuestionId] = useState('')
  const [marks, setMarks] = useState('1')
  const [sequence, setSequence] = useState('1')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [examData, questionData, assignedData] = await Promise.all([examService.getById(examId), questionService.getAll(), examQuestionService.getAll(examId)])
      setExam(examData); setQuestions(rowsOf(questionData)); setAssigned(rowsOf(assignedData)); setError('')
    } catch (loadError) { setError(errorOf(loadError)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [examId])

  const addQuestion = async (event) => {
    event.preventDefault()
    if (!questionId) { setError('Select a question first.'); return }
    setSaving(true); setError('')
    try { await examQuestionService.add(examId, { questionId: Number(questionId), sequence: Number(sequence), marks: Number(marks) }); setQuestionId(''); await load() } catch (saveError) { setError(errorOf(saveError)) } finally { setSaving(false) }
  }
  const removeQuestion = async (row) => {
    try { await examQuestionService.remove(examId, questionIdOf(row)); await load() } catch (removeError) { setError(errorOf(removeError)) }
  }
  const updateValue = async (row, field, value) => {
    try { if (field === 'sequence') await examQuestionService.updateSequence(examId, questionIdOf(row), Number(value)); else await examQuestionService.updateMarks(examId, questionIdOf(row), Number(value)); await load() } catch (updateError) { setError(errorOf(updateError)) }
  }
  const assignedIds = new Set(assigned.map(questionIdOf))

  return <section className="series-manager"><div className="page-header"><div><button className="btn btn-outline btn-sm" type="button" onClick={() => navigate('/test-series/exam')}><FiArrowLeft /> Back to Exams</button><h1>{exam?.examName || 'Exam Questions'}</h1><p>Assign reusable Questions to this Exam.</p></div></div>{error && <div className="login-alert">{error}</div>}<div className="card" style={{ padding: 20, marginBottom: 18 }}><h2>Add Question to Exam</h2><form onSubmit={addQuestion} className="series-form"><div className="series-form-grid"><div className="form-group"><label>Question *</label><select value={questionId} onChange={(event) => setQuestionId(event.target.value)} required><option value="">Select Question</option>{questions.filter((question) => !assignedIds.has(question.id)).map((question) => <option key={question.id} value={question.id}>{question.id} - {question.question}</option>)}</select></div><div className="form-group"><label>Sequence *</label><input type="number" min="1" value={sequence} onChange={(event) => setSequence(event.target.value)} required /></div><div className="form-group"><label>Marks *</label><input type="number" min="1" value={marks} onChange={(event) => setMarks(event.target.value)} required /></div></div><button className="btn btn-primary" type="submit" disabled={saving}><FiPlus /> {saving ? 'Adding...' : 'Add to Exam'}</button></form></div><div className="card series-table-card"><div className="table-wrap"><table className="data-table"><thead><tr><th>Sequence</th><th>Question</th><th>Marks</th><th>Actions</th></tr></thead><tbody>{loading && <tr className="empty-row"><td colSpan="4">Loading exam questions...</td></tr>}{!loading && !assigned.length && <tr className="empty-row"><td colSpan="4">No questions assigned to this exam.</td></tr>}{!loading && assigned.map((row) => <tr key={`${examId}-${questionIdOf(row)}`}><td><input className="table-inline-input" type="number" min="1" defaultValue={row.sequence ?? 1} onBlur={(event) => updateValue(row, 'sequence', event.target.value)} /></td><td>{questionTextOf(row, questions)}</td><td><input className="table-inline-input" type="number" min="1" defaultValue={row.marks ?? 1} onBlur={(event) => updateValue(row, 'marks', event.target.value)} /></td><td><button className="btn btn-danger btn-sm" type="button" onClick={() => removeQuestion(row)} aria-label="Remove question"><FiTrash2 /></button></td></tr>)}</tbody></table></div></div></section>
}
