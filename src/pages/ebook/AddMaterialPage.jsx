import React, { useEffect, useState } from 'react'
import { FiCheckCircle, FiFileText, FiImage, FiUpload } from 'react-icons/fi'
import { vmCategoryService, vmMaterialTypeService, vmMaterialService, vmSubCategoryService } from '../../api/services.js'
import Modal from '../../components/common/Modal.jsx'

const initialForm = {
  materialTypeId: '',
  categoryId: '',
  subcategoryId: '',
  seoName: '',
  subjectName: '',
  saveOnPhone: '',
  status: '',
  mrp: '',
  price: '',
  validity: '',
  description: '',
}

const inputStyle = { width: '100%', minWidth: 0 }

export default function AddMaterialPage() {
  const [form, setForm] = useState(initialForm)
  const [materialTypes, setMaterialTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [files, setFiles] = useState({ pdf: null, thumbnail: null, demoPdf: null })
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  useEffect(() => {
    vmMaterialTypeService.getAll()
      .then(setMaterialTypes)
      .catch((error) => console.error('Material types load failed:', error))
      .finally(() => setLoadingTypes(false))
  }, [])

  useEffect(() => {
    const selectedType = materialTypes.find((row) => String(row.id) === String(form.materialTypeId))
    setCategories([])
    setSubcategories([])
    setForm((current) => ({ ...current, categoryId: '', subcategoryId: '' }))
    if (!selectedType?.materialtype) return

    vmCategoryService.getByMaterialType(selectedType.materialtype)
      .then(setCategories)
      .catch((error) => console.error('Categories load failed:', error))
  }, [form.materialTypeId, materialTypes])

  useEffect(() => {
    const selectedCategory = categories.find((row) => String(row.id) === String(form.categoryId))
    setSubcategories([])
    setForm((current) => ({ ...current, subcategoryId: '' }))
    if (!selectedCategory?.categoryName) return

    vmSubCategoryService.getByCategoryName(selectedCategory.categoryName)
      .then(setSubcategories)
      .catch((error) => console.error('Subcategories load failed:', error))
  }, [form.categoryId, categories])

  const change = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const chooseFile = (name, event) => {
    setFiles((current) => ({ ...current, [name]: event.target.files?.[0] || null }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const selectedType = materialTypes.find((row) => String(row.id) === String(form.materialTypeId))
    setError('')
    setSuccess('')
    if (!files.pdf || !files.thumbnail || !files.demoPdf) {
      setError('PDF, thumbnail, and demo PDF are required.')
      return
    }

    try {
      setIsSaving(true)
      await vmMaterialService.create({
        materialType: selectedType?.materialtype || selectedType?.name,
        saveToDevice: form.saveOnPhone === 'yes',
        status: form.status,
        mrp: form.status === 'free' ? 0 : Number(form.mrp),
        price: form.status === 'free' ? 0 : Number(form.price),
        validity: Number(form.validity),
        chapterName: form.subjectName,
        seo: form.seoName,
        discription: form.description,
        subcategoryId: Number(form.subcategoryId),
        demoPdf: files.demoPdf,
        pdfFile: files.pdf,
        thumbnailFile: files.thumbnail,
      })
      setSuccess('Material saved successfully.')
      setIsSuccessModalOpen(true)
      setForm(initialForm)
      setFiles({ pdf: null, thumbnail: null, demoPdf: null })
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Failed to save material.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="ebook-add-material-page" style={{ width: '100%', maxWidth: '1230px', margin: '0 auto' }}>
      <form className="ebook-material-form" onSubmit={submit}>
        <div className="ebook-material-grid">
          <label><span><b>*</b> Select Material</span>
            <select name="materialTypeId" value={form.materialTypeId} onChange={change} style={inputStyle} required>
              <option value="">{loadingTypes ? 'Loading materials...' : 'Select Material'}</option>
              {materialTypes.map((row) => <option key={row.id} value={row.id}>{row.materialtype || row.name}</option>)}
            </select>
          </label>
          <label><span><b>*</b> Select Category</span>
            <select name="categoryId" value={form.categoryId} onChange={change} style={inputStyle} disabled={!form.materialTypeId} required>
              <option value="">Select Category</option>
              {categories.map((row) => <option key={row.id} value={row.id}>{row.categoryName || row.name}</option>)}
            </select>
          </label>
          <label><span><b>*</b> Select Sub-Category</span>
            <select name="subcategoryId" value={form.subcategoryId} onChange={change} style={inputStyle} disabled={!form.categoryId} required>
              <option value="">Select Sub-Category</option>
              {subcategories.map((row) => <option key={row.id} value={row.id}>{row.subcategoryName || row.name}</option>)}
            </select>
          </label>
          <label><span>SEO Name</span><input name="seoName" value={form.seoName} onChange={change} style={inputStyle} /></label>

          <label><span><b>*</b> Subject Name</span><input name="subjectName" value={form.subjectName} onChange={change} style={inputStyle} required /></label>
          <label><span><b>*</b> Save on Phone</span>
            <select name="saveOnPhone" value={form.saveOnPhone} onChange={change} style={inputStyle} required><option value="">Select</option><option value="yes">Yes</option><option value="no">No</option></select>
          </label>
          <label><span><b>*</b> Status</span>
            <select name="status" value={form.status} onChange={change} style={inputStyle} required><option value="">Select</option><option value="free">Free</option><option value="paid">Paid</option></select>
          </label>
          <label><span><b>*</b> MRP</span><input type="number" min="0" name="mrp" value={form.mrp} onChange={change} style={inputStyle} required /></label>

          <label><span><b>*</b> Price</span><input type="number" min="0" name="price" value={form.price} onChange={change} style={inputStyle} required /></label>
          <label><span><b>*</b> Validity (in months)</span><input type="number" min="0" name="validity" value={form.validity} onChange={change} style={inputStyle} required /></label>
        </div>

        <label className="ebook-description-field"><span><b>*</b> Description</span>
          <div className="ebook-editor">
            <div className="ebook-editor-menu">File&nbsp;&nbsp;&nbsp; Edit&nbsp;&nbsp;&nbsp; View&nbsp;&nbsp;&nbsp; Insert&nbsp;&nbsp;&nbsp; Format&nbsp;&nbsp;&nbsp; Tools&nbsp;&nbsp;&nbsp; Table&nbsp;&nbsp;&nbsp; Help</div>
            <div className="ebook-editor-toolbar"><strong>↶</strong><strong>↷</strong><strong>B</strong><em>I</em><u>U</u><strong>A</strong><span>⌄</span><strong>▰</strong><span>⌄</span><strong>≡</strong><strong>☷</strong><strong>≣</strong><strong>☰</strong><strong>☷</strong><span>⌄</span><strong>↗</strong><strong>↙</strong><span>⌁</span><strong>▧</strong><strong>▦</strong><strong>x₂</strong><strong>&lt;/&gt;</strong><strong>⛶</strong><strong>?</strong></div>
            <textarea name="description" value={form.description} onChange={change} aria-label="Description" required />
            <div className="ebook-editor-status"><span>p</span><span>Press Alt+0 for help</span><span>0 words&nbsp;&nbsp; Build with tinyMCE</span></div>
          </div>
        </label>

        <div className="ebook-upload-grid">
          <FilePicker label="Upload PDF" icon={<FiFileText />} file={files.pdf} onChange={(event) => chooseFile('pdf', event)} />
          <FilePicker label="Upload Thumbnail" icon={<FiImage />} file={files.thumbnail} onChange={(event) => chooseFile('thumbnail', event)} />
          <FilePicker label="Upload Demo PDF" icon={<FiFileText />} file={files.demoPdf} onChange={(event) => chooseFile('demoPdf', event)} />
        </div>
        {error && <div className="field-error" role="alert" style={{ marginTop: '18px' }}>{error}</div>}
        {success && <div style={{ color: 'var(--success)', fontSize: '12px', marginTop: '18px' }}>{success}</div>}
        <button className="ebook-add-material-submit" type="submit" disabled={isSaving}>{isSaving ? 'Saving Material...' : 'Add Material'}</button>
      </form>

      {isSuccessModalOpen && (
        <Modal
          title="Material Added Successfully"
          onClose={() => setIsSuccessModalOpen(false)}
          footer={<button className="btn btn-primary" onClick={() => setIsSuccessModalOpen(false)}>Continue</button>}
          maxWidth="450px"
        >
          <div className="ebook-success-modal">
            <div className="ebook-success-icon"><FiCheckCircle /></div>
            <h3>Your material is now live</h3>
            <p>The material and uploaded files were saved successfully to the database.</p>
          </div>
        </Modal>
      )}
    </div>
  )
}

function FilePicker({ label, icon, file, onChange }) {
  return (
    <label className="ebook-file-picker"><span>{label}</span>
      <span className="ebook-file-button">{icon}<FiUpload /> {file ? file.name : label}<input type="file" accept={label.includes('Thumbnail') ? 'image/*' : '.pdf,application/pdf'} onChange={onChange} /></span>
    </label>
  )
}
