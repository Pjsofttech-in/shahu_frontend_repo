import React, { useCallback, useEffect, useState } from 'react'
import { FiImage, FiPlus, FiSave, FiTrash2 } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'

const getError = (error) => error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong.'

const compressImage = (file) => new Promise((resolve, reject) => {
  if (!file) return resolve(null)

  const image = new Image()
  const objectUrl = URL.createObjectURL(file)
  image.onload = () => {
    const maxSize = 1600
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.width * scale))
    canvas.height = Math.max(1, Math.round(image.height * scale))
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => {
      URL.revokeObjectURL(objectUrl)
      if (!blob) return reject(new Error('Could not prepare the image for upload.'))
      resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
    }, 'image/jpeg', 0.78)
  }
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error('Could not read the selected image.'))
  }
  image.src = objectUrl
})

export default function DynamicMediaManager({
  title,
  subtitle,
  service,
  maxRecords,
  recordLabel,
  imageLabel,
  imageRequired = true,
  priority = false,
}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', link: '', priority: '' })
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await service.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (loadError) {
      setError(getError(loadError))
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    if (rows.length >= maxRecords) {
      setError(`${title} supports a maximum of ${maxRecords} sections.`)
      return
    }
    setEditing(null)
    setForm({ title: '', description: '', link: '', priority: String(rows.length + 1) })
    setImage(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      title: row.title ?? '',
      description: row.description ?? '',
      link: row.link ?? '',
      priority: row.priority ?? '',
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
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }
    if (!editing && imageRequired && !image) {
      setError(`${imageLabel} is required.`)
      return
    }

    const values = {
      title: form.title.trim(),
      description: form.description.trim(),
      link: form.link.trim(),
    }
    if (priority) values.priority = Number(form.priority) || 1

    setSaving(true)
    setError('')
    try {
      const preparedImage = await compressImage(image)
      if (editing) await service.update(editing.id, values, preparedImage)
      else await service.create(values, preparedImage)
      closeModal()
      await load()
    } catch (saveError) {
      const status = saveError?.response?.status
      setError(status === 401
        ? 'The live backend rejected the admin token. Check the Hero/Feature endpoint permissions in Spring Security.'
        : status === 413
          ? 'Image is still too large for the live server. Please choose a smaller image.'
          : getError(saveError))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete ${recordLabel} "${row.title || row.id}"?`)) return
    try {
      await service.remove(row.id)
      await load()
    } catch (deleteError) {
      setError(getError(deleteError))
    }
  }

  return (
    <section>
      <div className="page-header">
        <div><h1>{title}</h1><p>{subtitle}</p></div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add {recordLabel}</button>
      </div>
      {error && !showModal && <div className="login-alert">{error}</div>}
      <div className="content-limit-note">{rows.length} of {maxRecords} {recordLabel.toLowerCase()} sections used</div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table dynamic-content-table">
              <thead><tr><th>Section</th><th>Image</th><th>Title</th><th>Description</th><th>Link / Button</th>{priority && <th>Priority</th>}<th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={priority ? 7 : 6} className="empty-row">Loading...</td></tr> : rows.length === 0 ? <tr><td colSpan={priority ? 7 : 6} className="empty-row">No {recordLabel.toLowerCase()} sections found</td></tr> : rows.map((row, index) => (
                <tr key={row.id} className="is-clickable" onClick={() => openEdit(row)}>
                  <td className="dynamic-content-section-label">{recordLabel} {priority ? (row.priority || index + 1) : index + 1}</td>
                  <td>{row.image ? <img className="dynamic-content-thumb" src={row.image} alt="" /> : <FiImage />}</td>
                  <td>{row.title || '—'}</td>
                  <td className="dynamic-content-description">{row.description || '—'}</td>
                  <td>{row.link ? <a href={row.link} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>{row.link}</a> : '—'}</td>
                  {priority && <td>{row.priority ?? '—'}</td>}
                  <td><button className="btn btn-danger btn-sm" onClick={(event) => { event.stopPropagation(); handleDelete(row) }} title={`Delete ${recordLabel}`}><FiTrash2 /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <Modal title={editing ? `Edit ${recordLabel}` : `Add ${recordLabel}`} onClose={closeModal} maxWidth={760} footer={<><button className="btn btn-outline" onClick={closeModal}>Cancel</button><button className="btn btn-primary" form="dynamic-content-form" disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save Changes'}</button></>}>
        <form id="dynamic-content-form" onSubmit={handleSubmit}>
          {error && <div className="login-alert">{error}</div>}
          <div className="form-row">
            <div className="form-group"><label htmlFor="dynamic-title">Title *</label><input id="dynamic-title" name="title" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="dynamic-image">{imageLabel}{!editing && ' *'}</label><input id="dynamic-image" type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} /></div>
          </div>
          <div className="form-group"><label htmlFor="dynamic-description">Description *</label><textarea id="dynamic-description" name="description" value={form.description} onChange={handleChange} required /></div>
          <div className="form-row">
            <div className="form-group"><label htmlFor="dynamic-link">Link / Button URL</label><input id="dynamic-link" name="link" type="url" value={form.link} onChange={handleChange} placeholder="https://example.com" /></div>
            {priority && <div className="form-group"><label htmlFor="dynamic-priority">Priority</label><input id="dynamic-priority" name="priority" type="number" min="1" max={maxRecords} value={form.priority} onChange={handleChange} /></div>}
          </div>
        </form>
      </Modal>}
    </section>
  )
}
