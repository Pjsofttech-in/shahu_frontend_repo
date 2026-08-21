import React, { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi'

// No mock data — table starts empty until backend is connected

const EMPTY_FORM = {
  title: '',
  imageUrl: '',
  description: '',
  awardedBy: '',
  awardedTo: '',
  year: '',
}

export default function Awards() {
  const [rows, setRows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── modal open / close ────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      title:       row.title       ?? '',
      imageUrl:    row.imageUrl    ?? '',
      description: row.description ?? '',
      awardedBy:   row.awardedBy   ?? '',
      awardedTo:   row.awardedTo   ?? '',
      year:        row.year        ?? '',
    })
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  // ── form handlers ─────────────────────────────────────────────────────────
  const handleField = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Award title is required.'); return }
    if (editing) {
      setRows((prev) =>
        prev.map((r) => r.id === editing.id ? { ...editing, ...form, year: form.year ? parseInt(form.year, 10) : null } : r)
      )
    } else {
      const newId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1
      setRows((prev) => [...prev, { id: newId, ...form, year: form.year ? parseInt(form.year, 10) : null }])
    }
    closeModal()
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Awards</h1>
          <p>Manage awards and recognition displayed on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Award
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th style={{ width: 80 }}>Image</th>
                <th>Award Title</th>
                <th>Awarded By</th>
                <th>Awarded To</th>
                <th style={{ width: 80 }}>Year</th>
                <th style={{ width: 110 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No awards found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      {row.imageUrl ? (
                        <img
                          src={row.imageUrl}
                          alt={row.title}
                          style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>{row.title || '—'}</td>
                    <td>{row.awardedBy || '—'}</td>
                    <td>{row.awardedTo || '—'}</td>
                    <td>{row.year || '—'}</td>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Award' : 'Add Award'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="login-alert" style={{ marginBottom: 14 }}>{formError}</div>
                )}

                <div className="form-row">
                  {/* Left — image URL + preview */}
                  <div className="form-group">
                    <label htmlFor="a-imageUrl">Award Image</label>
                    <input
                      id="a-imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="https://example.com/award.jpg"
                      value={form.imageUrl}
                      onChange={handleField}
                    />
                    <div
                      style={{
                        marginTop: 10,
                        border: '1.5px dashed var(--border)',
                        borderRadius: 8,
                        background: '#f7f9fc',
                        minHeight: 130,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          style={{ width: '100%', maxHeight: 170, objectFit: 'contain', borderRadius: 6 }}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 13 }}>No image selected</span>
                      )}
                    </div>
                  </div>

                  {/* Right — text fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label htmlFor="a-title">Award Title</label>
                      <input
                        id="a-title"
                        name="title"
                        type="text"
                        placeholder="Award title"
                        value={form.title}
                        onChange={handleField}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a-description">Description</label>
                      <textarea
                        id="a-description"
                        name="description"
                        placeholder="Brief description"
                        value={form.description}
                        onChange={handleField}
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a-awardedBy">Awarded By</label>
                      <input
                        id="a-awardedBy"
                        name="awardedBy"
                        type="text"
                        placeholder="Awarding organization"
                        value={form.awardedBy}
                        onChange={handleField}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a-awardedTo">Awarded To</label>
                      <input
                        id="a-awardedTo"
                        name="awardedTo"
                        type="text"
                        placeholder="Recipient name"
                        value={form.awardedTo}
                        onChange={handleField}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="a-year">Award Year</label>
                      <input
                        id="a-year"
                        name="year"
                        type="number"
                        placeholder="e.g. 2024"
                        value={form.year}
                        onChange={handleField}
                        min="1900"
                        max="2100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiSave /> {editing ? 'Update Award' : 'Save Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Award</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
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
