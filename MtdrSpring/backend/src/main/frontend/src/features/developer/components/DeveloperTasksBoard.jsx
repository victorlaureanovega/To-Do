import React from 'react'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { ListChecks, Pencil, Trash2 } from 'lucide-react'
import SectionCard from '../../../components/common/SectionCard'
import EmptyState from '../../../components/common/EmptyState'
import SkeletonCard from '../../../components/common/SkeletonCard'
import Modal from '../../../components/common/Modal'
import { useAuth } from '../../../hooks/useAuth'
import { getCanonicalTaskStatus, toBackendTaskStatus, toEnglishTaskStatus } from '../../../utils/taskStatus'

const DEFAULT_TASK_TYPES = ['Feature', 'Bug', 'Research', 'Documentation']
const TASK_TYPE_MAPPING = {
  feature: { id: 1, name: 'Feature' },
  bug: { id: 2, name: 'Bug' },
  research: { id: 3, name: 'Reasearch' },
  documentation: { id: 4, name: 'Documentation' },
}
const STATUS_OPTIONS = [
  { value: 'Pendiente', label: 'Pending' },
  { value: 'En curso', label: 'Ongoing' },
  { value: 'Finalizada', label: 'Finished' },
]

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
  const typeName = pickFirstValue(task?.type?.name, task?.type?.typeName, task?.typeName, task?.taskType)
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

  return toEnglishTaskStatus(value)
}

const getTaskStatusTone = (task) => {
  const normalized = getCanonicalTaskStatus(pickFirstValue(task?.taskStatus, task?.status, task?.taskState))

  if (normalized === 'finished') {
    return 'developer-task-status--green'
  }

  if (normalized === 'ongoing') {
    return 'developer-task-status--yellow'
  }

  if (normalized === 'pending') {
    return 'developer-task-status--red'
  }

  return 'developer-task-status--yellow'
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

const getTaskNumericId = (task) => Number(task?.taskId ?? task?.id)

const getTaskTypeId = (task) => Number(
  pickFirstValue(task?.type?.typeId, task?.type?.id, task?.typeId),
)

const getSprintNumber = (task) => {
  // Only check _Sprint field (from get_Sprint() serialization)
  const sprintValue = task?._Sprint
  
  if (sprintValue != null && (typeof sprintValue === 'number' || (typeof sprintValue === 'string' && String(sprintValue).trim()))) {
    const n = Number(sprintValue)
    if (Number.isFinite(n)) return n
  }

  return null
}

const formatSprint = (value) => (value == null ? EMPTY_VALUE : String(value))

const parseHours = (value) => {
  const normalized = String(value ?? '').trim().replace(',', '.')
  if (!normalized) {
    return null
  }

  const numeric = Number.parseFloat(normalized)
  return Number.isFinite(numeric) ? numeric : null
}

const normalizeTaskTypeName = (value) => String(value ?? '').trim().toLowerCase()

export default function DeveloperTasksBoard() {
  const { user } = useAuth()
  const [developerGroups, setDeveloperGroups] = useState([])
  const [taskTypesByName] = useState(TASK_TYPE_MAPPING)
  const [taskTypeOptions] = useState(Object.values(TASK_TYPE_MAPPING).map((t) => t.name))
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskEditDraft, setTaskEditDraft] = useState({
    task: '',
    type: '',
    estimatedDuration: '',
    sprint: '',
    realDuration: '',
  })
  const [draftForm, setDraftForm] = useState({
    task: '',
    type: '',
    estimatedDuration: '',
    sprint: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [rowActionTaskId, setRowActionTaskId] = useState(null)
  const [pendingDeleteTask, setPendingDeleteTask] = useState(null)

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const developerId = String(user?.userId ?? user?.id ?? '').trim()
  const developerName = user?.name ?? user?.username ?? (developerId ? `Developer ${developerId}` : 'Developer')

  const loadDeveloperTaskGroups = useCallback(async () => {
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
      const rawTasks = (Array.isArray(payload) ? payload : []).filter((task) => Number(task?.isActive ?? 1) !== 0)

      setDeveloperGroups([
        {
          developerId,
          developerName,
          tasks: rawTasks,
        },
      ])
    } catch (fetchError) {
      setError(fetchError)
      setDeveloperGroups([])
    } finally {
      setLoading(false)
    }
  }, [apiBaseUrl, developerId, developerName])

  useEffect(() => {
    let isCancelled = false

    const loadInitialData = async () => {
      try {
        await loadDeveloperTaskGroups()
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError)
        }
      }
    }

    if (!isCancelled) {
      loadInitialData()
    }

    return () => {
      isCancelled = true
    }
  }, [loadDeveloperTaskGroups])

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

  const createTask = async (event) => {
    event.preventDefault()

    if (!draftForm.task.trim() || !draftForm.type.trim()) {
      return
    }

    const estimatedDuration = parseHours(draftForm.estimatedDuration)
    if (estimatedDuration == null) {
      setError(new Error('Estimated duration must be a valid number'))
      return
    }

    const sprintNumber = draftForm.sprint ? Number(String(draftForm.sprint).trim()) : null
    if (draftForm.sprint && (!Number.isFinite(sprintNumber) || !Number.isInteger(sprintNumber))) {
      setError(new Error('Sprint must be an integer'))
      return
    }

    const selectedType = taskTypesByName[normalizeTaskTypeName(draftForm.type)]
    if (!selectedType?.id) {
      setError(new Error('Selected task type is not available in backend catalog'))
      return
    }

    setIsCreatingTask(true)
    setError(null)

    try {
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/tasks` : '/api/tasks'
      const requestPayload = {
        content: draftForm.task.trim(),
        estimatedDuration,
        userId: Number(developerId),
        typeId: selectedType.id,
        _Sprint: sprintNumber,
        sprintId: null,
      }
      console.log('Creating task with payload:', requestPayload)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`Backend responded ${response.status} ${response.statusText}`)
      }

      setDraftForm({
        task: '',
        type: '',
        estimatedDuration: '',
        sprint: '',
      })

      await loadDeveloperTaskGroups()
    } catch (createError) {
      setError(createError)
    } finally {
      setIsCreatingTask(false)
    }
  }

  const startTaskEdit = (rowId, task) => {
    const currentTask = getTaskContent(task)
    const currentType = getTaskType(task)
    const currentEstimated = getEstimatedDuration(task)
    const currentReal = getRealDuration(task)

    setTaskEditDraft({
      task: currentTask === EMPTY_VALUE ? '' : String(currentTask),
      type: currentType === EMPTY_VALUE ? '' : String(currentType),
      estimatedDuration: currentEstimated === EMPTY_VALUE || currentEstimated == null
        ? ''
        : String(currentEstimated),
      sprint: getSprintNumber(task) == null ? '' : String(getSprintNumber(task)),
      realDuration: currentReal === EMPTY_VALUE || currentReal == null ? '' : String(currentReal),
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
      sprint: '',
      realDuration: '',
    })
  }

  const saveTaskEdit = async (rowId, task) => {
    const taskId = getTaskNumericId(task)
    if (!Number.isFinite(taskId)) {
      setError(new Error('Task ID is invalid for update'))
      return
    }

    const resolvedContent = taskEditDraft.task.trim() || getTaskContent(task)
    const resolvedTypeName = taskEditDraft.type.trim() || getTaskType(task)
    const resolvedEstimatedRaw = taskEditDraft.estimatedDuration.trim() || String(getEstimatedDuration(task) ?? '')
    const resolvedEstimatedDuration = parseHours(resolvedEstimatedRaw)

    const resolvedRealRaw = (taskEditDraft.realDuration ? taskEditDraft.realDuration.trim() : '') || (getRealDuration(task) != null ? String(getRealDuration(task)) : '')
    const resolvedRealDuration = parseHours(resolvedRealRaw)

    const resolvedSprintRaw = (taskEditDraft.sprint ? taskEditDraft.sprint.trim() : '') || (getSprintNumber(task) != null ? String(getSprintNumber(task)) : '')
    const resolvedSprintNumber = resolvedSprintRaw ? Number(String(resolvedSprintRaw).trim()) : null

    if (resolvedSprintRaw && (!Number.isFinite(resolvedSprintNumber) || !Number.isInteger(resolvedSprintNumber))) {
      setError(new Error('Sprint must be an integer'))
      return
    }

    if (resolvedEstimatedDuration == null) {
      setError(new Error('Estimated duration must be a valid number'))
      return
    }

    const selectedType = taskTypesByName[normalizeTaskTypeName(resolvedTypeName)]
    const fallbackTypeId = getTaskTypeId(task)
    const resolvedTypeId = Number(selectedType?.id ?? fallbackTypeId)

    if (!Number.isFinite(resolvedTypeId)) {
      setError(new Error('Selected task type is not available in backend catalog'))
      return
    }

    setIsSavingTask(true)
    setError(null)

    try {
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/tasks/${taskId}` : `/api/tasks/${taskId}`
      const requestPayload = {
        content: resolvedContent,
        estimatedDuration: resolvedEstimatedDuration,
        realDuration: resolvedRealDuration != null ? resolvedRealDuration : null,
        userId: Number(developerId),
        typeId: resolvedTypeId,
        sprintNumber: resolvedSprintNumber,
        sprintId: task?.sprint?.sprintId ?? task?.sprintId ?? null,
      }
      console.log('Saving task edit with payload:', requestPayload)
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      if (!response.ok) {
        throw new Error(`Backend responded ${response.status} ${response.statusText}`)
      }

      cancelTaskEdit()
      await loadDeveloperTaskGroups()
    } catch (updateError) {
      setError(updateError)
    } finally {
      setIsSavingTask(false)
    }
  }

  const updateTaskStatus = async (task, nextStatus) => {
    const taskId = getTaskNumericId(task)
    if (!Number.isFinite(taskId)) {
      setError(new Error('Task ID is invalid for status update'))
      return
    }

    if (!STATUS_OPTIONS.some((option) => option.value === nextStatus)) {
      setError(new Error('Selected status is invalid'))
      return
    }

    setRowActionTaskId(String(taskId))
    setError(null)

    try {
      const endpoint = apiBaseUrl
        ? `${apiBaseUrl}/api/tasks/status/${taskId}?status=${encodeURIComponent(nextStatus)}`
        : `/api/tasks/status/${taskId}?status=${encodeURIComponent(nextStatus)}`

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Backend responded ${response.status} ${response.statusText}`)
      }

      await loadDeveloperTaskGroups()
    } catch (statusError) {
      setError(statusError)
    } finally {
      setRowActionTaskId(null)
    }
  }

  const executeDeleteTask = async (task) => {
    const taskId = getTaskNumericId(task)
    if (!Number.isFinite(taskId)) {
      setError(new Error('Task ID is invalid for delete'))
      return
    }

    setRowActionTaskId(String(taskId))
    setError(null)

    try {
      const endpoint = apiBaseUrl ? `${apiBaseUrl}/api/tasks/delete/${taskId}` : `/api/tasks/delete/${taskId}`
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Backend responded ${response.status} ${response.statusText}`)
      }

      setPendingDeleteTask(null)
      await loadDeveloperTaskGroups()
    } catch (deleteError) {
      setError(deleteError)
    } finally {
      setRowActionTaskId(null)
    }
  }

  const openDeleteConfirmation = (task) => {
    setPendingDeleteTask(task)
  }

  const closeDeleteConfirmation = () => {
    if (!rowActionTaskId) {
      setPendingDeleteTask(null)
    }
  }

  return (
    <div className="developer-task-board">
      <SectionCard
        title="Create task"
        subtitle="Create a task and persist it to the database."
      >
        <form className="task-form developer-task-create-form" onSubmit={createTask}>
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
                {taskTypeOptions.map((typeName) => (
                  <option key={typeName} value={typeName}>{typeName}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="developer-sprint" className="form-label">Sprint (number)</label>
              <input
                id="developer-sprint"
                name="sprint"
                type="number"
                className="form-input"
                placeholder="e.g. 3"
                value={draftForm.sprint}
                onChange={handleDraftChange}
              />
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
            <button type="submit" className="btn btn-primary" disabled={isCreatingTask || loading}>
              {isCreatingTask ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </form>
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
                    <th>Sprint</th>
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
                    const displayTask = getTaskContent(task)
                    const displayType = getTaskType(task)
                    const displayEstimated = getEstimatedDuration(task)
                    const isEditing = editingTaskId === rowId
                    const numericTaskId = String(getTaskNumericId(task) || '')
                    const isRowBusy = rowActionTaskId === numericTaskId
                    const rawStatusValue = pickFirstValue(task?.taskStatus, task?.status, task?.taskState)
                    const normalizedCurrentStatus = toBackendTaskStatus(rawStatusValue) ?? STATUS_OPTIONS[0].value

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
                        <td>{formatSprint(getSprintNumber(task))}</td>
                        <td>
                          <select
                            className={`form-input developer-task-status-select ${getTaskStatusTone(task)}`}
                            value={normalizedCurrentStatus}
                            onChange={(event) => updateTaskStatus(task, event.target.value)}
                            disabled={isRowBusy || isSavingTask}
                          >
                            {STATUS_OPTIONS.map((statusOption) => (
                              <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                            ))}
                          </select>
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
                              onClick={() => openDeleteConfirmation(task)}
                              disabled={isRowBusy || isSavingTask}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isEditing && (
                        <tr className="developer-task-edit-row">
                          <td colSpan={8}>
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
                                  <select
                                    id={`task-type-${rowId}`}
                                    name="type"
                                    className="form-input"
                                    value={taskEditDraft.type}
                                    onChange={handleTaskEditFieldChange}
                                  >
                                    <option value="">Select a type</option>
                                    {taskTypeOptions.map((typeName) => (
                                      <option key={typeName} value={typeName}>{typeName}</option>
                                    ))}
                                  </select>
                                </div>

                                <div className="form-field">
                                  <label htmlFor={`task-sprint-${rowId}`} className="form-label">Sprint (number)</label>
                                  <input
                                    id={`task-sprint-${rowId}`}
                                    name="sprint"
                                    type="number"
                                    className="form-input"
                                    value={taskEditDraft.sprint}
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

                                <div className="form-field">
                                  <label htmlFor={`task-real-${rowId}`} className="form-label">Real hours</label>
                                  <input
                                    id={`task-real-${rowId}`}
                                    name="realDuration"
                                    type="text"
                                    className="form-input"
                                    value={taskEditDraft.realDuration}
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
                                  onClick={() => saveTaskEdit(rowId, task)}
                                  disabled={isSavingTask}
                                >
                                  {isSavingTask ? 'Saving...' : 'Save'}
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

      <Modal
        open={Boolean(pendingDeleteTask)}
        onClose={closeDeleteConfirmation}
        title="Delete task"
        size="sm"
      >
        <p className="developer-delete-modal__text">
          Are you sure you want to delete this task?
        </p>
        <p className="developer-delete-modal__task">
          {pendingDeleteTask ? getTaskContent(pendingDeleteTask) : ''}
        </p>
        <div className="developer-delete-modal__actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeDeleteConfirmation}
            disabled={Boolean(rowActionTaskId)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => executeDeleteTask(pendingDeleteTask)}
            disabled={Boolean(rowActionTaskId) || !pendingDeleteTask}
          >
            {rowActionTaskId ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
