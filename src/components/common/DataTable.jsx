import React from 'react'
import DescriptionPreview from './DescriptionPreview.jsx'

export default function DataTable({ columns, rows, rowKey = 'id', loading, emptyText = 'No records found.', onRowClick }) {
    const isDescriptionColumn = (key) => /description|message|vision|mission/i.test(key)

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr className="empty-row"><td colSpan={columns.length}>Loading…</td></tr>
          )}
          {!loading && rows.length === 0 && (
            <tr className="empty-row"><td colSpan={columns.length}>{emptyText}</td></tr>
          )}
          {!loading && rows.map((row) => (
            <tr key={row[rowKey]} className={onRowClick ? 'is-clickable' : ''} onClick={() => onRowClick?.(row)}>
              {columns.map((c) => {
                const value = c.render ? c.render(row) : row[c.key]
                const preview = isDescriptionColumn(c.key) && (typeof value === 'string' || typeof value === 'number')
                return <td key={c.key}>{preview ? <DescriptionPreview value={value} /> : value}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
