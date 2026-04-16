import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import EmptyState from '../components/common/EmptyState'
import SkeletonCard from '../components/common/SkeletonCard'
import { useData } from '../hooks/useData'
import { fetchTeamDevelopers } from '../utils/teamApi'

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

export default function DeveloperTasksPage() {
  const { teamId } = useData()
  const [developerGroups, setDeveloperGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedIds, setExpandedIds] = useState({})

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

  const toggleSection = (developerId) => {
    setExpandedIds((previous) => ({
      ...previous,
      [developerId]: !previous[developerId],
    }))
  }

  useEffect(() => {
    let isCancelled = false

    const loadDeveloperTaskGroups = async () => {
      setLoading(true)
      setError(null)

      try {
        const developers = await fetchTeamDevelopers(apiBaseUrl, teamId)

        const settled = await Promise.allSettled(
          developers.map(async (developer) => {
            const developerId = developer?.userId
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

            return {
              developerId: String(developerId ?? ''),
              developerName: getDisplayName(developer),
              tasks: rawTasks,
            }
          }),
        )

        const groups = settled
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)
          .filter((group) => group.developerId)
          .sort((a, b) => a.developerName.localeCompare(b.developerName))

        if (!isCancelled) {
          setDeveloperGroups(groups)
          setExpandedIds(
            groups.reduce((accumulator, group) => {
              accumulator[group.developerId] = true
              return accumulator
            }, {}),
          )
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
  }, [apiBaseUrl, teamId])

  const totalTasks = useMemo(
    () => developerGroups.reduce((sum, group) => sum + group.tasks.length, 0),
    [developerGroups],
  )

  return (
    <>
      <PageHeader
        title="My Team's Tasks"
        subtitle="Find out what your team members are up to."
      />

      <SectionCard title={`Total taks in the team: ${totalTasks}`} noPad>
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
            message={`No hay tareas para teamId=${teamId} o no coinciden con el filtro.`}
          />
        ) : (
          <div className="developer-task-groups">
            {developerGroups.map((group) => {
              const isExpanded = expandedIds[group.developerId] ?? true

              return (
                <div key={group.developerId} className="developer-task-group">
                  <button
                    type="button"
                    className="developer-task-group__toggle"
                    onClick={() => toggleSection(group.developerId)}
                    aria-expanded={isExpanded}
                  >
                    <span>{group.developerName}</span>
                    <span className="developer-task-group__meta">
                      {group.tasks.length} tasks
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="developer-task-group__content">
                      {group.tasks.length === 0 ? (
                        <EmptyState
                          icon={ListChecks}
                          title="No tasks for this user"
                          message="Backend returned an empty task list for this team member."
                        />
                      ) : (
                        <div className="table-wrap developer-task-group__table-wrap">
                          <table className="data-table developer-task-group__table">
                            <thead>
                              <tr>
                                <th>Task</th>
                                <th>Task status</th>
                                <th>Type</th>
                                <th>Creation date</th>
                                <th>
                                  <span className="developer-task-header-two-line">
                                    <span>Estimated</span>
                                    <span>Duration</span>
                                  </span>
                                </th>
                                <th>
                                  <span className="developer-task-header-two-line">
                                    <span>Finish</span>
                                    <span>Date</span>
                                  </span>
                                </th>
                                <th>Real duration</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.tasks.map((task, index) => (
                                <tr key={task?.taskId ?? index}>
                                  <td className="developer-task-cell-task">{getTaskContent(task)}</td>
                                  <td>
                                    <span className={`developer-task-status ${getTaskStatusTone(task)}`}>
                                      {getTaskStatusLabel(task)}
                                    </span>
                                  </td>
                                  <td>{getTaskType(task)}</td>
                                  <td>{formatDate(getCreationDate(task))}</td>
                                  <td>{formatDuration(getEstimatedDuration(task))}</td>
                                  <td>{formatDate(getFinishDate(task))}</td>
                                  <td>{formatDuration(getRealDuration(task))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </>
  )
}
