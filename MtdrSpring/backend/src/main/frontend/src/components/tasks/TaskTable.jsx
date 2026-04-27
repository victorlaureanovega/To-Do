import { Link } from 'react-router-dom'
import { Pencil, Trash2, CheckCircle2 } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'
import { isFinishedTaskStatus } from '../../utils/taskStatus'

/**
 * TaskTable
 * Vista tabular de tareas.
 * Props:
 *   tasks        – array de tareas
 *   onEdit       – función (task) => void
 *   onDelete     – función (taskId) => void
 *   onComplete   – función (taskId) => void
 *   readOnly     – boolean
 *   showAssignee – boolean (default false)
 */
export default function TaskTable({ tasks = [], onEdit, onDelete, onComplete, readOnly = false, showAssignee = false }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Task</th>
            {showAssignee && <th>Assignee</th>}
            <th>Status</th>
            <th>Est. Duration</th>
            <th>Created</th>
            {!readOnly && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>
                <Link to={`/tasks/${task.id}`} className="table-link">{task.title}</Link>
              </td>
              {showAssignee && <td>{task.assignee ?? '—'}</td>}
              <td>
                <StatusBadge status={task.status} size="sm" />
              </td>
              <td>{task.estimatedDuration}</td>
              <td>{task.createdAt}</td>
              {!readOnly && (
                <td>
                  <div className="table-actions">
                    {!isFinishedTaskStatus(task.status) && (
                      <button
                        type="button"
                        className="task-action task-action--complete"
                        onClick={() => onComplete?.(task.id)}
                        title="Complete"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="task-action task-action--edit"
                      onClick={() => onEdit?.(task)}
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="task-action task-action--delete"
                      onClick={() => onDelete?.(task.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
