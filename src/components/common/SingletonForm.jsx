import React, { useEffect, useState } from 'react'
import FormField from './FormField.jsx'

export default function SingletonForm({ title, subtitle, service, fields, transformSubmit, preview, showHeader = true, emptySaveLabel = 'Add', formClassName = '', startCollapsed = false, initialActionLabel = 'Add' }) {
  const [values, setValues] = useState({})
  const [initialValues, setInitialValues] = useState({})
  const [formOpen, setFormOpen] = useState(!startCollapsed)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await service.get()
        setValues(data || {})
        setInitialValues(data || {})
      } catch {
        setValues({})
        setInitialValues({})
      } finally {
        setLoading(false)
      }
    })()
  }, [service])

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))
  const hasChanges = JSON.stringify(values) !== JSON.stringify(initialValues)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = transformSubmit ? await transformSubmit(values) : values
      const saved = await service.update(payload)
      setValues(saved || payload)
      setInitialValues(saved || payload)
      setMessage('Saved successfully — changes are now live on the website.')
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {showHeader && <div className="page-header">
        <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      </div>}

      {preview && preview(values)}

      <div className="card singleton-form-card" style={{ marginTop: preview ? 18 : 0 }}>
        {loading ? (
          <div className="loading-block">Loading…</div>
        ) : !formOpen ? (
          <div className="singleton-empty-state">
            <h2>{values.id ? 'Exam Info Available' : 'No Exam Info Added'}</h2>
            <p>{values.id ? 'Open the saved exam information to review or update it.' : 'Add exam information to publish it to the live Sankalp exam page.'}</p>
            <button className="btn btn-primary" type="button" onClick={() => setFormOpen(true)}>{initialActionLabel}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={`singleton-form ${formClassName}`.trim()}>
            {message && <div className="login-alert" style={{ background: 'var(--success-100)', color: 'var(--success)' }}>{message}</div>}
            {error && <div className="login-alert">{error}</div>}
            {fields.map((f) => (
              <FormField key={f.name} field={f} value={values[f.name]} onChange={handleChange} />
            ))}
            <button className="btn btn-primary" type="submit" disabled={saving || !hasChanges}>
              {saving ? 'Saving…' : hasChanges ? (values.id ? 'Save Changes' : emptySaveLabel) : values.id ? 'No Changes' : emptySaveLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
