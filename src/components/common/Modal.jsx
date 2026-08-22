import React from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

export default function Modal({ title, onClose, children, footer, maxWidth }) {
  const modal = (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><FiX /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
