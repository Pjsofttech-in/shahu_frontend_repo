import React from 'react'
import MediaReplaceField from './MediaReplaceField.jsx'
import RichTextEditor from './RichTextEditor.jsx'

export const formatIndianDate = (value) => {
  const match = String(value ?? '').slice(0, 10).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value ?? '')
}

const toIsoDate = (value) => {
  const match = String(value ?? '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return value
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
}

export default function FormField({ field, value, onChange, options, error }) {
  const { name, label, type = 'text', required, placeholder, rows, min, max, maxLength, inputMode, dateFormat } = field
  const hasValue = value !== undefined && value !== null && value !== ''
  const isIndianDate = type === 'date' && dateFormat === 'DD/MM/YYYY'

  const common = {
    id: name,
    name,
    required,
    placeholder: placeholder || (isIndianDate ? 'DD/MM/YYYY' : label),
    min,
    max,
    maxLength,
    inputMode: isIndianDate ? 'numeric' : inputMode,
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
        <input
          {...common}
          type={isIndianDate ? 'text' : type}
          value={isIndianDate ? formatIndianDate(value) : (value ?? '')}
          onChange={(e) => onChange(name, isIndianDate ? toIsoDate(e.target.value) : e.target.value)}
        />
      )}

      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
