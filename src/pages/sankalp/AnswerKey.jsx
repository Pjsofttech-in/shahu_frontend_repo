import React, { useEffect, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiDownload } from 'react-icons/fi'
import { answerKeyService } from '../../api/services.js'

const EMPTY_FORM = {
  title: '',
  link: '',
  pdf: null,
  description: '',
}

export default function AnswerKey() {
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
      const data = await answerKeyService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (e) {
      setError(getErrMsg(e, 'Could not load answer keys. Check backend connection.'))
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
      link:        row.link        ?? '',
      pdf:         null,
      description: row.description ?? '',
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
    const { name, value, type, checked, files } = e.target
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files[0] || null }))
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Title is required.'); return }
    if (!editing && !form.pdf) { setFormError('PDF file is required.'); return }

    setSaving(true)
    setFormError('')
    try {
      if (editing) {
        await answerKeyService.update(editing.id, {
          title: form.title.trim(),
          link:  form.link.trim() || null,
          pdf:   form.pdf || null,
        })
      } else {
        await answerKeyService.create({
          title: form.title.trim(),
          link:  form.link.trim() || null,
          pdf:   form.pdf,
        })
      }
      closeModal()
      await load()
    } catch (e) {
      setFormError(getErrMsg(e, 'Save failed. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  // ── download PDF ──────────────────────────────────────────────────────────
  const handleDownload = async (row) => {
    try {
      const blob = await answerKeyService.downloadPdf(row.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${row.title || 'answer-key'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Could not download PDF.')
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await answerKeyService.remove(deleteTarget.id)
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
          <h1>Answer Keys</h1>
          <p>Publish answer keys for Sankalp exam sets.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Answer Key
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
                <th>Link</th>
                <th style={{ width: 110 }}>PDF</th>
                <th>Description</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 34, textAlign: 'center', color: 'var(--text-400)' }}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-row">No answer key available</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.title || '—'}</td>
                    <td>
                      {row.link ? (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--blue-600)', fontSize: 13 }}
                        >
                          {row.link}
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDownload(row)}
                      >
                        <FiDownload /> Download
                      </button>
                    </td>
                    <td>
                      {/* description is frontend-only — no backend field yet */}
                      {row.description || '—'}
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
              <h3>{editing ? 'Edit Answer Key' : 'Add Answer Key'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {formError && (
                  <div className="login-alert" style={{ marginBottom: 14 }}>{formError}</div>
                )}

                {/* Title */}
                <div className="form-group">
                  <label htmlFor="ak-title">Title</label>
                  <input
                    id="ak-title"
                    name="title"
                    type="text"
                    placeholder="e.g. Sankalp 2024 - Set A"
                    value={form.title}
                    onChange={handleField}
                    required
                  />
                </div>

                {/* Link */}
                <div className="form-group">
                  <label htmlFor="ak-link">Link <span style={{ color: 'var(--text-400)', fontWeight: 400 }}>(optional)</span></label>
                  <input
                    id="ak-link"
                    name="link"
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={form.link}
                    onChange={handleField}
                  />
                </div>

                {/* PDF upload */}
                <div className="form-group">
                  <label htmlFor="ak-pdf">
                    PDF File {editing && <span style={{ color: 'var(--text-400)', fontWeight: 400 }}>(leave empty to keep existing)</span>}
                  </label>
                  <input
                    id="ak-pdf"
                    name="pdf"
                    type="file"
                    accept="application/pdf"
                    onChange={handleField}
                    style={{ padding: '6px 8px' }}
                  />
                  {form.pdf && (
                    <span style={{ fontSize: 12, color: 'var(--text-600)', marginTop: 4 }}>
                      Selected: {form.pdf.name}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="ak-description">Description</label>
                  <textarea
                    id="ak-description"
                    name="description"
                    placeholder="Optional description"
                    value={form.description}
                    onChange={handleField}
                    rows={3}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <FiSave /> {saving ? 'Saving…' : editing ? 'Update Answer Key' : 'Save Answer Key'}
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
              <h3>Delete Answer Key</h3>
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
