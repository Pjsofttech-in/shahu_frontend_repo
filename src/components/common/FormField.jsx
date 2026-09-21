import React from 'react'
import MediaReplaceField from './MediaReplaceField.jsx'
import RichTextEditor from './RichTextEditor.jsx'

export default function FormField({ field, value, onChange, options, error }) {
  const { name, label, type = 'text', required, placeholder, rows, min, max, maxLength, inputMode } = field
  const hasValue = value !== undefined && value !== null && value !== ''

  const common = {
    id: name,
    name,
    required,
    placeholder: placeholder || label,
    min,
    max,
    maxLength,
    inputMode,
  }

  return (
    <div className={`form-group floating-field${hasValue ? ' has-value' : ''}${field.fullWidth ? ' form-group-full-width' : ''}`}>
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

      {type === 'richtext' && (
        <RichTextEditor id={name} value={value} onChange={(nextValue) => onChange(name, nextValue)} placeholder={placeholder || label} />
      )}

      {type === 'file' && (
        <MediaReplaceField
          id={name}
          label=""
          accept={field.accept}
          currentUrl={field.currentUrl || (typeof value === 'string' ? value : '')}
          value={value instanceof File ? value : null}
          onChange={(nextValue) => onChange(name, nextValue)}
          required={required}
        />
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
