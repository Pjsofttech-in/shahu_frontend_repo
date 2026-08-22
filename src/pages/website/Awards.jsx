import React, { useCallback, useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi'
import { awardService } from '../../api/services.js'

const EMPTY_FORM = {
  awardName: '',
  awardedBy: '',
  awardTo: '',
  year: '',
}

export default function Awards() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [image, setImage] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await awardService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (loadError) {
      setError(loadError?.response?.data?.message || loadError?.response?.data?.error || loadError?.message || 'Could not load awards.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── modal open / close ────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImage(null)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      awardName:   row.awardName   ?? '',
      awardedBy:   row.awardedBy   ?? '',
      awardTo:     row.awardTo     ?? '',
      year:        row.year        ?? '',
    })
    setImage(null)
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setImage(null)
  }

  // ── form handlers ─────────────────────────────────────────────────────────
  const handleField = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.awardName.trim() || !form.awardedBy.trim() || !form.awardTo.trim() || !form.year) {
      setFormError('Award title, awarded by, awarded to, and year are required.')
      return
    }
    if (!editing && !image) { setFormError('An award image is required.'); return }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        awardName: form.awardName.trim(),
        awardedBy: form.awardedBy.trim(),
        awardTo: form.awardTo.trim(),
        year: Number(form.year),
      }
      if (editing) await awardService.update(editing.id, payload, image)
      else await awardService.create(payload, image)
      closeModal()
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
    try {
      await awardService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || deleteError?.response?.data?.error || deleteError?.message || 'Delete failed.')
    }
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
      {error && !showModal && <div className="login-alert">{error}</div>}

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
              {loading ? (
                <tr><td colSpan={7} className="empty-row">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No awards found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      {row.awardImage ? (
                        <img
                          src={row.awardImage}
                          alt={row.awardName}
                          style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>{row.awardName || '—'}</td>
                    <td>{row.awardedBy || '—'}</td>
                    <td>{row.awardTo || '—'}</td>
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
                  {/* Left — image upload + preview */}
                  <div className="form-group">
                    <label htmlFor="a-image">Award Image</label>
                    <input
                      id="a-image"
                      type="file"
                      accept="image/*"
                      required={!editing}
                      onChange={(e) => setImage(e.target.files?.[0] || null)}
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
                      {image ? (
                        <img
                          src={URL.createObjectURL(image)}
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
                        name="awardName"
                        type="text"
                        placeholder="Award title"
                        value={form.awardName}
                        onChange={handleField}
                        required
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
                        name="awardTo"
                        type="text"
                        placeholder="Recipient name"
                        value={form.awardTo}
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
                Are you sure you want to delete <strong>{deleteTarget.awardName}</strong>? This action cannot be undone.
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
