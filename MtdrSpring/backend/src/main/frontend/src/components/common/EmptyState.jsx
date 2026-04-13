/**
 * EmptyState
 * Estado vacío para listas y tablas.
 * Props:
 *   icon    – componente Lucide
 *   title   – texto principal
 *   message – texto secundario
 *   action  – ReactNode opcional (botón CTA)
 */
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <span className="empty-state__icon">
          <Icon size={40} strokeWidth={1.2} />
        </span>
      )}
      <p className="empty-state__title">{title}</p>
      {message && <p className="empty-state__message">{message}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
