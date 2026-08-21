import React, { useEffect, useState, useCallback } from 'react'
import { FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi'
import { contactService } from '../../api/services.js'

export default function ContactUs() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  const formatDate = (val) => {
    if (!val) return '—'
    try {
      return new Date(val).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    } catch { return val }
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

  // ── quick toggle replied ──────────────────────────────────────────────────
  const toggleReplied = async (row) => {
    try {
      await contactService.update(row.id, { ...row, replied: !row.replied })
      await load()
    } catch (e) {
      alert(getErrMsg(e, 'Could not update status.'))
    }
  }

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

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Page header — no Add button */}
      <div className="page-header">
        <div>
          <h1>Contact Us</h1>
          <p>Contact messages submitted from the public website.</p>
        </div>
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
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Message</th>
                <th style={{ width: 110 }}>Replied</th>
                <th style={{ width: 110 }}>Date</th>
                <th style={{ width: 80 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 34, textAlign: 'center', color: 'var(--text-400)' }}>
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-row">No contact messages found</td>
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
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleReplied(row)}
                        title={row.replied ? 'Mark as not replied' : 'Mark as replied'}
                        style={{ gap: 5, padding: 0 }}
                      >
                        {row.replied
                          ? <><FiCheckCircle style={{ color: 'var(--success)' }} /><span className="badge badge-active" style={{ marginLeft: 4 }}>Replied</span></>
                          : <><FiCircle style={{ color: 'var(--text-400)' }} /><span className="badge badge-inactive" style={{ marginLeft: 4 }}>Pending</span></>
                        }
                      </button>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-600)' }}>
                      {formatDate(row.createdAt || row.created_at)}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(row)}>
                        <FiTrash2 />
                      </button>
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
    </>
  )
}
