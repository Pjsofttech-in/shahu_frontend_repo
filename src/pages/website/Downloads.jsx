import React, { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiExternalLink } from 'react-icons/fi'
import { downloadService } from '../../api/services.js'

const EMPTY_FORM = {
  title:       '',
  description: '',
  fileName:    '',
  filePath:    '',
  active:      true,
}

export default function Downloads() {
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
      const data = await downloadService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (e) {
      setError(getErrMsg(e, 'Could not load downloads. Check backend connection.'))
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
      title:       row.title       ?? '',
      description: row.description ?? '',
      fileName:    row.fileName    ?? '',
      filePath:    row.filePath    ?? '',
      active:      row.active      ?? true,
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
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Title is required.'); return }

    setSaving(true)
    setFormError('')
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim() || null,
        fileName:    form.fileName.trim()    || null,
        filePath:    form.filePath.trim()    || null,
        active:      form.active,
      }
      if (editing) {
        await downloadService.update(editing.id, payload)
      } else {
        await downloadService.create(payload)
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
      await downloadService.remove(deleteTarget.id)
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
          <h1>Downloads</h1>
          <p>Manage downloadable files shown on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Download
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
                <th style={{ width: 60 }}>ID</th>
                <th>Title</th>
                <th>Description</th>
                <th>File Name</th>
                <th style={{ width: 120 }}>File Path</th>
                <th style={{ width: 90 }}>Status</th>
                <th style={{ width: 110 }}>Action</th>
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
                  <td colSpan={7} className="empty-row">No downloads found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title || '—'}</td>
                    <td style={{ maxWidth: 180 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {row.description || '—'}
                      </span>
                    </td>
                    <td>{row.fileName || '—'}</td>
                    <td>
                      {row.filePath ? (
                        <a
                          href={row.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                        >
                          <FiExternalLink /> Open
                        </a>
                      ) : '—'}
                    </td>
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
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Download' : 'Add Download'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="login-alert" style={{ marginBottom: 14 }}>{formError}</div>
                )}

                {/* Title + File Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="d-title">Title</label>
                    <input
                      id="d-title"
                      name="title"
                      type="text"
                      placeholder="e.g. Admission Form 2024"
                      value={form.title}
                      onChange={handleField}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="d-fileName">File Name</label>
                    <input
                      id="d-fileName"
                      name="fileName"
                      type="text"
                      placeholder="e.g. admission-form-2024.pdf"
                      value={form.fileName}
                      onChange={handleField}
                    />
                  </div>
                </div>

                {/* File Path */}
                <div className="form-group">
                  <label htmlFor="d-filePath">File Path / URL</label>
                  <input
                    id="d-filePath"
                    name="filePath"
                    type="url"
                    placeholder="https://example.com/files/admission-form.pdf"
                    value={form.filePath}
                    onChange={handleField}
                  />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="d-description">Description</label>
                  <textarea
                    id="d-description"
                    name="description"
                    placeholder="Brief description of the file"
                    value={form.description}
                    onChange={handleField}
                    rows={3}
                  />
                </div>

                {/* Active */}
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <input
                    id="d-active"
                    name="active"
                    type="checkbox"
                    checked={form.active}
                    onChange={handleField}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="d-active" style={{ margin: 0, cursor: 'pointer' }}>Active</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave /> {saving ? 'Saving…' : editing ? 'Update Download' : 'Save Download'}
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
              <h3>Delete Download</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
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
