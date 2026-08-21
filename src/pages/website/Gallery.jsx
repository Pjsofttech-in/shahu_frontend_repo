import React, { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave } from 'react-icons/fi'
import { galleryService } from '../../api/services.js'

const EMPTY_FORM = {
  title: '',
  description: '',
  imageUrl: '',
  category: '',
  displayOrder: '',
  active: true,
}

export default function Gallery() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── helpers ───────────────────────────────────────────────────────────────
  const getErrMsg = (e, fallback = 'Something went wrong') => {
    const d = e?.response?.data
    if (!d) return e?.message || fallback
    if (typeof d === 'string') return d
    if (typeof d?.message === 'string') return d.message
    if (typeof d?.error === 'string') return d.error
    return e?.message || fallback
  }

  // ── load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await galleryService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (e) {
      setError(getErrMsg(e, 'Could not load gallery. Check backend connection.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── modal ─────────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      title:        row.title        ?? '',
      description:  row.description  ?? '',
      imageUrl:     row.imageUrl     ?? '',
      category:     row.category     ?? '',
      displayOrder: row.displayOrder ?? '',
      active:       row.active       ?? true,
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
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.imageUrl && form.imageUrl.trim().startsWith('data:')) {
      setFormError('Please enter a direct image URL (https://…). Base64 images are not supported.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      // Build payload exactly matching GalleryRequest DTO
      const payload = {
        title:        form.title.trim()       || null,
        description:  form.description.trim() || null,
        imageUrl:     form.imageUrl.trim()    || null,
        category:     form.category.trim()    || null,
        displayOrder: form.displayOrder !== '' ? parseInt(form.displayOrder, 10) : null,
        active:       form.active,
      }
      if (editing) {
        await galleryService.update(editing.id, payload)
      } else {
        await galleryService.create(payload)
      }
      closeModal()
      await load()
    } catch (e) {
      setFormError(getErrMsg(e, 'Save failed. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await galleryService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      alert(getErrMsg(e, 'Delete failed.'))
    } finally {
      setDeleting(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Gallery</h1>
          <p>Manage photos displayed in the public website gallery.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Gallery
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {error && (
          <div style={{ padding: '14px 20px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>
        )}
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>ID</th>
                <th style={{ width: '10%' }}>Image</th>
                <th style={{ width: '22%' }}>Title</th>
                <th style={{ width: '22%' }}>Category</th>
                <th style={{ width: '10%' }}>Order</th>
                <th style={{ width: '10%' }}>Status</th>
                <th style={{ width: '10%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 34, textAlign: 'center', color: 'var(--text-400)' }}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">No gallery images found</td>
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
                    <td>{row.category || '—'}</td>
                    <td>{row.displayOrder ?? '—'}</td>
                    <td>
                      <span className={`badge ${row.active === false ? 'badge-inactive' : 'badge-active'}`}>
                        {row.active === false ? 'Inactive' : 'Active'}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Gallery' : 'Add Gallery'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="login-alert" style={{ marginBottom: 14 }}>{formError}</div>
                )}

                {/* Row 1: Title + Category */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="g-title">Title</label>
                    <input
                      id="g-title"
                      name="title"
                      type="text"
                      placeholder="Gallery title"
                      value={form.title}
                      onChange={handleField}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="g-category">Category</label>
                    <input
                      id="g-category"
                      name="category"
                      type="text"
                      placeholder="e.g. Events, Campus"
                      value={form.category}
                      onChange={handleField}
                    />
                  </div>
                </div>

                {/* Row 2: Image URL + Display Order */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="g-imageUrl">Image URL</label>
                    <input
                      id="g-imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={form.imageUrl}
                      onChange={handleField}
                    />
                    {/* Live preview */}
                    {form.imageUrl && !form.imageUrl.startsWith('data:') && (
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        style={{ marginTop: 8, width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 6, border: '1px solid var(--border)' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="g-displayOrder">Display Order</label>
                    <input
                      id="g-displayOrder"
                      name="displayOrder"
                      type="number"
                      placeholder="e.g. 1"
                      value={form.displayOrder}
                      onChange={handleField}
                      min="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="g-description">Description</label>
                  <textarea
                    id="g-description"
                    name="description"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={handleField}
                    rows={3}
                  />
                </div>

                {/* Active toggle */}
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input
                    id="g-active"
                    name="active"
                    type="checkbox"
                    checked={form.active}
                    onChange={handleField}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="g-active" style={{ margin: 0, cursor: 'pointer' }}>Active</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave /> {saving ? 'Saving…' : editing ? 'Update' : 'Save'}
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
              <h3>Delete Gallery Image</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.title || 'this image'}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                <FiTrash2 /> {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
