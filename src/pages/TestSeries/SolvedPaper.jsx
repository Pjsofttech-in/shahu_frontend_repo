import React, { useEffect, useMemo, useState } from 'react'
import { FiCheck, FiDownload, FiEye, FiRotateCcw } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { resultService } from '../../api/services.js'

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || data?.data || []
const valueOf = (row, keys) => keys.map((key) => key.split('.').reduce((value, part) => value?.[part], row)).find((value) => value !== undefined && value !== null && value !== '')
const resultIdOf = (row) => valueOf(row, ['id', 'resultId', 'result.id'])
const studentIdOf = (row) => valueOf(row, ['studentId', 'student.id', 'student.studentId', 'student_id']) || '-'
const studentNameOf = (row) => valueOf(row, ['studentName', 'student.name', 'student.fullName', 'student.studentName', 'name']) || '-'
const examNameOf = (row) => valueOf(row, ['examName', 'exam.examName', 'exam.name', 'testSeriesName', 'examTitle']) || '-'
const scoreOf = (row) => valueOf(row, ['score', 'obtainedMarks', 'marksObtained', 'totalScore', 'obtainedScore'])
const totalMarksOf = (row) => valueOf(row, ['totalMarks', 'exam.totalMarks', 'maxMarks'])
const percentageOf = (row) => {
  const direct = valueOf(row, ['percentage', 'percentageScore', 'percentageMarks'])
  if (direct !== undefined) return `${Number(direct).toFixed(2)}%`
  const score = Number(scoreOf(row)); const total = Number(totalMarksOf(row))
  return Number.isFinite(score) && total > 0 ? `${((score / total) * 100).toFixed(2)}%` : '-'
}
const publishedOf = (row) => Boolean(valueOf(row, ['published', 'isPublished', 'resultPublished', 'status']) === true || valueOf(row, ['status'])?.toString().toUpperCase() === 'PUBLISHED')
const paperItemsOf = (row) => {
  for (const key of ['questions', 'answers', 'questionResults', 'attemptedQuestions', 'responses', 'exam.questions', 'attempt.answers']) {
    const value = key.split('.').reduce((current, part) => current?.[part], row)
    if (Array.isArray(value)) return value
  }
  return []
}
const questionTextOf = (item) => valueOf(item, ['question', 'question.text', 'question.question', 'text', 'questionText']) || '-'
const questionOf = (item) => typeof item.question === 'object' ? item.question : item
const answerValue = (value) => typeof value === 'object' ? valueOf(value, ['key', 'option', 'value', 'answer', 'text', 'label']) : value
const selectedAnswerOf = (item) => answerValue(valueOf(item, ['selectedAnswer', 'selectedOption', 'selectedAnswerKey', 'answer', 'submittedAnswer', 'studentAnswer', 'answerText', 'givenAnswer', 'userAnswer', 'answerGiven', 'attemptedAnswer', 'response'])) || '-'
const correctAnswerOf = (item) => answerValue(valueOf(item, ['correctAnswer', 'question.correctAnswer', 'correctOption', 'correctAnswerKey'])) || '-'
const optionEntriesOf = (item) => {
  const question = questionOf(item)
  return ['A', 'B', 'C', 'D'].map((key) => ({ key, text: question[`option${key}`] || question[`option_${key.toLowerCase()}`] || '' })).filter((option) => option.text)
}
const answerKey = (value) => String(value ?? '').trim().toUpperCase().replace(/^OPTION\s+/, '')

export default function SolvedPaper() {
  const [results, setResults] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [viewing, setViewing] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try { setResults(rowsOf(await resultService.getAll())) } catch (loadError) { setError(loadError?.response?.data?.message || loadError?.message || 'Could not load solved papers.') } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return results
    return results.filter((row) => [studentIdOf(row), studentNameOf(row), examNameOf(row), row.email, row.schoolName].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [results, search])

  const publishOne = async (row) => {
    const id = resultIdOf(row)
    if (id === undefined) return
    setSaving(true); setError('')
    try { const updated = await resultService.publish(id); setResults((current) => current.map((item) => resultIdOf(item) === id ? { ...item, ...updated, published: true } : item)) } catch (saveError) { setError(saveError?.response?.data?.message || saveError?.message || 'Could not publish result.') } finally { setSaving(false) }
  }

  const publishSelected = async () => {
    if (!selected.length) return
    setSaving(true); setError('')
    try { await resultService.publishAll(selected); setResults((current) => current.map((row) => selected.includes(resultIdOf(row)) ? { ...row, published: true } : row)); setSelected([]) } catch (saveError) { setError(saveError?.response?.data?.message || saveError?.message || 'Could not publish selected results.') } finally { setSaving(false) }
  }

  const openResult = async (row) => {
    const id = resultIdOf(row)
    setDetailLoading(true)
    setViewing(row)
    try {
      if (id !== undefined) setViewing(await resultService.getById(id))
    } catch (detailError) {
      setError(detailError?.response?.data?.message || detailError?.message || 'Could not load the complete solved paper.')
    } finally { setDetailLoading(false) }
  }

  const downloadPaper = () => {
    if (!viewing) return
    const escapeHtml = (value) => String(value ?? '-').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]))
    const items = paperItemsOf(viewing)
    const questions = items.map((item, index) => { const selected = answerKey(selectedAnswerOf(item)); const correct = answerKey(correctAnswerOf(item)); const options = optionEntriesOf(item).map((option) => `<div class="option ${selected === option.key ? (selected === correct ? 'selected-correct' : 'selected-incorrect') : ''} ${correct === option.key ? 'correct' : ''}"><b>${option.key}.</b> ${escapeHtml(option.text)}</div>`).join(''); return `<article class="question"><h2>Question ${escapeHtml(item.sequence || index + 1)}</h2><p>${escapeHtml(questionTextOf(item))}</p><div class="options">${options}</div><div><b>Student answer:</b> ${escapeHtml(selectedAnswerOf(item))}</div><div><b>Correct answer:</b> ${escapeHtml(correctAnswerOf(item))}</div><div><b>Marks:</b> ${escapeHtml(valueOf(item, ['marks', 'obtainedMarks', 'score']))}</div></article>` }).join('')
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return
    printWindow.document.write(`<html><head><title>Solved Paper - ${escapeHtml(studentNameOf(viewing))}</title><style>body{font-family:Arial,sans-serif;color:#172b4d;padding:28px}h1{color:#1557a6;border-bottom:4px solid #f2b632;padding-bottom:10px}.summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;background:#eef6ff;padding:16px;border-radius:10px}.summary b{color:#1557a6}.question{margin-top:16px;padding:16px;border:2px solid #8ec5ff;border-left:8px solid #f2b632;border-radius:10px;background:#fffdf5;page-break-inside:avoid}.question h2{margin:0 0 8px;color:#1557a6;font-size:16px}.question p{font-size:14px;line-height:1.6}.question div{margin-top:6px;font-size:13px}.options{display:grid;gap:6px}.option{padding:7px;border:1px solid #d7e1ed;border-radius:5px;background:#fff}.option.selected{border-color:#f0ad00;background:#fff3c7;color:#8a5b00}.option.correct{border-color:#38a169;background:#dcfce7;color:#166534}</style></head><body><h1>Complete Solved Paper</h1><div class="summary"><div><b>Student ID:</b> ${escapeHtml(studentIdOf(viewing))}</div><div><b>Student:</b> ${escapeHtml(studentNameOf(viewing))}</div><div><b>Exam:</b> ${escapeHtml(examNameOf(viewing))}</div><div><b>Score:</b> ${escapeHtml(scoreOf(viewing))} / ${escapeHtml(totalMarksOf(viewing))}</div><div><b>Percentage:</b> ${escapeHtml(percentageOf(viewing))}</div></div>${questions || `<pre>${escapeHtml(JSON.stringify(viewing, null, 2))}</pre>`}</body></html>`)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <section className="series-manager solved-paper-page">
      <div className="page-header"><div><h1>Solved Paper</h1><p>Review student results and publish result summaries.</p></div></div>
      <div className="solved-paper-toolbar">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student ID, name, or exam..." aria-label="Search solved papers" />
        <button className="btn btn-outline" type="button" onClick={load} disabled={loading}><FiRotateCcw /> Refresh</button>
        <button className="btn btn-primary" type="button" onClick={publishSelected} disabled={saving || !selected.length}><FiCheck /> Publish Selected ({selected.length})</button>
      </div>
      {error && <div className="login-alert">{error}</div>}
      <div className="card series-table-card"><div className="table-wrap"><table className="data-table"><thead><tr><th><input type="checkbox" checked={visibleRows.length > 0 && selected.length === visibleRows.length} onChange={(event) => setSelected(event.target.checked ? visibleRows.map(resultIdOf).filter(Boolean) : [])} aria-label="Select all results" /></th><th>Student ID</th><th>Student</th><th>Exam</th><th>Score</th><th>Total</th><th>Percentage</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {loading && <tr className="empty-row"><td colSpan="9">Loading solved papers...</td></tr>}
        {!loading && !visibleRows.length && <tr className="empty-row"><td colSpan="9">No solved papers found.</td></tr>}
        {!loading && visibleRows.map((row) => { const id = resultIdOf(row); const score = scoreOf(row); const total = totalMarksOf(row); const published = publishedOf(row); return <tr key={id}><td><input type="checkbox" checked={selected.includes(id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, id] : current.filter((value) => value !== id))} aria-label={`Select result ${id}`} /></td><td>{studentIdOf(row)}</td><td><strong>{studentNameOf(row)}</strong><small className="solved-paper-secondary">{valueOf(row, ['email', 'student.email', 'schoolName', 'student.schoolName']) || ''}</small></td><td>{examNameOf(row)}</td><td>{score ?? '-'}</td><td>{total ?? '-'}</td><td>{percentageOf(row)}</td><td><span className={`badge ${published ? 'badge-active' : 'badge-inactive'}`}>{published ? 'Published' : 'Unpublished'}</span></td><td><div className="table-actions"><button className="btn btn-outline btn-sm" type="button" onClick={() => openResult(row)} title="View complete solved paper"><FiEye /></button>{!published && <button className="btn btn-primary btn-sm" type="button" onClick={() => publishOne(row)} disabled={saving}><FiCheck /></button>}</div></td></tr> })}
      </tbody></table></div></div>
      {viewing && <Modal title={`Complete Solved Paper - ${studentNameOf(viewing)}`} onClose={() => setViewing(null)} maxWidth="900px" footer={<><button className="btn btn-outline" type="button" onClick={() => setViewing(null)}>Close</button><button className="btn btn-primary" type="button" onClick={downloadPaper}><FiDownload /> Download Answer Sheet PDF</button></>}><div className="result-summary-grid"><div><span>Student ID</span><strong>{studentIdOf(viewing)}</strong></div><div><span>Student</span><strong>{studentNameOf(viewing)}</strong></div><div><span>Exam</span><strong>{examNameOf(viewing)}</strong></div><div><span>Score</span><strong>{scoreOf(viewing) ?? '-'} / {totalMarksOf(viewing) ?? '-'}</strong></div><div><span>Percentage</span><strong>{percentageOf(viewing)}</strong></div><div><span>Result Date</span><strong>{valueOf(viewing, ['resultDate', 'completedAt', 'submittedAt', 'createdAt']) || '-'}</strong></div></div>{detailLoading ? <div className="card exam-loading">Loading complete solved paper...</div> : paperItemsOf(viewing).length ? <div className="solved-paper-questions">{paperItemsOf(viewing).map((item, index) => { const selected = answerKey(selectedAnswerOf(item)); const correct = answerKey(correctAnswerOf(item)); return <article className="solved-paper-question" key={item.id || index}><h3>Question {item.sequence || index + 1}</h3><p>{questionTextOf(item)}</p><div className="solved-paper-options">{optionEntriesOf(item).map((option) => <div key={option.key} className={`solved-paper-option ${selected === option.key ? (selected === correct ? 'is-selected-correct' : 'is-selected-incorrect') : ''} ${correct === option.key ? 'is-correct' : ''}`}><b>{option.key}.</b> {option.text}{selected === option.key && <span> Student answer</span>}{correct === option.key && <span> Correct answer</span>}</div>)}</div><div><strong>Student answer:</strong> {selectedAnswerOf(item)}</div><div><strong>Correct answer:</strong> {correctAnswerOf(item)}</div><div><strong>Marks:</strong> {valueOf(item, ['marks', 'obtainedMarks', 'score']) ?? '-'}</div>{valueOf(item, ['explanation', 'question.answerExplanation']) && <div><strong>Explanation:</strong> {valueOf(item, ['explanation', 'question.answerExplanation'])}</div>}</article> })}</div> : <><p className="result-detail-empty">The detailed response did not include a question/answer list.</p><pre className="result-summary-json">{JSON.stringify(viewing, null, 2)}</pre></>}</Modal>}
    </section>
  )
}