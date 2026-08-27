import React, { useEffect, useState } from 'react'
import { FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { questionService, sectionService } from '../../api/services.js'

const EMPTY_FORM = { question: '', questionType: 'MCQ', sectionId: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', answerExplanation: '', active: true }
const rowsOf = (data) => Array.isArray(data) ? data : data?.content || []
const errorOf = (error) => String(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Could not complete the question request.')

export default function QuestionManager() {
  const [rows, setRows] = useState([])
  const [sections, setSections] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [questionData, sectionData] = await Promise.all([questionService.getAll(), sectionService.getAll()])
      setRows(rowsOf(questionData)); setSections(rowsOf(sectionData)); setError('')
    } catch (loadError) { setError(errorOf(loadError)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const open = (row = null) => {
    setEditing(row)
    setForm(row ? { ...EMPTY_FORM, ...row, sectionId: row.sectionId ?? row.section?.id ?? '' } : EMPTY_FORM)
    setError(''); setShowModal(true)
  }
  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!form.question.trim() || !form.sectionId) { setError('Question and Section are required.'); return }
    if (form.questionType === 'MCQ' && [form.optionA, form.optionB, form.optionC, form.optionD].some((value) => !value.trim())) { setError('All four options are required for MCQ.'); return }
    const payload = { question: form.question.trim(), questionType: form.questionType, sectionId: Number(form.sectionId), optionA: form.optionA.trim(), optionB: form.optionB.trim(), optionC: form.optionC.trim(), optionD: form.optionD.trim(), correctAnswer: form.correctAnswer, answerExplanation: form.answerExplanation.trim(), active: form.active }
    if (form.questionType === 'DESCRIPTIVE') { payload.optionA = ''; payload.optionB = ''; payload.optionC = ''; payload.optionD = ''; payload.correctAnswer = '' }
    setSaving(true); setError('')
    try { if (editing) await questionService.update(editing.id, payload); else await questionService.create(payload); setShowModal(false); await load() } catch (saveError) { setError(errorOf(saveError)) } finally { setSaving(false) }
  }
  const remove = async (row) => {
    setDeleteTarget(row)
  }
  const confirmRemove = async () => {
    if (!deleteTarget) return
    setSaving(true); setError('')
    try {
      await questionService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (deleteError) { setError(errorOf(deleteError)) } finally { setSaving(false) }
  }
  const sectionNameOf = (row) => {
    const sectionId = row.sectionId ?? row.section?.id ?? row.section?.sectionId
    const sectionName = row.sectionName || row.section?.name || row.section?.sectionName
    const loadedSectionName = sections.find((section) => String(section.id) === String(sectionId))?.name
    return sectionName || loadedSectionName || (sectionId ? `Section #${sectionId}` : 'Not assigned')
  }
  const filtered = rows.filter((row) => `${row.question || ''} ${row.questionType || ''}`.toLowerCase().includes(search.toLowerCase()))

  return <section className="series-manager"><div className="page-header"><div><h1>Questions</h1><p>Create reusable questions before assigning them to an Exam.</p></div><button className="btn btn-primary" type="button" onClick={() => open()}><FiPlus /> Add Question</button></div>{error && !showModal && !deleteTarget && <div className="login-alert">{error}</div>}<div className="series-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions..." aria-label="Search questions" /></div><div className="card series-table-card"><div className="table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Question</th><th>Type</th><th>Section</th><th>Actions</th></tr></thead><tbody>{loading && <tr className="empty-row"><td colSpan="5">Loading questions...</td></tr>}{!loading && !filtered.length && <tr className="empty-row"><td colSpan="5">No questions found.</td></tr>}{!loading && filtered.map((row) => <tr key={row.id}><td>{row.id}</td><td><button className="table-link-button" type="button" onClick={() => open(row)}>{row.question || `Question #${row.id}`}</button></td><td>{row.questionType || 'MCQ'}</td><td>{sectionNameOf(row)}</td><td><div className="table-actions"><button className="btn btn-danger btn-sm" type="button" onClick={() => remove(row)} aria-label={`Delete question ${row.id}`}><FiTrash2 /></button></div></td></tr>)}</tbody></table></div></div>{showModal && <Modal title={editing ? 'Edit Question' : 'Add Question'} onClose={() => setShowModal(false)} maxWidth="900px" footer={<><button className="btn btn-outline" type="button" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" type="submit" form="question-form" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></>}><form id="question-form" onSubmit={submit} className="series-form"><div className="series-form-grid"><div className="form-group"><label>Section *</label><select name="sectionId" value={form.sectionId} onChange={change} required><option value="">Select Section</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}</select></div><div className="form-group"><label>Question Type *</label><select name="questionType" value={form.questionType} onChange={change}><option value="MCQ">MCQ</option><option value="DESCRIPTIVE">Descriptive</option></select></div><div className="form-group full-width"><label>Question *</label><textarea name="question" rows="4" value={form.question} onChange={change} required /></div>{form.questionType === 'MCQ' && ['A', 'B', 'C', 'D'].map((option) => <div className="form-group" key={option}><label>Option {option} *</label><input name={`option${option}`} value={form[`option${option}`]} onChange={change} /></div>)}{form.questionType === 'MCQ' && <div className="form-group"><label>Correct Answer *</label><select name="correctAnswer" value={form.correctAnswer} onChange={change}>{['A', 'B', 'C', 'D'].map((option) => <option key={option}>{option}</option>)}</select></div>}<div className="form-group full-width"><label>Answer Explanation</label><textarea name="answerExplanation" rows="3" value={form.answerExplanation} onChange={change} /></div></div></form></Modal>}{deleteTarget && <Modal title="Delete Question" onClose={() => !saving && setDeleteTarget(null)} maxWidth="460px" footer={<><button className="btn btn-outline" type="button" onClick={() => setDeleteTarget(null)} disabled={saving}>Cancel</button><button className="btn btn-danger" type="button" onClick={confirmRemove} disabled={saving}>{saving ? 'Deleting...' : 'Delete Question'}</button></>}><p>Are you sure you want to permanently delete this question?</p><strong>{deleteTarget.question || `Question #${deleteTarget.id}`}</strong>{error && <div className="login-alert" style={{ marginTop: 16 }}>{error}</div>}</Modal>}</section>
}
