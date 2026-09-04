import React, { useCallback, useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi'
import DescriptionPreview from '../../components/common/DescriptionPreview.jsx'
import { facultyService } from '../../api/services.js'

const EMPTY_FORM = {
  facilityName: '',
  experienceInYear: '',
  subject:     '',
  facilityEducation: '',
  description: '',
}

export default function Faculty() {
  const [rows, setRows] = useState([])
  const [view, setView] = useState('list')       // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [preview, setPreview] = useState(null)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await facultyService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (loadError) {
      setError(loadError?.response?.data?.message || loadError?.response?.data?.error || loadError?.message || 'Could not load faculty.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── navigation ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setImage(null)
    setFormError('')
    setView('add')
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      facilityName: row.facilityName ?? '',
      experienceInYear: row.experienceInYear ?? '',
      subject:     row.subject     ?? '',
      facilityEducation: row.facilityEducation ?? '',
      description: row.description ?? '',
    })
    setPreview(row.facilityImage || null)
    setImage(null)
    setFormError('')
    setView('edit')
  }

  const goBack = () => {
    setView('list')
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setFormError('')
    setImage(null)
  }

  // ── form handlers ─────────────────────────────────────────────────────────
  const handleField = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
      setImage(file)
      setForm((prev) => ({ ...prev }))
    } else {
      setPreview(editing?.facilityImage || null)
      setImage(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.facilityName.trim()) { setFormError('Faculty name is required.'); return }
    if (!editing && !image) { setFormError('A faculty image is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        facilityName: form.facilityName.trim(),
        experienceInYear: Number(form.experienceInYear) || 0,
        subject: form.subject.trim(),
        facilityEducation: form.facilityEducation.trim(),
        description: form.description.trim(),
      }
      if (editing) await facultyService.update(editing.id, payload, image)
      else await facultyService.create(payload, image)
      goBack()
      await load()
    } catch (saveError) {
      setFormError(saveError?.response?.data?.message || saveError?.response?.data?.error || saveError?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await facultyService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || deleteError?.response?.data?.error || deleteError?.message || 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  // ── render: form view ─────────────────────────────────────────────────────
  if (view === 'add' || view === 'edit') {
    return (
      <>
        {/* Back button */}
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-outline btn-sm" onClick={goBack}>
            <FiArrowLeft /> Back
          </button>
        </div>

        {/* Form card */}
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 17, color: 'var(--navy-900)' }}>
            {view === 'edit' ? 'Edit Faculty' : 'Add New Faculty'}
          </h3>

          {formError && (
            <div className="login-alert" style={{ marginBottom: 16 }}>{formError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              {/* Left — photo upload + preview */}
              <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: 13 }}>Faculty Image</label>
                <span style={{ fontSize: 11.5, color: 'var(--text-400)', marginBottom: 6, display: 'block' }}>
                  Upload faculty profile image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ padding: '6px 8px' }}
                />
                <div
                  style={{
                    marginTop: 10,
                    border: '1.5px dashed var(--border)',
                    borderRadius: 8,
                    background: '#f7f9fc',
                    minHeight: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{ width: '100%', maxHeight: 210, objectFit: 'contain', borderRadius: 6 }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-400)', fontSize: 13 }}>No image selected</span>
                  )}
                </div>
              </div>

              {/* Right — text fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Faculty Name */}
                <div className="form-group">
                  <label htmlFor="f-name">Faculty Name</label>
                  <input
                    id="f-name"
                    name="facilityName"
                    type="text"
                    placeholder="Faculty Name"
                    value={form.facilityName}
                    onChange={handleField}
                    required
                  />
                </div>

                {/* Experience */}
                <div className="form-group">
                  <label htmlFor="f-experience">Experience</label>
                  <input
                    id="f-experience"
                    name="experienceInYear"
                    type="number"
                    placeholder="10"
                    value={form.experienceInYear}
                    onChange={handleField}
                  />
                </div>

                {/* Subject */}
                <div className="form-group">
                  <label htmlFor="f-subject">Subject</label>
                  <input
                    id="f-subject"
                    name="subject"
                    type="text"
                    placeholder="Subject"
                    value={form.subject}
                    onChange={handleField}
                  />
                </div>

                {/* Education */}
                <div className="form-group">
                  <label htmlFor="f-education">Education</label>
                  <input
                    id="f-education"
                    name="facilityEducation"
                    type="text"
                    placeholder="Education"
                    value={form.facilityEducation}
                    onChange={handleField}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="f-description">Description</label>
                  <textarea
                    id="f-description"
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleField}
                    rows={4}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiSave /> {view === 'edit' ? 'Update Faculty' : 'Save Faculty'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={goBack}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </>
    )
  }

  // ── render: list view ─────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Faculty</h1>
          <p>Manage faculty profiles shown on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Faculty
        </button>
      </div>
      {error && <div className="login-alert">{error}</div>}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th style={{ width: 90 }}>Faculty Image</th>
                <th>Faculty Name</th>
                <th>Experience</th>
                <th>Subject</th>
                <th>Education</th>
                <th>Description</th>
                <th style={{ width: 110 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="empty-row">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-row">No faculty found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="is-clickable" onClick={() => openEdit(row)}>
                    <td>{row.id}</td>
                    <td>
                      {row.facilityImage ? (
                        <img
                          src={row.facilityImage}
                          alt={row.facilityName}
                          style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>{row.facilityName || '—'}</td>
                    <td>{row.experienceInYear ?? '—'}</td>
                    <td>{row.subject || '—'}</td>
                    <td>{row.facilityEducation || '—'}</td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        <DescriptionPreview value={row.description} />
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-danger btn-sm" onClick={(event) => { event.stopPropagation(); setDeleteTarget(row) }}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Faculty</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.facilityName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                <FiTrash2 /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
