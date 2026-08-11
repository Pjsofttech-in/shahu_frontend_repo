import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi'
import DataTable from './DataTable.jsx'
import Modal from './Modal.jsx'
import FormField from './FormField.jsx'

/**
 * Generic list + create/edit/delete manager.
 *
 * fields: [{ name, label, type, required, options: [{label,value}] | (formValues)=>Promise<options>, dependsOn }]
 * columns: [{ key, label, render?(row) }]
 * extraRowAction: { label, icon, onClick(row) } — e.g. "Add Taluka" button on a District row
 */
export default function CrudManager({
  title,
  subtitle,
  service,
  fields,
  columns,
  addLabel = 'Add New',
  searchPlaceholder = 'Search…',
  searchKeys = [],
  extraRowAction,
  transformSubmit,
  extraToolbar,
  filterFn,
}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [saving, setSaving] = useState(false)
  const [optionsCache, setOptionsCache] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await service.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not load data. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => { load() }, [load])

  // Resolve select options (static array or async loader keyed on another field's value)
  useEffect(() => {
    if (!showModal) return
    fields.forEach(async (f) => {
      if (f.type !== 'select') return
      if (Array.isArray(f.options)) {
        setOptionsCache((prev) => ({ ...prev, [f.name]: f.options }))
      } else if (typeof f.options === 'function') {
        const depVal = f.dependsOn ? formValues[f.dependsOn] : undefined
        if (f.dependsOn && !depVal) {
          setOptionsCache((prev) => ({ ...prev, [f.name]: [] }))
          return
        }
        try {
          const opts = await f.options(formValues)
          setOptionsCache((prev) => ({ ...prev, [f.name]: opts }))
        } catch {
          setOptionsCache((prev) => ({ ...prev, [f.name]: [] }))
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, formValues.district, formValues.districtId, formValues.talukaId, formValues.taluka])

  const openCreate = () => {
    setEditing(null)
    const init = {}
    fields.forEach((f) => { init[f.name] = f.default ?? '' })
    setFormValues(init)
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setFormValues({ ...row })
    setShowModal(true)
  }

  const handleChange = (name, value) => {
    setFormValues((prev) => {
      const next = { ...prev, [name]: value }
      // reset dependent fields when a parent field changes
      fields.forEach((f) => { if (f.dependsOn === name) next[f.name] = '' })
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      // If a page provided a custom transformSubmit, use it. Otherwise apply a safe automatic transform:
      // - Convert fields like districtId / talukaId / centerId into nested objects { district: { id } },
      //   and also include primitive variants (districtId, district_id) to maximize compatibility with backend DTOs.
      const autoTransform = (fv) => {
        const out = { ...fv }
        Object.keys(fv).forEach((k) => {
          const v = fv[k]
          if (v === '' || v === null || typeof v === 'undefined') {
            // drop empty values to avoid inserting empty strings into NOT NULL columns
            delete out[k]
            return
          }

          // camelCase Id -> base (e.g., districtId -> district)
          const m = k.match(/^(.+?)(Id|ID|id)$/)
          if (m) {
            const base = m[1]
            const idNum = Number(v)
            if (!Number.isNaN(idNum)) {
              out[base] = { id: idNum }
              out[`${base}Id`] = idNum
              out[`${base}_id`] = idNum
              // keep original key removed to avoid confusion if it's a string
              delete out[k]
            }
            return
          }

          // snake_case id -> base (e.g., district_id -> district)
          const m2 = k.match(/^(.+)_id$/)
          if (m2) {
            const base = m2[1]
            const idNum = Number(v)
            if (!Number.isNaN(idNum)) {
              out[base] = { id: idNum }
              out[`${base}Id`] = idNum
              out[`${base}_id`] = idNum
              delete out[k]
            }
            return
          }
        })
        return out
      }

      let payload = null
      if (transformSubmit) {
        payload = await transformSubmit(formValues, editing)
      } else {
        payload = autoTransform(formValues)
      }

      // Ensure editing id is sent when updating
      if (editing && editing.id) payload.id = editing.id

      // Development debug: show outgoing payload so backend contract mismatches are visible in console
      try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.debug('CrudManager outgoing payload:', payload)
        }
      } catch (err) {
        // ignore
      }

      if (editing) {
        await service.update(editing.id, payload)
      } else {
        await service.create(payload)
      }
      setShowModal(false)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed. Please check the fields and try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return
    try {
      await service.remove(row.id)
      setRows((prev) => prev.filter((r) => r.id !== row.id))
    } catch (e) {
      alert(e?.response?.data?.message || 'Delete failed.')
    }
  }

  const filteredRows = useMemo(() => {
    let result = rows
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase()
      result = result.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    if (filterFn) result = result.filter(filterFn)
    return result
  }, [rows, search, searchKeys, filterFn])

  const tableColumns = [
    ...columns,
    {
      key: '__actions',
      label: 'Actions',
      width: 150,
      render: (row) => (
        <div className="table-actions">
          <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)}><FiEdit2 /></button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}><FiTrash2 /></button>
          {extraRowAction && (
            <button className="btn btn-gold btn-sm" onClick={() => extraRowAction.onClick(row)}>
              {extraRowAction.icon} {extraRowAction.label}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> {addLabel}</button>
      </div>

      {searchKeys.length > 0 && (
        <div className="toolbar">
          <div className="form-group">
            <label><FiSearch /> Search</label>
            <input placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {extraToolbar}
        </div>
      )}

      {error && !showModal && <div className="login-alert" style={{ marginBottom: 14 }}>{error}</div>}

      <DataTable columns={tableColumns} rows={filteredRows} loading={loading} />

      {showModal && (
        <Modal
          title={editing ? `Edit ${title}` : `${addLabel}`}
          onClose={() => setShowModal(false)}
          footer={(
            <>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
        >
          {error && <div className="login-alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            {fields.map((f) => (
              <FormField
                key={f.name}
                field={f}
                value={formValues[f.name]}
                onChange={handleChange}
                options={optionsCache[f.name]}
              />
            ))}
          </form>
        </Modal>
      )}
    </div>
  )
}
