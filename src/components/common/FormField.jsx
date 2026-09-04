import React from 'react'

export default function FormField({ field, value, onChange, options, error }) {
  const { name, label, type = 'text', required, placeholder, rows } = field
  const hasValue = value !== undefined && value !== null && value !== ''

  const common = {
    id: name,
    name,
    required,
    placeholder: placeholder || label,
  }

  return (
    <div className={`form-group floating-field${hasValue ? ' has-value' : ''}`}>
      <label htmlFor={name}>{label}{required && ' *'}</label>

      {type === 'select' && (
        <select {...common} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)}>
          <option value=""> </option>
          {(options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {type === 'textarea' && (
        <textarea {...common} rows={rows || 3} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} />
      )}

      {type === 'file' && (
        <div className="file-input-wrap">
          <input
            type="file"
            accept={field.accept}
            onChange={(e) => onChange(name, e.target.files[0])}
          />
          {typeof value === 'string' && value && (
            <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>current file</a>
          )}
        </div>
      )}

      {type === 'checkbox' && (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(name, e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
      )}

      {['text', 'email', 'password', 'number', 'date', 'tel', 'url'].includes(type) && (
        <input {...common} type={type} value={value ?? ''} onChange={(e) => onChange(name, e.target.value)} />
      )}

      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
