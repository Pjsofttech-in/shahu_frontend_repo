import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiEdit2, FiFileText, FiPlus, FiTrash2 } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { categoryService, examService } from '../../api/services.js'

const EMPTY_FORM = {
  examName: '', examDate: '', totalMarks: '', totalQuestions: '', duration: '',
  testStartDate: '', testEndDate: '', terms: '', downloadTestPaper: false, showTestResult: false,
  showAllResult: false, active: true, categoryId: '', image: '',
}

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || []
const categoryIdOf = (row) => row.categoryId ?? row.category?.id ?? ''
const errorOf = (error) => String(error?.response?.data?.message || error?.response?.data?.error || error?.response?.data || error?.message || 'Could not complete the exam request.')

export default function ExamManager({ solvedOnly = false }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [image, setImage] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [examData, categoryData] = await Promise.all([examService.getAll(), categoryService.getAll()])
      setRows(rowsOf(examData))
      setCategories(rowsOf(categoryData))
      setError('')
    } catch (loadError) { setError(errorOf(loadError)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const open = (row = null) => {
    setEditing(row)
    setImage(null)
    setForm(row ? { ...EMPTY_FORM, ...row, categoryId: categoryIdOf(row), examDate: row.examDate || '', testStartDate: row.testStartDate || '', testEndDate: row.testEndDate || '' } : EMPTY_FORM)
    setError('')
    setShowModal(true)
  }
  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }
  const submit = async (event) => {
    event.preventDefault()
    if (!form.examName.trim() || !form.examDate || !form.categoryId || !form.totalMarks || !form.totalQuestions || !form.duration) {
      setError('Exam name, date, category, marks, questions, and duration are required.')
      return
    }
    if (!image) { setError('Exam image is required by the backend.'); return }
    const values = { ...form }
    delete values.image
    delete values.active
    values.examName = values.examName.trim()
    values.categoryId = Number(values.categoryId)
    ;['totalMarks', 'totalQuestions', 'duration'].forEach((key) => { values[key] = Number(values[key]) })
    ;['testStartDate', 'testEndDate', 'terms'].forEach((key) => { if (!values[key]) values[key] = null })
    setSaving(true); setError('')
    try {
      if (editing) await examService.update(editing.id, values, image)
      else await examService.create(values, image)
      setShowModal(false); setEditing(null); await load()
    } catch (saveError) { setError(errorOf(saveError)) } finally { setSaving(false) }
  }
  const remove = async (row) => {
    if (!window.confirm(`Delete exam "${row.examName || row.id}"?`)) return
    try { await examService.remove(row.id); await load() } catch (deleteError) { setError(errorOf(deleteError)) }
  }
  const visibleRows = rows.filter((row) => solvedOnly ? row.resultFinalized === true : row.resultFinalized !== true)

  return <section className="series-manager">
    <div className="page-header"><div><h1>{solvedOnly ? 'Solved Paper' : 'Paper / Exam'}</h1><p>{solvedOnly ? 'Exams finalized for result review.' : 'Create and manage exams linked to your test series.'}</p></div>{!solvedOnly && <button className="btn btn-primary" type="button" onClick={() => open()}><FiPlus /> Create Paper</button>}</div>
    {error && !showModal && <div className="login-alert">{error}</div>}
    <div className="card series-table-card"><div className="table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Exam</th><th>Date</th><th>Questions</th><th>Marks</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      {loading && <tr className="empty-row"><td colSpan="8">Loading exams...</td></tr>}
      {!loading && visibleRows.length === 0 && <tr className="empty-row"><td colSpan="8">No exams found.</td></tr>}
      {!loading && visibleRows.map((row) => <tr key={row.id}><td>{row.id}</td><td><FiFileText /> {row.examName || '-'}</td><td>{row.examDate || '-'}</td><td>{row.totalQuestions ?? '-'}</td><td>{row.totalMarks ?? '-'}</td><td>{row.category?.categoryName || row.category?.name || categoryIdOf(row) || '-'}</td><td>{row.resultFinalized ? 'Solved' : 'Draft'}</td><td><div className="table-actions"><button className="btn btn-primary btn-sm" type="button" onClick={() => navigate(`/test-series/exam/${row.id}/questions`)}>Questions</button><button className="btn btn-outline btn-sm" type="button" onClick={() => open(row)} aria-label={`Edit ${row.examName}`}><FiEdit2 /></button><button className="btn btn-danger btn-sm" type="button" onClick={() => remove(row)} aria-label={`Delete ${row.examName}`}><FiTrash2 /></button></div></td></tr>)}
    </tbody></table></div></div>
    {showModal && <Modal title={editing ? 'Edit Paper' : 'Create Paper'} onClose={() => setShowModal(false)} maxWidth="980px" footer={<><button className="btn btn-outline" type="button" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" type="submit" form="exam-form" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></>}>
      {error && <div className="login-alert">{error}</div>}<form id="exam-form" onSubmit={submit} className="series-form"><div className="series-form-grid">
        <div className="form-group"><label>Exam Name *</label><input name="examName" value={form.examName} onChange={change} required /></div><div className="form-group"><label>Exam Date *</label><input name="examDate" type="date" value={form.examDate} onChange={change} required /></div><div className="form-group"><label>Category *</label><select name="categoryId" value={form.categoryId} onChange={change} required><option value="">Select Category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.categoryName || category.name}</option>)}</select></div><div className="form-group"><label>Total Marks *</label><input name="totalMarks" type="number" min="1" value={form.totalMarks} onChange={change} required /></div><div className="form-group"><label>Total Questions *</label><input name="totalQuestions" type="number" min="1" value={form.totalQuestions} onChange={change} required /></div><div className="form-group"><label>Duration (minutes) *</label><input name="duration" type="number" min="1" value={form.duration} onChange={change} required /></div><div className="form-group"><label>Exam Image *</label><input name="image" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} required /></div><div className="form-group"><label>Test Start Date</label><input name="testStartDate" type="date" value={form.testStartDate} onChange={change} /></div><div className="form-group"><label>Test End Date</label><input name="testEndDate" type="date" value={form.testEndDate} onChange={change} /></div></div><div className="form-group"><label>Terms</label><textarea name="terms" rows="4" value={form.terms} onChange={change} /></div><div className="series-form-bottom"><label className="series-active"><input name="active" type="checkbox" checked={!!form.active} onChange={change} /> Active</label><label className="series-active"><input name="downloadTestPaper" type="checkbox" checked={!!form.downloadTestPaper} onChange={change} /> Download test paper</label><label className="series-active"><input name="showTestResult" type="checkbox" checked={!!form.showTestResult} onChange={change} /> Show result</label><label className="series-active"><input name="showAllResult" type="checkbox" checked={!!form.showAllResult} onChange={change} /> Show all result</label></div></form>
    </Modal>}
  </section>
}