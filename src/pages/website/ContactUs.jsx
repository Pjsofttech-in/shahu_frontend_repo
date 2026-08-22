import React, { useEffect, useState, useCallback } from 'react'
import { FiEdit2, FiPlus, FiSave } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { contactService } from '../../api/services.js'

export default function ContactUs({ title = 'Contact Us' }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    address: '', contactNo: '', email: '', mapLink: '',
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

  const openAdd = () => {
    setEditing(null)
    setForm({ address: '', contactNo: '', email: '', mapLink: '' })
    setFormError('')
    setShowEditModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      address: row.address ?? '',
      contactNo: row.contactNo ?? '',
      email: row.email ?? '',
      mapLink: row.mapLink ?? '',
    })
    setFormError('')
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditing(null)
    setFormError('')
    setForm({ address: '', contactNo: '', email: '', mapLink: '' })
  }

  const handleField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSaveContact = async (event) => {
    event.preventDefault()
    const address = form.address.trim()
    const contactNo = form.contactNo.trim()
    const email = form.email.trim()
    const mapLink = form.mapLink.trim()

    if (!address || !contactNo || !email) {
      setFormError('Please complete all contact fields.')
      return
    }

    setSaving(true)
    setFormError('')
    try {
      const payload = { address, contactNo, email, mapLink }
      if (editing) await contactService.update(editing.id, payload)
      else await contactService.create(payload)
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
          <p>Manage contact details displayed on the public website.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><FiPlus /> Add Contact</button>
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
                <th>Address</th>
                <th>Contact No</th>
                <th>Email</th>
                <th>Map Link</th>
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
                  <td colSpan={6} className="empty-row">No contact details found</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.address || '—'}</td>
                    <td>{row.contactNo || '—'}</td>
                    <td>{row.email || '—'}</td>
                    <td>
                      <span style={{
                        display: 'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240,
                      }}>
                        {row.mapLink || '—'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)} title="Edit contact">
                          <FiEdit2 />
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

      {showEditModal && (
        <Modal
          title={editing ? 'Edit Contact' : 'Add Contact'}
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
          <form id="edit-contact-form" onSubmit={handleSaveContact}>
            {formError && <div className="login-alert">{formError}</div>}
            <div className="form-row">
              <div className="form-group"><label htmlFor="contact-address">Address</label><textarea id="contact-address" name="address" value={form.address} onChange={handleField} rows={3} required /></div>
              <div className="form-group"><label htmlFor="contact-number">Contact Number</label><input id="contact-number" name="contactNo" type="tel" value={form.contactNo} onChange={handleField} required /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="contact-email">Email</label><input id="contact-email" name="email" type="email" value={form.email} onChange={handleField} required /></div>
              <div className="form-group"><label htmlFor="contact-map-link">Map Link</label><input id="contact-map-link" name="mapLink" type="url" value={form.mapLink} onChange={handleField} placeholder="https://maps.google.com/..." /></div>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
