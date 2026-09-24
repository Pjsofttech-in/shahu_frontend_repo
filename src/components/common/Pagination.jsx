import React from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizes = [25, 50, 100, 500] }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(page, totalPages)
  const sizes = pageSizes.includes(pageSize) ? pageSizes : [pageSize, ...pageSizes]

  return (
    <div className="pagination-bar">
      <button type="button" className="pagination-arrow" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} aria-label="Previous page" title="Previous page">
        <FiChevronLeft />
      </button>
      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            className={pageNumber === currentPage ? 'active' : ''}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button type="button" className="pagination-arrow" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} aria-label="Next page" title="Next page">
        <FiChevronRight />
      </button>
      <label className="pagination-size">
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
          {sizes.map((size) => <option key={size} value={size}>{size} / page</option>)}
        </select>
      </label>
    </div>
  )
}
