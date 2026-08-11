import React, { useEffect, useState } from 'react'
import FormField from './FormField.jsx'

export default function SingletonForm({ title, subtitle, service, fields, transformSubmit, preview }) {
  const [values, setValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const data = await service.get()
        setValues(data || {})
      } catch {
        setValues({})
      } finally {
        setLoading(false)
      }
    })()
  }, [service])

  const handleChange = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const payload = transformSubmit ? await transformSubmit(values) : values
      const saved = await service.update(payload)
      setValues(saved || payload)
      setMessage('Saved successfully — changes are now live on the website.')
    } catch (e) {
      setError(e?.response?.data?.message || 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>
      </div>

      {preview && preview(values)}

      <div className="card" style={{ marginTop: preview ? 18 : 0, maxWidth: 640 }}>
        {loading ? (
          <div className="loading-block">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit}>
            {message && <div className="login-alert" style={{ background: 'var(--success-100)', color: 'var(--success)' }}>{message}</div>}
            {error && <div className="login-alert">{error}</div>}
            {fields.map((f) => (
              <FormField key={f.name} field={f} value={values[f.name]} onChange={handleChange} />
            ))}
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
