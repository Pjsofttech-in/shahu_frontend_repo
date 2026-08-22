import React, { useEffect, useState, useCallback } from 'react'
import { FiTrash2, FiEdit2, FiSave } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { contactService } from '../../api/services.js'

export default function ContactUs({ title = 'Contact Us' }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', mobile: '', message: '',
  })

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
      const data = await contactService.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (e) {
      setError(getErrMsg(e, 'Could not load contacts. Check backend connection.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await contactService.remove(deleteTarget.id)
      setDeleteTarget(null)
      await load()
    } catch (e) {
      alert(getErrMsg(e, 'Delete failed.'))
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name ?? '',
      email: row.email ?? '',
      mobile: row.mobile ?? '',
      message: row.message ?? row.description ?? '',
    })
    setFormError('')
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditing(null)
    setFormError('')
    setForm({ name: '', email: '', mobile: '', message: '' })
  }

  const handleField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleEditContact = async (event) => {
    event.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim()
    const mobile = form.mobile.trim()
    const message = form.message.trim()

    if (!name || !email || !mobile) {
      setFormError('Please complete all contact fields.')
      return
    }

    setSaving(true)
    setFormError('')
    try {
      await contactService.update(editing.id, { name, email, mobile, message })
      closeEditModal()
      await load()
    } catch (e) {
      setFormError(getErrMsg(e, 'Could not update contact.'))
    } finally {
      setSaving(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p>Contact messages submitted from the public website.</p>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {error && (
          <div style={{ padding: '14px 20px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>
        )}
        <div className="table-wrap">
          <table className="data-table contact-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Message</th>
                <th style={{ width: 80 }}>Action</th>
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
                  <td colSpan={6} className="empty-row">No contact messages found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name || '—'}</td>
                    <td>{row.email || '—'}</td>
                    <td>{row.mobile || '—'}</td>
                    <td>
                      <span style={{
                        display: 'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240,
                      }}>
                        {row.message || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)} title="Edit contact">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(row)} title="Delete contact">
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

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Contact</h3>
              <button className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-600)', fontSize: 13.5 }}>
                Are you sure you want to delete the message from{' '}
                <strong>{deleteTarget.name || deleteTarget.email}</strong>? This action cannot be undone.
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

      {showEditModal && (
        <Modal
          title="Edit Contact"
          onClose={closeEditModal}
          maxWidth={620}
          footer={(
            <>
              <button className="btn btn-outline" onClick={closeEditModal} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" form="edit-contact-form" disabled={saving}>
                <FiSave /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          )}
        >
          <form id="edit-contact-form" onSubmit={handleEditContact}>
            {formError && <div className="login-alert">{formError}</div>}
            <div className="form-row">
              <div className="form-group"><label htmlFor="contact-name">Name</label><input id="contact-name" name="name" value={form.name} onChange={handleField} /></div>
              <div className="form-group"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" value={form.email} onChange={handleField} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="contact-mobile">Mobile</label><input id="contact-mobile" name="mobile" type="tel" value={form.mobile} onChange={handleField} /></div>
            </div>
            <div className="form-group"><label htmlFor="contact-message">Message</label><textarea id="contact-message" name="message" value={form.message} onChange={handleField} /></div>
          </form>
        </Modal>
      )}
    </>
  )
}
