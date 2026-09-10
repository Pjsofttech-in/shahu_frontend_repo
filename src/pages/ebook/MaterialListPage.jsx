import React, { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiTrash2 } from 'react-icons/fi'
import { vmMaterialService } from '../../api/services.js'

export default function MaterialListPage() {
  const [materials, setMaterials] = useState([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const materialRows = await vmMaterialService.getAll()
        setMaterials(Array.isArray(materialRows) ? materialRows : [])
      } catch (error) {
        console.error('Failed to load material list data:', error)
        setMaterials([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return materials.filter((row) => [row.materialtype, row.chapterName, row.categoryName, row.subcategoryName, row.status]
      .some((field) => String(field || '').toLowerCase().includes(value)))
      .filter((row) => Object.entries(filters).every(([key, query]) => !query || String(row[key] ?? '').toLowerCase().includes(query.toLowerCase())))
  }, [materials, search, filters])

  const remove = async (id) => {
    if (!window.confirm('Delete this material?')) return
    try {
      await vmMaterialService.remove(id)
      setMaterials((current) => current.filter((row) => row.id !== id))
    } catch (error) {
      window.alert(error?.response?.data?.message || error?.message || 'Failed to delete material')
    }
  }

  const toggleDownload = async (id) => {
    try {
      const updated = await vmMaterialService.toggleDownload(id)
      setMaterials((current) => current.map((row) => row.id === id ? { ...row, ...updated } : row))
    } catch (error) {
      window.alert(error?.response?.data?.message || error?.message || 'Failed to update download status')
    }
  }

  return (
    <div className="ebook-list-page" style={{ width: '100%', maxWidth: '1220px', margin: '0 auto' }}>
      <div className="ebook-list-controls">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search material type"
          style={{ width: '320px', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d8e2ef', background: '#fff' }}
        />
      </div>
      <div className="ebook-list-count">Material List Count: <span>{rows.length}</span></div>

      <div className="column-filter-row material-column-filters" role="group" aria-label="Filter materials by column">
        {[
          ['id', 'ID'], ['materialtype', 'Material Type'], ['chapterName', 'Chapter Name'], ['categoryName', 'Category'],
          ['subcategoryName', 'Subcategory'], ['status', 'Status'], ['price', 'Price'],
        ].map(([key, label]) => (
          <select key={key} value={filters[key] || ''} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))} aria-label={`Filter ${label}`}>
            <option value="">All {label}</option>
            {[...new Set(materials.map((row) => String(row[key] ?? '').trim()).filter(Boolean))].sort().map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        ))}
      </div>
      <div className="result-count">Showing <strong>{rows.length}</strong> of {materials.length} materials</div>

      <div className="table-wrap" style={{ border: '1px solid #dfe5ee', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>ID</th>
              <th>Material Type</th>
              <th>Chapter Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Status</th>
              <th>Price</th>
              <th style={{ width: '180px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>No material records found.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ color: '#1e63c9', fontWeight: 600 }}>{row.materialtype || '—'}</td>
                <td>{row.chapterName || '—'}</td>
                <td>{row.categoryName || '—'}</td>
                <td>{row.subcategoryName || '—'}</td>
                <td>{row.status || '—'}</td>
                <td>{row.price == null ? '—' : `₹ ${row.price}`}</td>
                <td><div className="table-actions">
                  <button className="btn btn-success btn-sm" onClick={() => toggleDownload(row.id)} title="Toggle download"><FiDownload /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(row.id)} title="Delete"><FiTrash2 /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
