import React, { useEffect, useState } from 'react'
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi'
import DescriptionPreview from '../../components/common/DescriptionPreview.jsx'
import { courseService } from '../../api/services'

const EMPTY_FORM = {
  courseName:        '',
  courseDescription: '',
  duration:          '',
  price:             '',
}

export default function Courses() {
  const [rows, setRows] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [preview, setPreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageError, setPageError] = useState('')

  const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data
    if (typeof data === 'string' && data.trim()) return data
    return data?.message || data?.error || error?.message || fallback
  }

  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await courseService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
      setPageError('')
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not load courses.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCourses() }, [])

  // ── modal open / close ────────────────────────────────────────────────────
  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setImageFile(null)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      courseName:        row.courseName        ?? '',
      courseDescription: row.courseDescription ?? '',
      duration:          row.duration          ?? '',
      price:             row.price             ?? '',
    })
    setPreview(row.courseImage || null)
    setImageFile(null)
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
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
      setPreview(editing?.courseImage || null)
      setImageFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.courseName.trim()) { setFormError('Course name is required.'); return }
    if (!editing && !imageFile) { setFormError('Course image is required.'); return }

    setSaving(true)
    try {
      const values = { ...form }
      if (editing?.courseImage && !imageFile) values.courseImage = editing.courseImage
      const saved = editing
        ? await courseService.update(editing.id, values, imageFile)
        : await courseService.create(values, imageFile)
      setRows((prev) => editing
        ? prev.map((row) => row.id === editing.id ? saved : row)
        : [...prev, saved])
      closeModal()
      setPageError('')
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save course.'))
    } finally {
      setSaving(false)
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await courseService.remove(deleteTarget.id)
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      setPageError(getErrorMessage(error, 'Could not delete course.'))
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>Courses</h1>
          <p>Manage courses displayed on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <FiPlus /> Add Course
        </button>
      </div>

      {pageError && <div className="login-alert" style={{ marginBottom: 14 }}>{pageError}</div>}

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th style={{ width: 80 }}>Image</th>
                <th>Course Name</th>
                <th>Description</th>
                <th style={{ width: 120 }}>Duration</th>
                <th style={{ width: 120 }}>Price</th>
                <th style={{ width: 110 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">{loading ? 'Loading courses…' : 'No course found'}</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="is-clickable" onClick={() => openEdit(row)}>
                    <td>{row.id}</td>
                    <td>
                      {row.courseImage ? (
                        <img
                          src={row.courseImage}
                          alt={row.courseName}
                          style={{ width: 48, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>{row.courseName || '—'}</td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                        <DescriptionPreview value={row.courseDescription} />
                      </span>
                    </td>
                    <td>{row.duration || '—'}</td>
                    <td>{row.price || '—'}</td>
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
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Edit Course' : 'Add Course'}</h3>
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
                    <label>Course Image</label>
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
                        minHeight: 150,
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
                          style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 6 }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-400)', fontSize: 13 }}>No image selected</span>
                      )}
                    </div>
                  </div>

                  {/* Right — text fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label htmlFor="c-name">Course Name</label>
                      <input
                        id="c-name"
                        name="courseName"
                        type="text"
                        placeholder="Course Name"
                        value={form.courseName}
                        onChange={handleField}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="c-description">Description</label>
                      <textarea
                        id="c-description"
                        name="courseDescription"
                        placeholder="Description"
                        value={form.courseDescription}
                        onChange={handleField}
                        rows={3}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="c-duration">Duration</label>
                      <input
                        id="c-duration"
                        name="duration"
                        type="text"
                        placeholder="10 Months"
                        value={form.duration}
                        onChange={handleField}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="c-price">Price</label>
                      <input
                        id="c-price"
                        name="price"
                        type="text"
                        placeholder="4500 / year"
                        value={form.price}
                        onChange={handleField}
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
                  <FiSave /> {editing ? 'Update Course' : 'Save Course'}
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
              <h3>Delete Course</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete <strong>{deleteTarget.courseName}</strong>? This action cannot be undone.
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
