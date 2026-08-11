import React from 'react'

export default function DataTable({ columns, rows, rowKey = 'id', loading, emptyText = 'No records found.' }) {
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
            <tr key={row[rowKey]}>
              {columns.map((c) => (
                <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
