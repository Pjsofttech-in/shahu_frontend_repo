import React, { useCallback, useEffect, useState } from 'react'
import { FiEdit2, FiImage, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { aboutUsService } from '../../api/services.js'

const EMPTY_FORM = {
  aboutUsTitle: '',
  aboutUsDescription: '',
  yearsCount: '',
  examCenterCount: '',
  facultyCount: '',
  studentCount: '',
}

const getError = (error) => error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong.'

export default function AboutUs() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await aboutUsService.getAll(user)
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (loadError) {
      setError(getError(loadError))
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImage(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      aboutUsTitle: row.aboutUsTitle ?? '',
      aboutUsDescription: row.aboutUsDescription ?? '',
      yearsCount: row.yearsCount ?? '',
      examCenterCount: row.examCenterCount ?? row.centersCount ?? '',
      facultyCount: row.facultyCount ?? '',
      studentCount: row.studentCount ?? '',
    })
    setImage(null)
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setImage(null)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.aboutUsTitle.trim() || !form.aboutUsDescription.trim()) {
      setError('Title and description are required.')
      return
    }
    if (!editing && !image) {
      setError('An About Us image is required.')
      return
    }

    const values = {
      aboutUsTitle: form.aboutUsTitle.trim(),
      aboutUsDescription: form.aboutUsDescription.trim(),
      yearsCount: Number(form.yearsCount) || 0,
      examCenterCount: Number(form.examCenterCount) || 0,
      facultyCount: Number(form.facultyCount) || 0,
      studentCount: Number(form.studentCount) || 0,
    }

    setSaving(true)
    setError('')
    try {
      if (editing) await aboutUsService.update(editing.id, values, image, user)
      else await aboutUsService.create(values, image, user)
      closeModal()
      await load()
    } catch (saveError) {
      setError(getError(saveError))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete About Us record "${row.aboutUsTitle || row.id}"?`)) return
    try {
      await aboutUsService.remove(row.id, user)
      await load()
    } catch (deleteError) {
      setError(getError(deleteError))
    }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>About Us</h1><p>Manage the About Us content and homepage statistics.</p></div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add About Us</button>
      </div>
      {error && !showModal && <div className="login-alert">{error}</div>}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Image</th><th>Title</th><th>Description</th><th>Years</th><th>Exam Centers</th><th>Faculty</th><th>Students</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={9} className="empty-row">Loading…</td></tr> : rows.length === 0 ? <tr><td colSpan={9} className="empty-row">No About Us records found</td></tr> : rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.aboutUsImage ? <img className="about-us-thumb" src={row.aboutUsImage} alt="" /> : <FiImage />}</td>
                  <td>{row.aboutUsTitle || '—'}</td>
                  <td className="about-us-description">{row.aboutUsDescription || '—'}</td>
                  <td>{row.yearsCount ?? '—'}</td><td>{row.examCenterCount ?? row.centersCount ?? '—'}</td><td>{row.facultyCount ?? '—'}</td><td>{row.studentCount ?? '—'}</td>
                  <td><div className="table-actions"><button className="btn btn-outline btn-sm" onClick={() => openEdit(row)} title="Edit"><FiEdit2 /></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)} title="Delete"><FiTrash2 /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <Modal title={editing ? 'Edit About Us' : 'Add About Us'} onClose={closeModal} maxWidth={760} footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn btn-primary" form="about-us-form" disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save Changes'}</button></>}>
        <form id="about-us-form" onSubmit={handleSubmit}>
          {error && <div className="login-alert">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label htmlFor="about-title">Title</label><input id="about-title" name="aboutUsTitle" value={form.aboutUsTitle} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="about-image">Image</label><input id="about-image" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} /></div>
          </div>
          <div className="form-group"><label htmlFor="about-description">Description</label><textarea id="about-description" name="aboutUsDescription" rows={4} value={form.aboutUsDescription} onChange={handleChange} required /></div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="about-years">Years Count</label><input id="about-years" name="yearsCount" type="number" min="0" value={form.yearsCount} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="about-centers">Exam Center Count</label><input id="about-centers" name="examCenterCount" type="number" min="0" value={form.examCenterCount} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="about-faculty">Faculty Count</label><input id="about-faculty" name="facultyCount" type="number" min="0" value={form.facultyCount} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="about-students">Student Count</label><input id="about-students" name="studentCount" type="number" min="0" value={form.studentCount} onChange={handleChange} /></div>
          </div>
        </form>
      </Modal>}
    </div>
  )
}