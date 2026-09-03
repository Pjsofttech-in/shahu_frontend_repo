import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiAward, FiCloud, FiEdit2, FiEye, FiFileText, FiPlus, FiSearch, FiTrash2,
} from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { categoryService, examService } from '../../api/services.js'

const EMPTY_FORM = {
  examName: '', examDate: '', totalMarks: '', totalQuestions: '', duration: '',
  testStartDate: '', testEndDate: '', terms: '', downloadTestPaper: false,
  showTestResult: false, showAllResult: false, active: true, categoryId: '', image: '',
}

const rowsOf = (data) => Array.isArray(data) ? data : data?.content || data?.data || []
const categoryIdOf = (row) => row.categoryId ?? row.category?.id ?? ''
const categoryNameOf = (row) => row.category?.categoryName || row.category?.name || row.categoryName || categoryIdOf(row) || '-'
const errorOf = (error) => String(error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Could not complete the paper request.')
const dateOf = (value) => value ? String(value).slice(0, 10) : '-'

export default function PaperManager() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
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
      setRows(rowsOf(examData)); setCategories(rowsOf(categoryData)); setError('')
    } catch (loadError) { setError(errorOf(loadError)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const visibleRows = useMemo(() => rows.filter((row) => {
    const title = String(row.examName || row.title || '').toLowerCase()
    return (!search.trim() || title.includes(search.trim().toLowerCase())) && (!category || String(categoryIdOf(row)) === category)
  }), [rows, search, category])

  const open = (row = null) => {
    setEditing(row)
    setImage(null)
    setForm(row ? { ...EMPTY_FORM, ...row, categoryId: categoryIdOf(row), examDate: row.examDate || '', testStartDate: row.testStartDate || '', testEndDate: row.testEndDate || '' } : EMPTY_FORM)
    setError(''); setShowModal(true)
  }

  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.examName.trim() || !form.examDate || !form.categoryId || !form.totalMarks || !form.totalQuestions || !form.duration) {
      setError('Paper title, date, series, marks, questions, and duration are required.'); return
    }
    if (!editing && !image) { setError('Paper image is required when creating a paper.'); return }
    const values = { ...form }; delete values.image; delete values.active
    values.examName = values.examName.trim(); values.categoryId = Number(values.categoryId)
    ;['totalMarks', 'totalQuestions', 'duration'].forEach((key) => { values[key] = Number(values[key]) })
    ;['testStartDate', 'testEndDate', 'terms'].forEach((key) => { if (!values[key]) values[key] = null })
    setSaving(true); setError('')
    try {
      if (editing) await examService.update(editing.id, values, image)
      else await examService.create(values, image)
      setShowModal(false); setEditing(null); await load()
    } catch (saveError) { setError(errorOf(saveError)) } finally { setSaving(false) }
  }

  const toggle = async (row, field) => {
    try {
      const values = { ...row, [field]: !row[field] }
      delete values.id; delete values.image; delete values.category; delete values.active
      await examService.update(row.id, values, null); await load()
    } catch (toggleError) { setError(errorOf(toggleError)) }
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete paper "${row.examName || row.id}"?`)) return
    try { await examService.remove(row.id); await load() } catch (deleteError) { setError(errorOf(deleteError)) }
  }

  const uploadImage = async (row, file) => {
    if (!file) return
    const values = { ...row }
    delete values.id; delete values.category; delete values.image; delete values.imageUrl
    try { await examService.update(row.id, values, file); await load() } catch (uploadError) { setError(errorOf(uploadError)) }
  }

  return <section className="series-manager paper-manager">
    <div className="page-header"><div><h1>Paper</h1><p>Manage test papers and their availability.</p></div><button className="btn btn-primary" type="button" onClick={() => open()}><FiPlus /> Create Paper</button></div>
    {error && !showModal && <div className="login-alert">{error}</div>}
    <div className="paper-toolbar"><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by series"><option value="">Select Series</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.categoryName || item.name}</option>)}</select><div className="paper-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by Test Title" aria-label="Search by test title" /><FiSearch /></div><button className="btn btn-primary" type="button" onClick={() => load()}><FiSearch /> Search</button></div>
    <div className="card series-table-card paper-table-card"><div className="table-wrap"><table className="data-table paper-table"><thead><tr><th>Sr No</th><th>Title</th><th>Img</th><th>Attem</th><th>Max Attem</th><th>Status</th><th>Result</th><th>Noq</th><th>Marks</th><th>Dur.</th><th>Start Date</th><th>End Date</th><th>Solved</th><th>All Result</th><th>Download</th><th>Actions</th></tr></thead><tbody>
      {loading && <tr className="empty-row"><td colSpan="16">Loading papers...</td></tr>}
      {!loading && visibleRows.length === 0 && <tr className="empty-row"><td colSpan="16">No papers found.</td></tr>}
      {!loading && visibleRows.map((row, index) => <tr key={row.id}><td>{index + 1}</td><td className="paper-title">{row.examName || row.title || '-'}</td><td className="muted-cell">{row.image || row.imageUrl ? <img src={row.image || row.imageUrl} alt="" /> : 'No Image'}</td><td>{row.attempt ?? row.attem ?? 'No'}</td><td>{row.maxAttempt ?? row.maxAttem ?? 1}</td><td><span className={`status-badge ${row.active === false ? 'inactive' : 'active'}`}>{row.active === false ? 'Inactive' : 'Active'}</span></td><td><button className={`switch ${row.showTestResult ? 'on' : ''}`} type="button" onClick={() => toggle(row, 'showTestResult')}><span />{row.showTestResult ? 'ON' : 'OFF'}</button></td><td>{row.totalQuestions ?? row.noq ?? '-'}</td><td>{row.totalMarks ?? '-'}</td><td>{row.duration ?? '-'}</td><td>{dateOf(row.testStartDate || row.examDate)}</td><td>{dateOf(row.testEndDate)}</td><td>{row.solved ?? 0}</td><td><button className={`switch ${row.showAllResult ? 'on' : ''}`} type="button" onClick={() => toggle(row, 'showAllResult')}><span />{row.showAllResult ? 'ON' : 'OFF'}</button></td><td><button className={`switch ${row.downloadTestPaper ? 'on' : ''}`} type="button" onClick={() => toggle(row, 'downloadTestPaper')}><span />{row.downloadTestPaper ? 'ON' : 'OFF'}</button></td><td><div className="table-actions paper-actions"><button className="icon-btn" type="button" onClick={() => navigate(`/test-series/exam/${row.id}/view`)} title="View question paper" aria-label={`View question paper for ${row.examName}`}><FiEye /></button><button className="icon-btn" type="button" onClick={() => navigate(`/test-series/exam/${row.id}/ranking`)} title="View ranking" aria-label={`View ranking for ${row.examName}`}><FiAward /></button><button className="icon-btn edit" type="button" onClick={() => navigate(`/test-series/exam/${row.id}/answer-sheet`)} title="View answer sheet" aria-label={`View answer sheet for ${row.examName}`}><FiFileText /></button><label className="icon-btn upload-control" title="Upload paper image" aria-label={`Upload image for ${row.examName}`}><FiCloud /><input type="file" accept="image/*" onChange={(event) => uploadImage(row, event.target.files?.[0])} /></label><button className="icon-btn danger" type="button" onClick={() => remove(row)} title="Delete paper" aria-label={`Delete ${row.examName}`}><FiTrash2 /></button></div></td></tr>)}
    </tbody></table></div></div>
    {showModal && <Modal title={editing ? 'Edit Paper' : 'Create Paper'} onClose={() => setShowModal(false)} maxWidth="980px" footer={<><button className="btn btn-outline" type="button" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" type="submit" form="paper-form" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button></>}><form id="paper-form" onSubmit={submit} className="series-form"><div className="series-form-grid"><div className="form-group"><label>Paper Title *</label><input name="examName" value={form.examName} onChange={change} required /></div><div className="form-group"><label>Exam Date *</label><input name="examDate" type="date" value={form.examDate} onChange={change} required /></div><div className="form-group"><label>Series *</label><select name="categoryId" value={form.categoryId} onChange={change} required><option value="">Select Series</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.categoryName || item.name}</option>)}</select></div><div className="form-group"><label>Total Marks *</label><input name="totalMarks" type="number" min="1" value={form.totalMarks} onChange={change} required /></div><div className="form-group"><label>Total Questions *</label><input name="totalQuestions" type="number" min="1" value={form.totalQuestions} onChange={change} required /></div><div className="form-group"><label>Duration (minutes) *</label><input name="duration" type="number" min="1" value={form.duration} onChange={change} required /></div><div className="form-group"><label>Paper Image {!editing && '*'}</label><input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} required={!editing} /></div><div className="form-group"><label>Start Date</label><input name="testStartDate" type="date" value={form.testStartDate} onChange={change} /></div><div className="form-group"><label>End Date</label><input name="testEndDate" type="date" value={form.testEndDate} onChange={change} /></div></div><div className="form-group"><label>Terms</label><textarea name="terms" rows="4" value={form.terms} onChange={change} /></div></form></Modal>}
  </section>
}
