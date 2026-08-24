import React, { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiTrash2, FiSave, FiExternalLink, FiFile, FiImage } from 'react-icons/fi'
import { downloadService } from '../../api/services.js'

const EMPTY_FORM = {
  title:       '',
  fileName:    '',
  filePath:    '',
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
      fileName:    row.fileName    ?? '',
      filePath:    row.filePath    ?? '',
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
    if (!form.fileName.trim()) { setFormError('File name is required.'); return }
    if (!form.filePath.trim()) { setFormError('File link or path is required.'); return }

    setSaving(true)
    setFormError('')
    try {
      const payload = {
        title:       form.title.trim(),
        fileName:    form.fileName.trim(),
        filePath:    form.filePath.trim(),
        active:      true,
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
                <th>Link / PDF / Image</th>
                <th style={{ width: 110 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 34, textAlign: 'center', color: 'var(--text-400)' }}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">No downloads found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="is-clickable" onClick={() => openEdit(row)}>
                    <td>{row.id}</td>
                    <td>{row.title || '—'}</td>
                    <td>
                      {row.filePath ? (
                        <div className="download-file-cell">
                          {(/\.(png|jpe?g|gif|webp|svg)$/i.test(row.fileName || row.filePath)) ? <FiImage /> : <FiFile />}
                          <span title={row.fileName || row.filePath}>{row.fileName || 'Open file'}</span>
                          <a href={row.filePath} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" title="Open file" onClick={(event) => event.stopPropagation()}>
                            <FiExternalLink />
                          </a>
                        </div>
                      ) : '—'}
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

                {/* Backend-required title and file metadata */}
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

                <div className="form-group">
                  <label htmlFor="d-filePath">Link / File Path</label>
                  <input
                    id="d-filePath"
                    name="filePath"
                    type="text"
                    placeholder="https://example.com/files/admission-form.pdf"
                    value={form.filePath}
                    onChange={handleField}
                  />
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
