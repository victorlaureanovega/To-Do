import { Link } from 'react-router-dom'
import { Clock, Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { isFinishedTaskStatus } from '../../utils/taskStatus'

/**
 * TaskCard
 * Card individual de tarea para la vista de developer.
 * Props:
 *   task         – objeto tarea (ver mockTasks)
 *   onEdit       – función (task) => void
 *   onDelete     – función (taskId) => void
 *   onComplete   – función (taskId) => void
 *   readOnly     – boolean (vista manager, oculta acciones)
 */
export default function TaskCard({ task, onEdit, onDelete, onComplete, readOnly = false }) {
  return (
    <article className="task-card">
      <div className="task-card__top">
        <Link to={`/tasks/${task.id}`} className="task-card__title">{task.title}</Link>
        <StatusBadge status={task.status} size="sm" />
      </div>

      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}

      <div className="task-card__meta">
        <span className="task-card__meta-item">
          <Clock size={13} />
          {task.estimatedDuration}
        </span>
        <span className="task-card__meta-item">
          Created: {task.createdAt}
        </span>
        {task.assignee && (
          <span className="task-card__meta-item">
            {task.assignee}
          </span>
        )}
      </div>

      {!readOnly && (
        <div className="task-card__actions">
          {!isFinishedTaskStatus(task.status) && (
            <button
              type="button"
              className="task-action task-action--complete"
              onClick={() => onComplete?.(task.id)}
              title="Mark as completed"
            >
              <CheckCircle2 size={15} />
              Complete
            </button>
          )}
          <button
            type="button"
            className="task-action task-action--edit"
            onClick={() => onEdit?.(task)}
            title="Edit task"
          >
            <Pencil size={15} />
            Edit
          </button>
          <button
            type="button"
            className="task-action task-action--delete"
            onClick={() => onDelete?.(task.id)}
            title="Delete task"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      )}
    </article>
  )
}
