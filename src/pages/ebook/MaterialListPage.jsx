import React, { useEffect, useMemo, useState } from 'react'
import { vmCategoryService, vmMaterialTypeService, vmSubCategoryService } from '../../api/services.js'

export default function MaterialListPage() {
  const [types, setTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [materialTypes, categoryRows, subCategoryRows] = await Promise.all([
          vmMaterialTypeService.getAll(),
          vmCategoryService.getAll(),
          vmSubCategoryService.getAll(),
        ])

        setTypes(Array.isArray(materialTypes) ? materialTypes : [])
        setCategories(Array.isArray(categoryRows) ? categoryRows : [])
        setSubcategories(Array.isArray(subCategoryRows) ? subCategoryRows : [])
      } catch (error) {
        console.error('Failed to load material list data:', error)
        setTypes([])
        setCategories([])
        setSubcategories([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const rows = useMemo(() => {
    const value = search.trim().toLowerCase()
    return types.map((type) => {
      const typeCategories = categories.filter((cat) => String(cat.materialTypeId ?? cat.vmMaterialType?.id ?? cat.materialType?.id) === String(type.id))
      const typeSubCategories = subcategories.filter((sub) => {
        const categoryMatch = typeCategories.some((cat) => String(cat.id) === String(sub.categoryId ?? sub.vmCategory?.id ?? sub.category?.id))
        return categoryMatch
      })
      const rowName = type.materialtype || type.name || type.materialType || ''
      const matches = !value || rowName.toLowerCase().includes(value) || typeCategories.some((cat) => String(cat.categoryName || cat.name || '').toLowerCase().includes(value)) || typeSubCategories.some((sub) => String(sub.subcategoryName || sub.name || '').toLowerCase().includes(value))
      return matches ? {
        id: type.id,
        materialType: rowName,
        categories: typeCategories.length,
        subcategories: typeSubCategories.length,
      } : null
    }).filter(Boolean)
  }, [types, categories, subcategories, search])

  return (
    <div className="ebook-list-page" style={{ width: '100%', maxWidth: '1220px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1f2d3d' }}>
          Material List: <span style={{ color: '#2f74c0' }}>{rows.length}</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search material type"
          style={{ width: '320px', padding: '10px 12px', borderRadius: '7px', border: '1px solid #d8e2ef', background: '#fff' }}
        />
      </div>

      <div className="table-wrap" style={{ border: '1px solid #dfe5ee', borderRadius: '10px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>ID</th>
              <th>Material Type</th>
              <th style={{ width: '180px' }}>Category Count</th>
              <th style={{ width: '200px' }}>Subcategory Count</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>No material records found.</td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ color: '#1e63c9', fontWeight: 600 }}>{row.materialType}</td>
                <td>{row.categories}</td>
                <td>{row.subcategories}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
