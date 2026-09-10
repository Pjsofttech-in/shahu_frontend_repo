import React, { useCallback, useEffect, useState } from 'react'
import { FiImage, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import DescriptionPreview from '../../components/common/DescriptionPreview.jsx'
import { visionMissionDynamicService } from '../../api/services.js'

const EMPTY_FORM = {
  vision: '', mission: '', directorName: '', directorMessage: '', description: '',
}

const getError = (error) => error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong.'

export default function VisionMission() {
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
      const data = await visionMissionDynamicService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (loadError) {
      setError(getError(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setImage(null); setError(''); setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      vision: row.vision ?? '',
      mission: row.mission ?? '',
      directorName: row.directorName ?? '',
      directorMessage: row.directorMessage ?? '',
      description: row.description ?? '',
    })
    setImage(null); setError(''); setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false); setEditing(null); setImage(null); setFormError('')
  }

  const [formError, setFormError] = useState('')
  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.vision.trim() || !form.mission.trim()) {
      setFormError('Vision and mission are required.')
      return
    }
    setSaving(true); setFormError('')
    try {
      const values = {
        vision: form.vision.trim(),
        mission: form.mission.trim(),
        directorName: form.directorName.trim(),
        directorMessage: form.directorMessage.trim(),
        description: form.description.trim(),
      }
      if (editing) await visionMissionDynamicService.update(editing.id, values, image)
      else await visionMissionDynamicService.create(values, image)
      closeModal(); await load()
    } catch (saveError) {
      setFormError(getError(saveError))
    } finally { setSaving(false) }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete Vision & Mission record "${row.id}"?`)) return
    try { await visionMissionDynamicService.remove(row.id); await load() } catch (deleteError) { setError(getError(deleteError)) }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Vision & Mission</h1><p>Manage the vision, mission, and director content shown on the public website.</p></div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Vision & Mission</button>
      </div>
      {error && !showModal && <div className="login-alert">{error}</div>}
      <div className="card" style={{ padding: 0 }}><div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Director Image</th><th>Director Name</th><th>Director Message</th><th>Description</th><th>Vision</th><th>Mission</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={8} className="empty-row">Loading…</td></tr> : rows.length === 0 ? <tr><td colSpan={8} className="empty-row">No Vision & Mission records found</td></tr> : rows.map((row) => (
              <tr key={row.id} className="is-clickable" onClick={() => openEdit(row)}>
                <td>{row.id}</td>
                <td>{row.directorImage ? <img className="about-us-thumb" src={row.directorImage} alt="" /> : <FiImage />}</td>
                <td>{row.directorName || '—'}</td><td className="about-us-description"><DescriptionPreview value={row.directorMessage} /></td><td className="about-us-description"><DescriptionPreview value={row.description} /></td><td className="about-us-description"><DescriptionPreview value={row.vision} /></td><td className="about-us-description"><DescriptionPreview value={row.mission} /></td>
                <td><div className="table-actions"><button className="btn btn-danger btn-sm" onClick={(event) => { event.stopPropagation(); handleDelete(row) }} title="Delete"><FiTrash2 /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>

      {showModal && <Modal title={editing ? 'Edit Vision & Mission' : 'Add Vision & Mission'} onClose={closeModal} maxWidth={800} footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn btn-primary" form="vision-mission-form" disabled={saving}><FiSave /> {saving ? 'Saving…' : 'Save Changes'}</button></>}>
        <form id="vision-mission-form" onSubmit={handleSubmit}>
          {formError && <div className="login-alert">{formError}</div>}
          <div className="form-group"><label htmlFor="vm-image">Director Image</label><input id="vm-image" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} /></div>
          <div className="form-row"><div className="form-group"><label htmlFor="vm-name">Director Name</label><input id="vm-name" name="directorName" value={form.directorName} onChange={handleChange} /></div><div className="form-group"><label htmlFor="vm-message">Director Message</label><input id="vm-message" name="directorMessage" value={form.directorMessage} onChange={handleChange} /></div></div>
          <div className="form-group"><label htmlFor="vm-description">Director Description</label><textarea id="vm-description" name="description" rows={3} value={form.description} onChange={handleChange} /></div>
          <div className="form-row"><div className="form-group"><label htmlFor="vm-vision">Vision</label><textarea id="vm-vision" name="vision" rows={4} value={form.vision} onChange={handleChange} required /></div><div className="form-group"><label htmlFor="vm-mission">Mission</label><textarea id="vm-mission" name="mission" rows={4} value={form.mission} onChange={handleChange} required /></div></div>
        </form>
      </Modal>}
    </div>
  )
}
