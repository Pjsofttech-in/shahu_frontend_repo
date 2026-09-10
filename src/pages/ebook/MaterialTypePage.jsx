import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiUpload } from 'react-icons/fi'
import { vmCategoryService, vmMaterialTypeService } from '../../api/services.js'
import Modal from '../../components/common/Modal.jsx'

export default function MaterialTypePage() {
  const { materialTypeId } = useParams()
  const navigate = useNavigate()
  const [materialTypeName, setMaterialTypeName] = useState('')
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const materialRows = await vmMaterialTypeService.getAll()
      const type = materialRows.find((row) => String(row.id) === String(materialTypeId))
      setMaterialTypeName(type?.materialtype || type?.name || 'Material Type')

      const detailRows = type?.materialtype
        ? await vmCategoryService.getByMaterialType(type.materialtype)
        : []
      setRows(detailRows)
    } catch (error) {
      console.error('Category load failed:', error)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [materialTypeId])

  const filteredRows = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return rows
    return rows.filter((row) => String(row.categoryName || row.name || '').toLowerCase().includes(value))
  }, [rows, search])

  const handleCreate = async () => {
    if (!categoryName.trim() || !thumbnailFile) return
    try {
      setIsAdding(true)
      await vmCategoryService.create({
        name: categoryName,
        materialTypeId: Number(materialTypeId),
        createdDate: new Date().toISOString().slice(0, 10),
        thumbnailFile,
      })
      setCategoryName('')
      setThumbnailFile(null)
      setIsModalOpen(false)
      await loadData()
    } catch (error) {
      console.error('Create category failed:', error)
      alert(error?.response?.data?.message || error?.message || 'Failed to create category')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await vmCategoryService.remove(id)
      await loadData()
    } catch (error) {
      console.error('Delete category failed:', error)
      alert(error?.response?.data?.message || error?.message || 'Failed to delete category')
    }
  }

  return (
    <div className="ebook-list-page" style={{ width: '100%', maxWidth: '1220px', margin: '0 auto' }}>
      <div className="ebook-list-controls">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Categories"
          style={{ width: '260px', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d8e2ef', background: '#fff' }}
        />
        <div className="ebook-list-control-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Add Category</button>
          <button className="btn btn-outline" onClick={() => navigate('/ebook/add-type')}>Back to Material Type</button>
        </div>
      </div>
      <div className="ebook-list-count">Category Count: <span>{filteredRows.length}</span></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h2 style={{ margin: 0, fontSize: '26px', color: '#1d2430' }}>Categories of Material Type: {materialTypeName}</h2>
      </div>

      <div className="table-wrap" style={{ border: '1px solid #dfe5ee', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>ID</th>
              <th>Category Name</th>
              <th>Thumbnail</th>
              <th style={{ width: '260px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading…</td></tr>
            ) : filteredRows.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>No category found.</td></tr>
            ) : filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ color: '#1e63c9', fontWeight: 600 }}>{row.categoryName || row.name || '—'}</td>
                <td>
                  {row.thumbnail ? (
                    <img src={row.thumbnail} alt={row.categoryName || 'thumbnail'} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d8e2ef' }} />
                  ) : (
                    <div style={{ width: '48px', height: '48px', borderRadius: '6px', border: '1px solid #d8e2ef', background: '#f0f5fb', display: 'grid', placeItems: 'center', color: '#7d8da5' }}>—</div>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/ebook/material-type/${materialTypeId}/subcategory/${row.id}`)}>Manage Subcategories</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title="Add New Category"
          onClose={() => !isAdding && setIsModalOpen(false)}
          footer={(
            <>
              <button className="btn btn-outline" onClick={() => setIsModalOpen(false)} disabled={isAdding}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={isAdding || !categoryName.trim() || !thumbnailFile}>
                {isAdding ? 'Adding...' : 'Add'}
              </button>
            </>
          )}
          maxWidth="462px"
        >
          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              autoFocus
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category Name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #8ab8ff', background: '#fff' }}
            />
            <label className="btn btn-outline" style={{ width: 'fit-content', cursor: 'pointer' }}>
              <FiUpload />
              {thumbnailFile ? thumbnailFile.name : 'Upload Thumbnail *'}
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            </label>
          </div>
        </Modal>
      )}
    </div>
  )
}
