import React, { useState } from 'react'

export default function DescriptionPreview({ value, words = 4 }) {
  const [expanded, setExpanded] = useState(false)
  const text = String(value || '').trim()
  if (!text) return <span>—</span>

  const parts = text.split(/\s+/)
  const isLong = parts.length > words
  const preview = parts.slice(0, words).join(' ')

  return (
    <span className="description-preview">
      {expanded || !isLong ? text : `${preview}...`}
      {isLong && (
        <button type="button" className="description-toggle" onClick={(event) => { event.stopPropagation(); setExpanded((current) => !current) }}>
          {expanded ? 'Less' : 'More'}
        </button>
      )}
    </span>
  )
}
