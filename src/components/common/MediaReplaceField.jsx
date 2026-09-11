import React, { useEffect, useState } from 'react'
import { FiExternalLink, FiRefreshCw } from 'react-icons/fi'

export default function MediaReplaceField({
  id,
  label,
  accept,
  currentUrl = '',
  value,
  onChange,
  required = false,
  preview = false,
  multiple = false,
}) {
  const [replace, setReplace] = useState(false)
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => {
    setReplace(false)
    setPreviewFailed(false)
  }, [currentUrl])

  const hasCurrent = Boolean(currentUrl)
  const hasNewFile = multiple ? Array.isArray(value) && value.length > 0 : Boolean(value)

  return (
    <div className="form-group media-replace-field">
      <label htmlFor={id}>{label}{required && ' *'}</label>
      {hasCurrent && !replace && (
        <div className="current-media-row">
          {preview && !previewFailed ? <img className="media-replace-preview" src={currentUrl} alt="Current" onError={() => setPreviewFailed(true)} /> : <span>Existing file</span>}
          <a href={currentUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" title="Open existing file">
            <FiExternalLink /> Open
          </a>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => { onChange(null); setReplace(true) }}>
            <FiRefreshCw /> Replace
          </button>
        </div>
      )}
      {(!hasCurrent || replace) && (
        <>
          <input
            id={id}
            type="file"
            accept={accept}
            multiple={multiple}
            required={required && !hasCurrent}
            onChange={(event) => onChange(multiple ? Array.from(event.target.files || []) : event.target.files?.[0] || null)}
          />
          {replace && hasCurrent && (
            <button type="button" className="btn btn-outline btn-sm media-replace-cancel" onClick={() => { onChange(null); setReplace(false) }}>
              Keep existing file
            </button>
          )}
          {hasNewFile && <span className="media-replace-selected">Selected: {multiple ? `${value.length} file(s)` : value.name}</span>}
        </>
      )}
    </div>
  )
}