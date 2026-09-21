import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import DataTable from './DataTable.jsx'
import Modal from './Modal.jsx'
import FormField from './FormField.jsx'
import Pagination from './Pagination.jsx'

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
  showEditAction = true,
  showDeleteAction = true,
  rowClickEdit = true,
  showCreateAction = true,
  initialFormValues = {},
  onResetFilters,
  uniqueFields = [],
  formColumns = 2,
  getRowId = (row) => row?.id,
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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const getApiErrorMessage = (e, fallback = 'Something went wrong') => {
    const payload = e?.response?.data

    if (!payload) return e?.message || fallback
    if (typeof payload === 'string') return payload
    if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message
    if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error

    if (Array.isArray(payload)) {
      const text = payload.map((item) => (typeof item === 'string' ? item : item?.message || item?.error || '')).filter(Boolean).join(', ')
      if (text) return text
    }

    if (payload?.errors && typeof payload.errors === 'object') {
      const text = Object.values(payload.errors)
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .map((value) => (typeof value === 'string' ? value : value?.message || value?.error || ''))
        .filter(Boolean)
        .join(', ')
      if (text) return text
    }

    const fallbackText = JSON.stringify(payload)
    return fallbackText && fallbackText !== '{}' ? fallbackText : e?.message || fallback
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await service.getAll()
      setRows(Array.isArray(data) ? data : data?.content || [])
    } catch (e) {
      setError(getApiErrorMessage(e, 'Could not load data. Check backend connection.'))
    } finally {
      setLoading(false)
    }
  }, [service])

  useEffect(() => { load() }, [load])

  // Resolve select options (static array or async loader keyed on another field's value)
  useEffect(() => {
    if (!showModal) return
    
    const loadOptions = async () => {
      for (const f of fields) {
        if (f.type !== 'select') continue
        
        if (Array.isArray(f.options)) {
          setOptionsCache((prev) => ({ ...prev, [f.name]: f.options }))
        } else if (typeof f.options === 'function') {
          const depVal = f.dependsOn ? formValues[f.dependsOn] : undefined
          
          // If field depends on another field but that field is empty, clear options
          if (f.dependsOn && !depVal) {
            setOptionsCache((prev) => ({ ...prev, [f.name]: [] }))
            continue
          }
          
          try {
            const opts = await f.options(formValues, editing)
            setOptionsCache((prev) => ({ ...prev, [f.name]: opts }))
          } catch (err) {
            console.error(`Failed to load options for ${f.name}:`, err)
            setOptionsCache((prev) => ({ ...prev, [f.name]: [] }))
          }
        }
      }
    }
    
    loadOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, formValues.districtId, formValues.talukaId, editing])

  const openCreate = () => {
    setEditing(null)

    const init = {}
    fields.forEach((f) => {
      init[f.name] = f.default ?? ''
    })

    setFormValues({
      ...init,
      ...initialFormValues,
    })
    setShowModal(true)
  }

  const openEdit = async (row) => {
    const rowId = getRowId(row)
    let fullRow = row

    if (rowId !== undefined && rowId !== null && rowId !== '' && typeof service.getById === 'function') {
      try {
        const response = await service.getById(rowId)
        const fetched = response?.data && typeof response.data === 'object' ? response.data : response
        fullRow = fetched?.student && typeof fetched.student === 'object' ? { ...fetched.student, id: fetched.student.id ?? rowId } : { ...fetched, id: fetched?.id ?? rowId }
      } catch (fetchError) {
        console.warn('Could not fetch the complete record for editing; using the list row.', fetchError)
      }
    }

    setEditing(fullRow)
    const values = { ...fullRow }
    fields.forEach((field) => {
      if (typeof field.editValue === 'function') {
        const editedValue = field.editValue(fullRow)
        if (editedValue !== undefined && editedValue !== null) {
          values[field.name] = editedValue
          return
        }
      }

      if (values[field.name] !== undefined && values[field.name] !== null) return
      const snakeCaseName = field.name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
      const alias = [snakeCaseName, ...(field.editAliases || [])].find((key) => fullRow[key] !== undefined && fullRow[key] !== null)
      if (alias) values[field.name] = fullRow[alias]
    })
    setFormValues(values)
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
            delete out[k]
            return
          }

          if (typeof v === 'string') {
            const trimmed = v.trim()
            if (trimmed === '') {
              delete out[k]
              return
            }
            out[k] = trimmed
          }

          const idMatch = k.match(/^(.+?)(Id|ID|id)$/)
          if (idMatch && !Number.isNaN(Number(v))) {
            out[k] = Number(v)
          }

          const snakeMatch = k.match(/^(.+)_id$/)
          if (snakeMatch && !Number.isNaN(Number(v))) {
            out[k] = Number(v)
          }
        })

        return out
      }

      let payload = null
      try {
        if (transformSubmit) {
          payload = await transformSubmit(formValues, editing)
        } else {
          payload = autoTransform(formValues)
        }
      } catch (transformErr) {
        // Validation error from transformSubmit
        setError(getApiErrorMessage(transformErr, 'Form validation failed'))
        setSaving(false)
        return
      }

      const editingId = editing ? getRowId(editing) : null

      // Ensure the canonical record id is sent when updating.
      if (editing && editingId !== undefined && editingId !== null && editingId !== '') payload.id = editingId

      const normalizeIdFields = (obj) => {
        const normalized = { ...obj }

        Object.entries(normalized).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') return

          const isIdLikeKey = /(?:Id|_id)$/i.test(key)

          if (isIdLikeKey) {
            if (typeof value === 'object' && value !== null && 'value' in value) {
              const coerced = Number(value.value)
              if (!Number.isNaN(coerced)) normalized[key] = coerced
              return
            }

            const coerced = Number(value)
            if (!Number.isNaN(coerced)) normalized[key] = coerced
          }
        })

        return normalized
      }

      payload = normalizeIdFields(payload)

      if (uniqueFields.length > 0) {
        const readField = (record, field) => {
          const aliases = {
            districtId: ['districtId', 'district_id', 'district.id'],
            talukaId: ['talukaId', 'taluka_id', 'taluka.id'],
            centerId: ['centerId', 'center_id', 'center.id'],
          }
          const keys = aliases[field] || [field]
          return keys
            .map((key) => key.split('.').reduce((value, part) => value?.[part], record))
            .find((value) => value !== undefined && value !== null)
        }
        const normalizedValue = (value) => String(value ?? '').trim().toLowerCase()
        const duplicate = rows.some((row) => {
          if (editing && row.id === editing.id) return false
          return uniqueFields.every((field) => normalizedValue(readField(payload, field)) === normalizedValue(readField(row, field)))
        })

        if (duplicate) {
          throw new Error('This entry already exists. Please use a different value.')
        }
      }

      // Ensure all ID fields are numeric and never null/undefined for required foreign keys
      // Remove null/undefined values to avoid sending them to the backend
      Object.keys(payload).forEach((key) => {
        const val = payload[key]
        if (val === null || val === undefined || val === '') {
          delete payload[key]
        }
      })

      // Development debug: show outgoing payload so backend contract mismatches are visible in console
      try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'development') {
          // eslint-disable-next-line no-console
          console.debug('CrudManager outgoing payload:', { formValues, payload, editing })
        }
      } catch (err) {
        // ignore
      }

      if (editing) {
        if (editingId === undefined || editingId === null || editingId === '') {
          throw new Error('This record does not have a valid ID and cannot be updated.')
        }
        await service.update(editingId, payload)
      } else {
        console.log(
          'FINAL CREATE REQUEST:',
          JSON.stringify(payload, null, 2)
        )
        await service.create(payload)
      }
      setShowModal(false)
      await load()
    } catch (e) {
      // Handle both validation errors (from transformSubmit) and backend errors
      setError(getApiErrorMessage(e, 'Save failed. Please check the fields and try again.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this record? This cannot be undone.')) return
    try {
      const rowId = getRowId(row)
      if (rowId === undefined || rowId === null || rowId === '') {
        throw new Error('This student does not have a valid ID and cannot be deleted.')
      }

      await service.remove(rowId)
      setRows((prev) => prev.filter((currentRow) => getRowId(currentRow) !== rowId))
    } catch (e) {
      const backendMessage = getApiErrorMessage(e, 'Delete failed.')
      const isPaymentConstraint = /payment|foreign key|constraint|referenced/i.test(backendMessage)
      alert(isPaymentConstraint
        ? 'This student cannot be deleted because payment records are linked to the student. Remove the linked payments or use the backend soft-delete option.'
        : backendMessage)
    }
  }

  const resetFilters = () => {
    setSearch('')
    onResetFilters?.()
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

  useEffect(() => {
    setPage(1)
  }, [search, pageSize])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRows.slice(start, start + pageSize)
  }, [filteredRows, currentPage, pageSize])

  const fieldGroups = useMemo(() => {
    const groups = []
    const visibleFields = fields.filter((field) => (
      typeof field.hidden === 'function' ? !field.hidden(formValues, editing) : !field.hidden
    ))
    for (let index = 0; index < visibleFields.length; index += formColumns) {
      groups.push(visibleFields.slice(index, index + formColumns))
    }
    return groups
  }, [fields, formColumns, formValues, editing])

  const hasActions = showDeleteAction || extraRowAction
  const tableColumns = hasActions ? [
    ...columns,
    {
      key: '__actions',
      label: 'Actions',
      width: 150,
      render: (row) => (
        <div className="table-actions">
          {showDeleteAction && <button className="btn btn-danger btn-sm" onClick={(event) => { event.stopPropagation(); handleDelete(row) }}><FiTrash2 /></button>}
          {extraRowAction && (
            <button className="btn btn-gold btn-sm" onClick={(event) => { event.stopPropagation(); extraRowAction.onClick(row) }}>
              {extraRowAction.icon} {typeof extraRowAction.label === 'function' ? extraRowAction.label(row) : extraRowAction.label}
            </button>
          )}
        </div>
      ),
    },
  ] : columns

  return (
    <div>
      <div className="filter-section">
        <div className="filter-controls-row">
          {searchKeys.length > 0 && (
            <div className="form-group">
              <input aria-label="Search" placeholder={searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
          {extraToolbar}
          <div className="result-count">Showing <strong>{filteredRows.length}</strong> of {rows.length} records</div>
          {showCreateAction && (
            <button className="btn btn-primary crud-inline-add" data-open-create onClick={openCreate}>
              <FiPlus /> {addLabel}
            </button>
          )}
        </div>
      </div>

      {error && !showModal && <div className="login-alert" style={{ marginBottom: 14 }}>{error}</div>}

      <DataTable columns={tableColumns} rows={pagedRows} loading={loading} onRowClick={rowClickEdit ? openEdit : undefined} />
      {!loading && filteredRows.length > 0 && (
        <Pagination
          page={currentPage}
          pageSize={pageSize}
          totalItems={filteredRows.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}

      {showModal && (
        <Modal
          title={editing ? `Edit ${title}` : `${addLabel}`}
          onClose={() => setShowModal(false)}
          maxWidth={formColumns >= 4 ? '1100px' : '760px'}
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
            {fieldGroups.map((group, groupIndex) => (
              <div className={`form-row form-row-${formColumns}`} key={`group-${groupIndex}`}>
                {group.map((f) => (
                  <FormField
                    key={f.name}
                    field={{
                      ...f,
                      currentUrl: typeof f.currentUrl === 'function' ? f.currentUrl(formValues, editing) : f.currentUrl,
                    }}
                    value={formValues[f.name]}
                    onChange={handleChange}
                    options={optionsCache[f.name]}
                  />
                ))}
              </div>
            ))}
          </form>
        </Modal>
      )}
    </div>
  )
}
