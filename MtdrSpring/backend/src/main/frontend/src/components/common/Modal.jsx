import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Modal
 * Diálogo accesible con foco atrapado y cierre por Escape.
 * Props:
 *   open     – boolean
 *   onClose  – función
 *   title    – string
 *   size     – 'sm' | 'md' | 'lg' (default: 'md')
 *   children
 */
export default function Modal({ open, onClose, title, size = 'md', children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    if (open) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">{title}</h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}
