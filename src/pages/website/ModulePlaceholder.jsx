import React from 'react'

export default function ModulePlaceholder({ title }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>This website module is ready to be connected to its content settings.</p>
      </div>
    </div>
  )
}