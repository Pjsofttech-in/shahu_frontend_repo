import React, { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi'
import { topperService } from '../../api/services'

// No mock data — table starts empty until backend is connected

const EMPTY_FORM = {
  name:        '',
  totalMarks:  '',
  post:        '',
  rank:        '',
  year:        '',
}

// View modes: 'list' | 'add' | 'edit'
export default function Toppers() {
  const [rows, setRows] = useState([])
  const [view, setView] = useState('list')           // 'list' | 'add' | 'edit'
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [preview, setPreview] = useState(null)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data
    if (typeof data === 'string' && data.trim()) return data
    return data?.message || data?.error || error?.message || fallback
  }

  const loadToppers = async () => {
    setLoading(true)
    try {
      const data = await topperService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
      setPageError('')
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not load toppers.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadToppers() }, [])

  // ── navigation ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setImageFile(null)
    setFormError('')
    setView('add')
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name:       row.name       ?? '',
      totalMarks: row.totalMarks ?? '',
      post:       row.post       ?? '',
      rank:       row.rank       ?? '',
      year:       row.year       ?? '',
    })
    setPreview(row.topperImage || null)
    setImageFile(null)
    setFormError('')
    setView('edit')
  }

  const goBack = () => {
    setView('list')
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setImageFile(null)
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
      setImageFile(file)
    } else {
      setPreview(editing?.topperImage || null)
      setImageFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setFormError('Student name is required.'); return }

    setSaving(true)
    try {
      const values = {
        ...form,
        rank: form.rank !== '' ? Number(form.rank) : null,
        year: form.year !== '' ? Number(form.year) : null,
      }
      if (editing?.topperImage && !imageFile) values.topperImage = editing.topperImage
      const saved = editing
        ? await topperService.update(editing.topperId, values, imageFile)
        : await topperService.create(values, imageFile)
      setRows((prev) => editing
        ? prev.map((row) => row.topperId === editing.topperId ? saved : row)
        : [...prev, saved])
      goBack()
      setPageError('')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save topper.'))
    } finally {
      setSaving(false)
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await topperService.remove(deleteTarget.topperId)
      setRows((prev) => prev.filter((r) => r.topperId !== deleteTarget.topperId))
      setDeleteTarget(null)
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not delete topper.'))
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
            {view === 'edit' ? 'Edit Topper' : 'Add New Topper'}
          </h3>

          {formError && (
            <div className="login-alert" style={{ marginBottom: 16 }}>{formError}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              {/* Left — photo upload + preview */}
              <div className="form-group">
                <label>Topper Photo</label>
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
                    minHeight: 160,
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
                      style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 6 }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-400)', fontSize: 13 }}>No image selected</span>
                  )}
                </div>
              </div>

              {/* Right — text fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Student Name */}
                <div className="form-group">
                  <label htmlFor="t-name">Student Name</label>
                  <input
                    id="t-name"
                    name="name"
                    type="text"
                    placeholder="Enter student name"
                    value={form.name}
                    onChange={handleField}
                    required
                  />
                </div>

                {/* Total Marks + Class */}
                <div className="form-row" style={{ gap: 12, margin: 0 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="t-totalMarks">Total Marks (%)</label>
                    <input
                      id="t-totalMarks"
                      name="totalMarks"
                      type="text"
                      placeholder="99%"
                      value={form.totalMarks}
                      onChange={handleField}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="t-class">Class</label>
                    <input
                      id="t-class"
                      name="post"
                      type="text"
                      placeholder="10TH"
                      value={form.post}
                      onChange={handleField}
                    />
                  </div>
                </div>

                {/* Rank + Year */}
                <div className="form-row" style={{ gap: 12, margin: 0 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="t-rank">Rank</label>
                    <input
                      id="t-rank"
                      name="rank"
                      type="number"
                      placeholder="1"
                      value={form.rank}
                      onChange={handleField}
                      min="1"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="t-year">Year</label>
                    <input
                      id="t-year"
                      name="year"
                      type="number"
                      placeholder="2026"
                      value={form.year}
                      onChange={handleField}
                      min="2000"
                      max="2100"
                    />
                  </div>
                </div>

                {/* Save + Cancel buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <FiSave /> {saving ? 'Saving...' : view === 'edit' ? 'Update Topper' : 'Save Topper'}
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
          <h1>Toppers</h1>
          <p>Manage top-performing students shown on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Topper
        </button>
      </div>

      {pageError && <div className="login-alert" style={{ marginBottom: 14 }}>{pageError}</div>}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>ID</th>
                <th style={{ width: '20%' }}>Name</th>
                <th style={{ width: '18%' }}>Total Marks</th>
                <th style={{ width: '18%' }}>Class</th>
                <th style={{ width: '10%' }}>Rank</th>
                <th style={{ width: '10%' }}>Year</th>
                <th style={{ width: '10%' }}>Image</th>
                <th style={{ width: '8%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-row">{loading ? 'Loading toppers...' : 'No topper found'}</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.topperId} className="is-clickable" onClick={() => openEdit(row)}>
                    <td>{row.topperId}</td>
                    <td>{row.name || '—'}</td>
                    <td>{row.totalMarks || '—'}</td>
                    <td>{row.post || '—'}</td>
                    <td>{row.rank ?? '—'}</td>
                    <td>{row.year ?? '—'}</td>
                    <td>
                      {row.topperImage ? (
                        <img
                          src={row.topperImage}
                          alt={row.name}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 12 }}>—</span>
                      )}
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
              <h3>Delete Topper</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
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
