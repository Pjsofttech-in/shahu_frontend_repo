import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiTrash2 } from 'react-icons/fi'
import { vmCategoryService, vmSubCategoryService } from '../../api/services.js'
import Modal from '../../components/common/Modal.jsx'

export default function SubCategoryPage() {
  const { materialTypeId, categoryId } = useParams()
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const allCategories = await vmCategoryService.getAll()
      const category = allCategories.find((row) => String(row.id) === String(categoryId))
      setCategoryName(category?.categoryName || category?.name || 'Category')

      const detailRows = category?.categoryName
        ? await vmSubCategoryService.getByCategoryName(category.categoryName)
        : []
      setRows(detailRows)
    } catch (error) {
      console.error('Subcategory load failed:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [categoryId])

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return rows
    return rows.filter((row) => String(row.subcategoryName || row.name || '').toLowerCase().includes(value))
  }, [rows, search])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      setIsAdding(true)
      await vmSubCategoryService.create({ categoryId: Number(categoryId), subcategoryName: newName })
      setNewName('')
      setIsModalOpen(false)
      await loadData()
    } catch (error) {
      console.error('Create subcategory failed:', error)
      alert(error?.response?.data?.message || error?.message || 'Failed to create subcategory')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subcategory?')) return
    try {
      await vmSubCategoryService.remove(id)
      await loadData()
    } catch (error) {
      console.error('Delete subcategory failed:', error)
      alert(error?.response?.data?.message || error?.message || 'Failed to delete subcategory')
    }
  }

  return (
    <div className="ebook-list-page" style={{ width: '100%', maxWidth: '1220px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2d3d' }}>
          Subcategory Count: <span style={{ color: '#2f74c0' }}>{rows.length}</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Subcategories"
          style={{ width: '260px', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d8e2ef', background: '#fff' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Subcategory</button>
          <button className="btn btn-outline" onClick={() => navigate(`/ebook/material-type/${materialTypeId}`)}>Back to Categories</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '26px', color: '#1d2430' }}>Subcategories of: {categoryName}</h2>
      </div>

      <div className="table-wrap" style={{ border: '1px solid #dfe5ee', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>ID</th>
              <th>Subcategory Name</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>Loading…</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '24px' }}>No subcategory found.</td></tr>
            ) : filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ color: '#1e63c9', fontWeight: 600 }}>{row.subcategoryName || row.name || '—'}</td>
                <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title="Add New Subcategory"
          onClose={() => !isAdding && setIsModalOpen(false)}
          footer={(
            <>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isAdding}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={isAdding || !newName.trim()}>
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </>
          )}
          maxWidth="462px"
        >
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Subcategory Name"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #8ab8ff', background: '#fff' }}
          />
        </Modal>
      )}
    </div>
  )
}
