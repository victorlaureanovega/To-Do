import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import EmptyState from '../components/common/EmptyState'
import TaskTable from '../components/tasks/TaskTable'
import SkeletonCard from '../components/common/SkeletonCard'
import { useData } from '../hooks/useData'
import { fetchTeamDevelopers } from '../utils/teamApi'

const STATUS_PRIORITY = {
  'To Do': 1,
  'In Progress': 2,
  Completed: 3,
}

const normalizeStatus = (taskStatus) => {
  const normalized = String(taskStatus ?? '').trim().toLowerCase()

  if (normalized.includes('pend') || normalized === 'todo' || normalized.includes('to do')) {
    return 'To Do'
  }

  if (normalized.includes('curso') || normalized.includes('progress') || normalized.includes('progreso')) {
    return 'In Progress'
  }

  if (normalized.includes('final') || normalized.includes('complete') || normalized.includes('done')) {
    return 'Completed'
  }

  return 'To Do'
}

const mapTaskToUi = (task) => ({
  id: String(task?.taskId ?? ''),
  title: task?.content ? task.content.slice(0, 80) : `Task ${task?.taskId ?? ''}`,
  description: task?.content ?? '',
  status: normalizeStatus(task?.taskStatus),
  estimatedDuration: task?.estimatedDuration != null ? String(task.estimatedDuration) : '',
  createdAt: task?.creationDate ? String(task.creationDate).split('T')[0] : '',
})

const getDisplayName = (developer) => {
  const fullName = `${developer?.firstName ?? ''} ${developer?.lastName ?? ''}`.trim()
  return fullName || developer?.username || `Developer ${developer?.userId ?? ''}`
}

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

            const sortedTasks = rawTasks
              .map(mapTaskToUi)
              .sort((a, b) => {
                const statusOrder = (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
                if (statusOrder !== 0) {
                  return statusOrder
                }
                return String(a.title).localeCompare(String(b.title))
              })

            return {
              developerId: String(developerId ?? ''),
              developerName: getDisplayName(developer),
              rawPayload: payload,
              tasks: sortedTasks,
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
        title="My Tasks"
        subtitle="Tasks grouped by team member using backend task data."
      />

      <SectionCard title={`Team task groups (${totalTasks})`} noPad>
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
              const groupPayload = JSON.stringify(group.rawPayload, null, 2)

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
                        <TaskTable tasks={group.tasks} readOnly />
                      )}

                      <details className="developer-task-group__payload">
                        <summary>View backend payload</summary>
                        <pre>{groupPayload}</pre>
                      </details>
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
