import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizes = [10, 20, 50] }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = totalItems ? (currentPage - 1) * pageSize + 1 : 0
  const end = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="pagination-bar">
      <label>
        Rows per page
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </label>
      <span>{start}-{end} of {totalItems}</span>
      <button type="button" className="btn btn-outline btn-sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page" title="Previous page">
        <FiChevronLeft />
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button type="button" className="btn btn-outline btn-sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page" title="Next page">
        <FiChevronRight />
      </button>
    </div>
  )
}
