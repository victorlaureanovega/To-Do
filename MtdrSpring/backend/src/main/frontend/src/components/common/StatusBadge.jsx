import clsx from 'clsx'

const STATUS_MAP = {
  'To Do': 'todo',
  'In Progress': 'in-progress',
  Completed: 'completed',
  Blocked: 'blocked',
}

/**
 * StatusBadge
 * Muestra el estado de una tarea como badge coloreado.
 * Props:
 *   status – 'To Do' | 'In Progress' | 'Completed' | 'Blocked'
 *   size   – 'sm' | 'md' (default: 'md')
 */
export default function StatusBadge({ status, size = 'md' }) {
  const modifier = STATUS_MAP[status] ?? 'todo'

  return (
    <span className={clsx('status-badge', `status-badge--${modifier}`, size === 'sm' && 'status-badge--sm')}>
      {status}
    </span>
  )
}
