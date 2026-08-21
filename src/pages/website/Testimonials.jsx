import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi'

const EMPTY_FORM = {
  name:        '',
  exam:        '',
  rank:        '',
  description: '',
  imageUrl:    '',
}

export default function Testimonials() {
  const [rows, setRows] = useState([])
  const [view, setView] = useState('list')       // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [preview, setPreview] = useState(null)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── navigation ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setFormError('')
    setView('add')
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name:        row.name        ?? '',
      exam:        row.exam        ?? '',
      rank:        row.rank        ?? '',
      description: row.description ?? '',
      imageUrl:    row.imageUrl    ?? '',
    })
    setPreview(row.imageUrl || null)
    setFormError('')
    setView('edit')
  }

  const goBack = () => {
    setView('list')
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setFormError('')
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
      setForm((prev) => ({ ...prev, imageUrl: url }))
    } else {
      setPreview(editing?.imageUrl || null)
      setForm((prev) => ({ ...prev, imageUrl: editing?.imageUrl || '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Name is required.'); return }

    if (editing) {
      setRows((prev) =>
        prev.map((r) => r.id === editing.id ? { ...editing, ...form } : r)
      )
    } else {
      const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1
      setRows((prev) => [...prev, { id: newId, ...form }])
    }
    goBack()
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
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
            {view === 'edit' ? 'Edit Testimonial' : 'Add New Testimonial'}
          </h3>

          {formError && (
            <div className="login-alert" style={{ marginBottom: 16 }}>{formError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              {/* Left — image upload + preview */}
              <div className="form-group">
                <label style={{ fontWeight: 700, fontSize: 13 }}>Testimonial Image</label>
                <span style={{ fontSize: 11.5, color: 'var(--text-400)', marginBottom: 6, display: 'block' }}>
                  Upload testimonial image
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
                {/* Name */}
                <div className="form-group">
                  <label htmlFor="tm-name">Name</label>
                  <input
                    id="tm-name"
                    name="name"
                    type="text"
                    placeholder="Enter Name"
                    value={form.name}
                    onChange={handleField}
                    required
                  />
                </div>

                {/* Exam */}
                <div className="form-group">
                  <label htmlFor="tm-exam">Exam</label>
                  <input
                    id="tm-exam"
                    name="exam"
                    type="text"
                    placeholder="Enter Exam"
                    value={form.exam}
                    onChange={handleField}
                  />
                </div>

                {/* Rank */}
                <div className="form-group">
                  <label htmlFor="tm-rank">Rank</label>
                  <input
                    id="tm-rank"
                    name="rank"
                    type="text"
                    placeholder="Enter Rank"
                    value={form.rank}
                    onChange={handleField}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="tm-description">Description</label>
                  <textarea
                    id="tm-description"
                    name="description"
                    placeholder="Enter Description"
                    value={form.description}
                    onChange={handleField}
                    rows={4}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="submit" className="btn btn-primary">
                    <FiSave /> {view === 'edit' ? 'Update Testimonial' : 'Save Testimonial'}
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
          <h1>Testimonials</h1>
          <p>Manage testimonials displayed on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Testimonial
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>ID</th>
                <th style={{ width: '18%' }}>Name</th>
                <th style={{ width: '18%' }}>Exam</th>
                <th style={{ width: '10%' }}>Rank</th>
                <th style={{ width: '10%' }}>Image</th>
                <th style={{ width: '28%' }}>Description</th>
                <th style={{ width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No testimonials available</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name || '—'}</td>
                    <td>{row.exam || '—'}</td>
                    <td>{row.rank || '—'}</td>
                    <td>
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.name}
                          style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                        {row.description || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)}>
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(row)}>
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
              <h3>Delete Testimonial</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete the testimonial from <strong>{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
