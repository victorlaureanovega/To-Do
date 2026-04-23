import { Fragment, useEffect, useMemo, useState } from 'react'
import { ListChecks, Pencil, Trash2 } from 'lucide-react'
import SectionCard from '../../../components/common/SectionCard'
import EmptyState from '../../../components/common/EmptyState'
import SkeletonCard from '../../../components/common/SkeletonCard'
import { useAuth } from '../../../hooks/useAuth'

const getDisplayName = (developer) => {
  const fullName = `${developer?.firstName ?? ''} ${developer?.lastName ?? ''}`.trim()
  return fullName || developer?.username || `Developer ${developer?.userId ?? ''}`
}

const EMPTY_VALUE = 'N/A'

const hasValue = (value) => (
  value !== null
  && value !== undefined
  && String(value).trim() !== ''
)

const pickFirstValue = (...values) => values.find((value) => hasValue(value))

const formatDuration = (value) => {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE
  }

  const numeric = Number(value)
  if (Number.isNaN(numeric)) {
    return String(value)
  }

  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(numeric)} h`
}

const formatDate = (value) => {
  if (!value) {
    return EMPTY_VALUE
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

const getTaskType = (task) => {
  const typeName = pickFirstValue(task?.type?.name, task?.typeName, task?.taskType)
  if (typeName && String(typeName).trim()) {
    return String(typeName)
  }

  const typeId = task?.type?.typeId ?? task?.typeId
  if (typeId != null && String(typeId).trim()) {
    return `Type ${typeId}`
  }

  return EMPTY_VALUE
}

const getTaskStatusLabel = (task) => {
  const value = pickFirstValue(task?.taskStatus, task?.status, task?.taskState)
  if (value === null || value === undefined || String(value).trim() === '') {
    return EMPTY_VALUE
  }

  return String(value)
}

const getTaskStatusTone = (task) => {
  const normalized = String(
    pickFirstValue(task?.taskStatus, task?.status, task?.taskState) ?? '',
  ).trim().toLowerCase()
  if (
    normalized.includes('pend')
    || normalized.includes('todo')
    || normalized.includes('to do')
  ) {
    return 'developer-task-status--red'
  }

  return 'developer-task-status--blue'
}

const getTaskContent = (task) => String(
  pickFirstValue(task?.content, task?.description, task?.title, task?.name) ?? EMPTY_VALUE,
)

const getCreationDate = (task) => pickFirstValue(
  task?.creationDate,
  task?.createdAt,
  task?.taskDate,
  task?.date,
)

const getEstimatedDuration = (task) => pickFirstValue(
  task?.estimatedDuration,
  task?.estimatedHours,
  task?.plannedDuration,
)

const getFinishDate = (task) => pickFirstValue(
  task?.finishDate,
  task?.finishedDate,
  task?.completionDate,
)

const getRealDuration = (task) => pickFirstValue(
  task?.realDuration,
  task?.totalHoursWorked,
  task?.workedHours,
)

const getTaskRowId = (task, index) => String(
  task?.taskId ?? task?.id ?? `task-${index}`,
)

export default function DeveloperTasksBoard() {
  const { user } = useAuth()
  const [developerGroups, setDeveloperGroups] = useState([])
  const [draftTasks, setDraftTasks] = useState([])
  const [taskOverrides, setTaskOverrides] = useState({})
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskEditDraft, setTaskEditDraft] = useState({
    task: '',
    type: '',
    estimatedDuration: '',
  })
  const [draftForm, setDraftForm] = useState({
    task: '',
    type: '',
    estimatedDuration: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const developerId = String(user?.userId ?? user?.id ?? '').trim()
  const developerName = user?.name ?? user?.username ?? (developerId ? `Developer ${developerId}` : 'Developer')

  useEffect(() => {
    let isCancelled = false

    const loadDeveloperTaskGroups = async () => {
      if (!developerId) {
        setDeveloperGroups([])
        setError(new Error('No authenticated developer ID available'))
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const endpoint = apiBaseUrl
          ? `${apiBaseUrl}/api/tasks/by-developer/${developerId}`
          : `/api/tasks/by-developer/${developerId}`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Backend responded ${response.status} ${response.statusText}`)
        }

        const payload = await response.json()
        const rawTasks = Array.isArray(payload) ? payload : []

        if (!isCancelled) {
          setDeveloperGroups([
            {
              developerId,
              developerName,
              tasks: rawTasks,
            },
          ])
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(fetchError)
          setDeveloperGroups([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadDeveloperTaskGroups()

    return () => {
      isCancelled = true
    }
  }, [apiBaseUrl, developerId, developerName])

  const totalTasks = useMemo(
    () => developerGroups.reduce((sum, group) => sum + group.tasks.length, 0),
    [developerGroups],
  )

  const handleDraftChange = (event) => {
    const { name, value } = event.target
    setDraftForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleDraftSubmit = (event) => {
    event.preventDefault()

    if (!draftForm.task.trim() || !draftForm.type.trim() || !draftForm.estimatedDuration.trim()) {
      return
    }

    setDraftTasks((previous) => [
      {
        id: `draft-${Date.now()}`,
        task: draftForm.task.trim(),
        type: draftForm.type.trim(),
        estimatedDuration: draftForm.estimatedDuration.trim(),
      },
      ...previous,
    ])

    setDraftForm({
      task: '',
      type: '',
      estimatedDuration: '',
    })
  }

  const startTaskEdit = (rowId, task) => {
    const override = taskOverrides[rowId] ?? {}
    const currentTask = override.task ?? getTaskContent(task)
    const currentType = override.type ?? getTaskType(task)
    const currentEstimated = override.estimatedDuration ?? getEstimatedDuration(task)

    setTaskEditDraft({
      task: currentTask === EMPTY_VALUE ? '' : String(currentTask),
      type: currentType === EMPTY_VALUE ? '' : String(currentType),
      estimatedDuration: currentEstimated === EMPTY_VALUE || currentEstimated == null
        ? ''
        : String(currentEstimated),
    })
    setEditingTaskId(rowId)
  }

  const handleTaskEditFieldChange = (event) => {
    const { name, value } = event.target
    setTaskEditDraft((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const cancelTaskEdit = () => {
    setEditingTaskId(null)
    setTaskEditDraft({
      task: '',
      type: '',
      estimatedDuration: '',
    })
  }

  const saveTaskEditMock = (rowId, task) => {
    setTaskOverrides((previous) => ({
      ...previous,
      [rowId]: {
        task: taskEditDraft.task.trim() || getTaskContent(task),
        type: taskEditDraft.type.trim() || getTaskType(task),
        estimatedDuration: taskEditDraft.estimatedDuration.trim() || getEstimatedDuration(task),
      },
    }))
    cancelTaskEdit()
  }

  return (
    <div className="developer-task-board">
      <SectionCard
        title="Create task"
        subtitle="Local-only draft form for the developer view. Endpoints will be connected later."
      >
        <form className="task-form developer-task-create-form" onSubmit={handleDraftSubmit}>
          <div className="developer-task-create-grid">
            <div className="form-field">
              <label htmlFor="developer-task" className="form-label">Task</label>
              <input
                id="developer-task"
                name="task"
                type="text"
                className="form-input"
                placeholder="Describe the task"
                value={draftForm.task}
                onChange={handleDraftChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="developer-type" className="form-label">Type</label>
              <select
                id="developer-type"
                name="type"
                className="form-input"
                value={draftForm.type}
                onChange={handleDraftChange}
              >
                <option value="">Select a type</option>
                <option value="Feature">Feature</option>
                <option value="Bug">Bug</option>
                <option value="Research">Research</option>
                <option value="Documentation">Documentation</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="developer-estimated-duration" className="form-label">Estimated duration</label>
              <input
                id="developer-estimated-duration"
                name="estimatedDuration"
                type="text"
                className="form-input"
                placeholder="e.g. 2.5 hours"
                value={draftForm.estimatedDuration}
                onChange={handleDraftChange}
              />
            </div>
          </div>

          <div className="form-footer developer-task-create-footer">
            <button type="submit" className="btn btn-primary">Create task</button>
          </div>
        </form>

        {draftTasks.length > 0 && (
          <div className="developer-task-drafts">
            {draftTasks.map((task) => (
              <article key={task.id} className="developer-task-draft-card">
                <div className="developer-task-draft-card__top">
                  <strong>{task.task}</strong>
                  <span>{task.type}</span>
                </div>
                <p>{task.estimatedDuration}</p>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title={`Total tasks: ${totalTasks}`} noPad>
      {error && (
        <div style={{ padding: '1rem', color: 'var(--error)' }}>
          Error loading backend tasks: {error.message}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '1rem' }}><SkeletonCard rows={4} /></div>
      ) : developerGroups.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks found"
          message="No tasks found for this developer."
        />
      ) : (
        <div className="developer-task-groups">
          {developerGroups[0]?.tasks.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No tasks for this developer"
              message="No tasks found."
            />
          ) : (
            <div className="developer-task-group__table-wrap table-wrap">
              <table className="data-table developer-task-group__table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Estimated hours</th>
                    <th>Finished</th>
                    <th>Real Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {developerGroups[0]?.tasks.map((task, index) => {
                    const rowId = getTaskRowId(task, index)
                    const taskOverride = taskOverrides[rowId]
                    const displayTask = taskOverride?.task ?? getTaskContent(task)
                    const displayType = taskOverride?.type ?? getTaskType(task)
                    const displayEstimated = taskOverride?.estimatedDuration ?? getEstimatedDuration(task)
                    const isEditing = editingTaskId === rowId

                    return (
                    <Fragment key={rowId}>
                      <tr className={isEditing ? 'developer-task-row developer-task-row--editing' : 'developer-task-row'}>
                        <td>
                          <div className="developer-task-cell-task-wrap">
                            <div className="developer-task-cell-task">{displayTask}</div>

                            <button
                              type="button"
                              className="developer-task-row__edit-btn"
                              onClick={() => startTaskEdit(rowId, task)}
                              aria-label="Edit task"
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                        <td>{displayType}</td>
                        <td>
                          <span className={`developer-task-status ${getTaskStatusTone(task)}`}>
                            {getTaskStatusLabel(task)}
                          </span>
                        </td>
                        <td>{formatDate(getCreationDate(task))}</td>
                        <td>{formatDuration(displayEstimated)}</td>
                        <td>{formatDate(getFinishDate(task))}</td>
                        <td>
                          <div className="developer-task-row__end-cell">
                            <span>{formatDuration(getRealDuration(task))}</span>
                            <button
                              type="button"
                              className="developer-task-row__delete-btn"
                              aria-label="Delete task"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isEditing && (
                        <tr className="developer-task-edit-row">
                          <td colSpan={7}>
                            <div className="developer-task-edit-panel">
                              <div className="developer-task-edit-grid">
                                <div className="form-field">
                                  <label htmlFor={`task-edit-${rowId}`} className="form-label">Task</label>
                                  <input
                                    id={`task-edit-${rowId}`}
                                    name="task"
                                    type="text"
                                    className="form-input"
                                    value={taskEditDraft.task}
                                    onChange={handleTaskEditFieldChange}
                                  />
                                </div>

                                <div className="form-field">
                                  <label htmlFor={`task-type-${rowId}`} className="form-label">Type</label>
                                  <input
                                    id={`task-type-${rowId}`}
                                    name="type"
                                    type="text"
                                    className="form-input"
                                    value={taskEditDraft.type}
                                    onChange={handleTaskEditFieldChange}
                                  />
                                </div>

                                <div className="form-field">
                                  <label htmlFor={`task-estimated-${rowId}`} className="form-label">Estimated hours</label>
                                  <input
                                    id={`task-estimated-${rowId}`}
                                    name="estimatedDuration"
                                    type="text"
                                    className="form-input"
                                    value={taskEditDraft.estimatedDuration}
                                    onChange={handleTaskEditFieldChange}
                                  />
                                </div>
                              </div>

                              <div className="developer-task-edit-footer">
                                <button
                                  type="button"
                                  className="developer-task-edit-cancel"
                                  onClick={cancelTaskEdit}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="developer-task-edit-save"
                                  onClick={() => saveTaskEditMock(rowId, task)}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      </SectionCard>
    </div>
  )
}
