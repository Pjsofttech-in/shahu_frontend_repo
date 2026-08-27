import React, { useEffect, useState } from 'react'
import { FiEdit2, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi'
import Modal from '../../components/common/Modal.jsx'
import { categoryService, testSeriesService } from '../../api/services.js'

const EMPTY_FORM = {
  title: '', description: '', price: '', mrp: '',
  testFeatureOne: '', testFeatureTwo: '', testFeatureThree: '', subject: '', seo: '',
  active: true, startDate: '', endDate: '', categoryId: '', image: '',
}

const getRows = (data) => Array.isArray(data) ? data : data?.content || []
const getError = (error, fallback) => {
  const raw = error?.response?.data?.message || error?.response?.data?.error || error?.response?.data || error?.message || fallback
  const message = String(raw)
  if (/foreign key constraint|cannot delete or update a parent row|test_series_id/i.test(message)) {
    return 'This Test Series cannot be deleted because subjects are linked to it. Delete or reassign the linked subjects first, or enable cascade delete in the backend.'
  }
  if (/result_finalized|doesn.t have a default value/i.test(message)) {
    return 'The backend database requires result_finalized, but the current TestSeries backend model does not provide it. Add resultFinalized to the Spring Boot entity/request mapping or give the database column a default value.'
  }
  return raw
}
const getCategoryId = (row) => row.categoryId ?? row.category?.id ?? ''
const getImageValue = (row) => row.image || row.imageUrl || row.imageName || row.testSeriesImage || row.testSeriesImageName || ''
const resolveImageUrl = (value) => {
  if (!value) return ''
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value

  const apiUrl = import.meta.env.VITE_API_BASE_URL?.trim() || window.location.origin
  const origin = apiUrl.replace(/\/api(?:\/.*)?\/?$/, '').replace(/\/$/, '')
  return `${origin}/${String(value).replace(/^\/+/, '')}`
}

const SeriesImage = ({ value, className, alt = '' }) => {
  const [failed, setFailed] = useState(false)
  const source = resolveImageUrl(value)
  if (!source || failed) return <FiImage aria-label="Image unavailable" />
  return <img className={className} src={source} alt={alt} onError={() => setFailed(true)} />
}

export default function SeriesManager() {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [seriesData, categoryData] = await Promise.all([testSeriesService.getAll(), categoryService.getAll()])
      setRows(getRows(seriesData))
      setCategories(getRows(categoryData))
      setError('')
    } catch (loadError) {
      setError(getError(loadError, 'Could not load Test Series data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setPreview(null)
    setError('')
    setShowModal(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      ...EMPTY_FORM,
      ...row,
      categoryId: getCategoryId(row),
      active: row.active !== false,
      image: getImageValue(row),
    })
    setImageFile(null)
    setPreview(resolveImageUrl(getImageValue(row)) || null)
    setError('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setImageFile(null)
    setPreview(null)
    setForm(EMPTY_FORM)
  }

  const change = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const changeImage = (event) => {
    const file = event.target.files?.[0] || null
    setImageFile(file)
    setPreview(file ? URL.createObjectURL(file) : editing?.image || null)
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim() || !form.categoryId) {
      setError('Title, description, and category are required.')
      return
    }
    if (!editing && !imageFile) {
      setError('Test Series image is required.')
      return
    }

    const values = { ...form }
    delete values.image
    values.title = values.title.trim()
    values.description = values.description.trim()
    values.categoryId = Number(values.categoryId)
    ;['price', 'mrp'].forEach((key) => { values[key] = values[key] === '' ? null : Number(values[key]) })
    ;['startDate', 'endDate', 'seo', 'subject', 'testFeatureOne', 'testFeatureTwo', 'testFeatureThree'].forEach((key) => { if (!values[key]) values[key] = null })

    setSaving(true)
    setError('')
    try {
      if (editing) await testSeriesService.update(editing.id, values, imageFile)
      else await testSeriesService.create(values, imageFile)
      closeModal()
      await load()
    } catch (saveError) {
      setError(getError(saveError, 'Could not save Test Series.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete Test Series "${row.title || row.id}"?`)) return
    try {
      await testSeriesService.remove(row.id)
      await load()
    } catch (deleteError) {
      setError(getError(deleteError, 'Could not delete Test Series.'))
    }
  }

  const filtered = rows.filter((row) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [row.title, row.subject, row.description].some((value) => String(value || '').toLowerCase().includes(query))
    const matchesCategory = !categoryFilter || String(getCategoryId(row)) === String(categoryFilter)
    const matchesActive = !activeFilter || String(row.active !== false) === activeFilter
    return matchesSearch && matchesCategory && matchesActive
  })

  return (
    <section className="series-manager">
      <div className="page-header">
        <div><h1>Test Series</h1><p>Manage test series connected to the live database.</p></div>
        <button className="btn btn-primary" type="button" onClick={openAdd}><FiPlus /> Create Test Series</button>
      </div>
      {error && !showModal && <div className="login-alert">{String(error)}</div>}
      <div className="series-filters">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search test series…" aria-label="Search test series" />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter by category">
          <option value="">All Categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.categoryName || category.name}</option>)}
        </select>
        <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} aria-label="Filter by status">
          <option value="">All Statuses</option><option value="true">Active</option><option value="false">Inactive</option>
        </select>
      </div>
      <div className="card series-table-card">
        <div className="table-wrap">
          <table className="data-table series-table">
            <thead><tr><th>ID</th><th>Name</th><th>Exam Type</th><th>Price</th><th>MRP</th><th>Category</th><th>Features</th><th>Description</th><th>Active</th><th>Created At</th><th>Image</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr className="empty-row"><td colSpan="13">Loading test series…</td></tr>}
              {!loading && filtered.length === 0 && <tr className="empty-row"><td colSpan="13">No test series found.</td></tr>}
              {!loading && filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td><td>{row.title || '—'}</td><td>{row.subject || row.examType || '—'}</td><td>{row.price ?? '—'}</td><td>{row.mrp ?? '—'}</td>
                  <td>{row.category?.categoryName || row.category?.name || row.categoryName || getCategoryId(row) || '—'}</td><td>{[row.testFeatureOne, row.testFeatureTwo, row.testFeatureThree].filter(Boolean).join(', ') || '—'}</td><td className="series-description-cell">{row.description || '—'}</td>
                  <td><span className={`badge ${row.active === false ? 'badge-inactive' : 'badge-active'}`}>{row.active === false ? 'Inactive' : 'Active'}</span></td>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                  <td><SeriesImage value={getImageValue(row)} className="series-thumb" /></td>
                  <td><div className="table-actions"><button className="btn btn-outline btn-sm" type="button" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><FiEdit2 /></button><button className="btn btn-danger btn-sm" type="button" onClick={() => remove(row)} aria-label={`Delete ${row.title}`}><FiTrash2 /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <Modal title={editing ? 'Edit Test Series' : 'Create Test Series'} onClose={closeModal} maxWidth="980px" footer={<><button className="btn btn-outline" type="button" onClick={closeModal}>Cancel</button><button className="btn btn-primary" type="submit" form="series-form" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button></>}>
        {error && <div className="login-alert">{String(error)}</div>}
        <form id="series-form" onSubmit={submit} className="series-form">
          <div className="series-form-grid">
            <div className="form-group"><label htmlFor="series-title">Test Series Title *</label><input id="series-title" name="title" value={form.title} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="series-price">Price *</label><input id="series-price" name="price" type="number" min="0" value={form.price} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="series-mrp">MRP *</label><input id="series-mrp" name="mrp" type="number" min="0" value={form.mrp} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="series-category">Category *</label><select id="series-category" name="categoryId" value={form.categoryId} onChange={change} required><option value="">Select Category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.categoryName || category.name}</option>)}</select></div>
            <div className="form-group"><label htmlFor="series-subject">Subject</label><input id="series-subject" name="subject" value={form.subject} onChange={change} /></div>
            <div className="form-group"><label htmlFor="series-feature-one">Test Feature One *</label><input id="series-feature-one" name="testFeatureOne" value={form.testFeatureOne} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="series-feature-two">Test Feature Two *</label><input id="series-feature-two" name="testFeatureTwo" value={form.testFeatureTwo} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="series-feature-three">Test Feature Three *</label><input id="series-feature-three" name="testFeatureThree" value={form.testFeatureThree} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="series-start">Start Date</label><input id="series-start" name="startDate" type="date" value={form.startDate} onChange={change} /></div>
            <div className="form-group"><label htmlFor="series-end">End Date</label><input id="series-end" name="endDate" type="date" value={form.endDate} onChange={change} /></div>
            <div className="form-group"><label htmlFor="series-seo">SEO</label><input id="series-seo" name="seo" value={form.seo} onChange={change} /></div>
          </div>
          <div className="form-group"><label htmlFor="series-description">Description *</label><textarea id="series-description" name="description" rows="7" value={form.description} onChange={change} required /></div>
          <div className="series-form-bottom">
            <div className="form-group"><label htmlFor="series-image">Image {!editing && '*'}</label><input id="series-image" type="file" accept="image/*" onChange={changeImage} required={!editing} />{preview && <img className="series-preview" src={preview} alt="Test Series preview" />}</div>
            <label className="series-active"><input name="active" type="checkbox" checked={!!form.active} onChange={change} /> Active</label>
          </div>
        </form>
      </Modal>}
    </section>
  )
}
