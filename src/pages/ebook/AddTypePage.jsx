import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/common/Modal.jsx'
import { vmMaterialTypeService } from '../../api/services.js'

export default function AddTypePage() {
  const navigate = useNavigate()
  const [allRows, setAllRows] = useState([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newType, setNewType] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const loadRows = async () => {
    try {
      setIsLoading(true)
      const rows = await vmMaterialTypeService.getAll()
      setAllRows(Array.isArray(rows) ? rows : [])
    } catch (error) {
      console.error('Material type load failed:', error)
      setAllRows([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadRows() }, [])

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return allRows
    return allRows.filter((row) => String(row.materialtype || row.name || row.materialType || '').toLowerCase().includes(value))
  }, [allRows, search])

  const handleCreate = async () => {
    if (!newType.trim()) return
    try {
      setIsSaving(true)
      await vmMaterialTypeService.create(newType)
      setNewType('')
      setIsModalOpen(false)
      await loadRows()
    } catch (error) {
      console.error('Create material type failed:', error)
      alert(error?.response?.data?.message || error?.message || 'Failed to create material type')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material type?')) return
    try {
      await vmMaterialTypeService.remove(id)
      await loadRows()
    } catch (error) {
      console.error('Delete material type failed:', error)
      alert(error?.response?.data?.message || error?.message || 'Failed to delete material type')
    }
  }

  return (
    <div className="ebook-list-page" style={{ width: '100%', maxWidth: '1220px', margin: '0 auto' }}>
      <div className="ebook-list-controls">
        <div className="ebook-list-control-actions">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Materials"
            style={{ width: '260px', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d8e2ef', background: '#fff' }}
          />
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ minWidth: '150px' }}>
            Add Material Type
          </button>
        </div>
      </div>
      <div className="ebook-list-count">Material Type Count: <span>{filteredRows.length}</span></div>

      <div className="table-wrap" style={{ border: '1px solid #dfe5ee', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>ID</th>
              <th>Material Type</th>
              <th style={{ width: '280px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>Loading…</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>No material type found.</td></tr>
            ) : filteredRows.map((row) => (
              <tr key={row.id ?? row.materialtype}>
                <td>{row.id}</td>
                <td style={{ color: '#1e63c9', fontWeight: 600 }}>{row.materialtype || row.name || row.materialType || '—'}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/ebook/material-type/${row.id}`)}>Manage Category</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal title="Add New Material Type" onClose={() => setIsModalOpen(false)} maxWidth="420px">
          <div className="form-group" style={{ marginBottom: '10px' }}>
            <label>Material Type</label>
            <input
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              placeholder="Material Type"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={isSaving || !newType.trim()}>
              {isSaving ? 'Adding...' : 'Add'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
