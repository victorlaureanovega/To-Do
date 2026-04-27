import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AnalyticsFilters from '../features/analytics/components/AnalyticsFilters'
// import DeveloperAverageHoursCard from '../features/analytics/components/DeveloperAverageHoursCard'
import TeamAverageFinishedTasksCard from '../features/analytics/components/TeamAverageFinishedTasksCard'
import TeamAverageWorkedHoursCard from '../features/analytics/components/TeamAverageWorkedHoursCard'
import KpiSection from '../features/analytics/components/KpiSection'
import ChartGrid from '../features/analytics/components/ChartGrid'
import TasksByStatusChart from '../features/analytics/components/charts/TasksByStatusChart'
import TasksRegisteredByDateChart from '../features/analytics/components/charts/TasksRegisteredByDateChart'
import TeamCompletionChart from '../features/analytics/components/charts/TeamCompletionChart'
import TaskTypeDistributionChart from '../features/analytics/components/charts/TaskTypeDistributionChart'
import TimeComparisonChart from '../features/analytics/components/charts/TimeComparisonChart'
import { StatusTooltip } from '../features/analytics/components/tooltips/StatusTooltip'
import { TimeComparisonTooltip } from '../features/analytics/components/tooltips/TimeComparisonTooltip'
import { useAuth } from '../hooks/useAuth'
import { useData } from '../hooks/useData'
import { fetchTeamDevelopers } from '../utils/teamApi'

const buildEndpoint = (apiBaseUrl, path) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path)

const isCompletedStatus = (taskStatus) => {
  const normalized = String(taskStatus ?? '').trim().toLowerCase()
  if (!normalized) {
    return false
  }

  return (
    normalized.includes('complete')
    || normalized.includes('done')
    || normalized.includes('final')
    || normalized.includes('finish')
    || normalized.includes('termin')
  )
}

const normalizeStatusBucket = (taskStatus) => {
  const normalized = String(taskStatus ?? '').trim().toLowerCase()

  if (normalized.includes('pend') || normalized === 'todo' || normalized.includes('to do')) {
    return 'todo'
  }

  if (normalized.includes('curso') || normalized.includes('progress') || normalized.includes('progreso')) {
    return 'inProgress'
  }

  if (normalized.includes('final') || normalized.includes('complete') || normalized.includes('done')) {
    return 'completed'
  }

  return 'todo'
}

const getTaskTypeName = (task) => {
  const rawType = task?.type?.name ?? task?.type?.typeName ?? task?.typeName ?? task?.taskType ?? 'Unknown'
  const normalized = String(rawType ?? '').trim()
  return normalized || 'Unknown'
}

const toNumericCount = (...values) => {
  for (const value of values) {
    const numeric = Number(value)
    if (Number.isFinite(numeric)) {
      return numeric
    }
  }
  return 0
}

const groupTasksByCreationDate = (tasks) => {
  const byDate = tasks.reduce((acc, task) => {
    const normalizedDate = normalizeChartDate(
      task?.creationDate
      ?? task?.taskDate
      ?? task?.date
      ?? task?.createdAt,
    )

    const key = normalizedDate && normalizedDate !== 'N/A' ? normalizedDate : 'N/A'
    const current = acc.get(key) ?? { date: key, registered: 0, completed: 0 }

    current.registered += 1
    if (isCompletedStatus(task?.taskStatus ?? task?.status ?? task?.taskState)) {
      current.completed += 1
    }

    acc.set(key, current)
    return acc
  }, new Map())

  return Array.from(byDate.values()).sort((a, b) => String(a.date).localeCompare(String(b.date)))
}

const resolveUserId = (user) => {
  const rawId = user?.userId ?? user?.id ?? user?.username
  const normalized = String(rawId ?? '').trim()
  return normalized || null
}

const normalizeChartDate = (rawValue) => {
  if (rawValue == null) {
    return 'N/A'
  }

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim()
    if (!trimmed) {
      return 'N/A'
    }
    return trimmed.includes('T') ? trimmed.split('T')[0] : trimmed
  }

  if (typeof rawValue === 'number') {
    const parsed = new Date(rawValue)
    return Number.isNaN(parsed.getTime()) ? String(rawValue) : parsed.toISOString().split('T')[0]
  }

  if (typeof rawValue === 'object') {
    const year = Number(rawValue.year)
    const month = Number(rawValue.monthValue ?? rawValue.month)
    const day = Number(rawValue.dayOfMonth ?? rawValue.day)
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      const mm = String(month).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      return `${year}-${mm}-${dd}`
    }
  }

  return String(rawValue)
}

export default function AnalyticsPage({ lockedDeveloperId = null }) {
  const { user, role } = useAuth()
  const { teamId } = useData()
  const [developerFilter, setDeveloperFilter] = useState('all')
  const [teamMemberOptions, setTeamMemberOptions] = useState([])
  const [averageCompletionTime, setAverageCompletionTime] = useState(0)
  const [statusTotals, setStatusTotals] = useState({ todo: 0, inProgress: 0, completed: 0 })
  const [teamCompletionMetrics, setTeamCompletionMetrics] = useState({
    pieData: [
      { name: 'Completed', value: 0 },
      { name: 'Pending', value: 0 },
    ],
    completionRate: '0%',
    completionVsRegistered: '0/0',
  })
  const [teamCompletionLoading, setTeamCompletionLoading] = useState(false)
  const [teamCompletionError, setTeamCompletionError] = useState(null)
  const [reopenedTaskRate, setReopenedTaskRate] = useState(0)
  const [reopenedTaskRateLoading, setReopenedTaskRateLoading] = useState(false)
  const [reopenedTaskRateError, setReopenedTaskRateError] = useState(null)
  const [tasksByDateData, setTasksByDateData] = useState([])
  const [tasksByDateLoading, setTasksByDateLoading] = useState(false)
  const [tasksByDateError, setTasksByDateError] = useState(null)
  const [tasksByTypeData, setTasksByTypeData] = useState([])
  const [tasksByTypeLoading, setTasksByTypeLoading] = useState(false)
  const [tasksByTypeError, setTasksByTypeError] = useState(null)

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

  const isDeveloperScoped = role === 'DEVELOPER' || Boolean(lockedDeveloperId)
  const authenticatedUserId = resolveUserId(user)
  const forcedDeveloperId = String(lockedDeveloperId ?? authenticatedUserId ?? '').trim()
  const selectedDeveloperId = isDeveloperScoped ? forcedDeveloperId : developerFilter

  useEffect(() => {
    let isCancelled = false

    const loadTeamMetrics = async () => {
      setTeamCompletionLoading(true)
      setTeamCompletionError(null)
      setReopenedTaskRateLoading(true)
      setReopenedTaskRateError(null)
      setTasksByDateLoading(true)
      setTasksByDateError(null)
      setTasksByTypeLoading(true)
      setTasksByTypeError(null)
      setAverageCompletionTime(0)
      setStatusTotals({ todo: 0, inProgress: 0, completed: 0 })

      let members = []
      let scopedTasks = []

      try {
        if (isDeveloperScoped && !forcedDeveloperId) {
          throw new Error('Authenticated developer ID was not found.')
        }

        members = await fetchTeamDevelopers(apiBaseUrl, teamId)
        if (isCancelled) {
          return
        }

        const options = members
          .map((member) => {
            const fullName = `${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim()
            const label = fullName || member?.username || `Developer ${member?.userId ?? ''}`
            return {
              value: String(member?.userId ?? ''),
              label,
            }
          })
          .filter((option) => option.value)

        setTeamMemberOptions(options)

        const scopedMembers = isDeveloperScoped
          ? members.filter((member) => String(member?.userId ?? '') === forcedDeveloperId)
          : (selectedDeveloperId === 'all'
              ? members
              : members.filter((member) => String(member?.userId ?? '') === String(selectedDeveloperId)))

        const fallbackScopedMembers = isDeveloperScoped && scopedMembers.length === 0
          ? [{ userId: forcedDeveloperId }]
          : scopedMembers

        const taskFetchResults = await Promise.allSettled(
          fallbackScopedMembers.map(async (member) => {
            const developerId = String(member?.userId ?? '').trim()
            if (!developerId) {
              return { tasks: [], totalWorkedHours: 0 }
            }

            const tasksEndpoint = buildEndpoint(apiBaseUrl, `/api/tasks/by-developer/${developerId}`)
            const hoursEndpoint = buildEndpoint(apiBaseUrl, `/api/tasks/hours/by-developer/${developerId}`)

            const [tasksResponse, hoursResponse] = await Promise.all([
              fetch(tasksEndpoint, {
                method: 'GET',
                headers: { Accept: 'application/json' },
              }),
              fetch(hoursEndpoint, {
                method: 'GET',
                headers: { Accept: 'application/json' },
              }),
            ])

            if (!tasksResponse.ok) {
              throw new Error(`Backend responded ${tasksResponse.status} ${tasksResponse.statusText}`)
            }

            const tasksPayload = await tasksResponse.json()
            const tasks = Array.isArray(tasksPayload) ? tasksPayload : []

            let totalWorkedHours = 0
            if (hoursResponse.ok) {
              const hoursPayload = await hoursResponse.json()
              totalWorkedHours = Number(hoursPayload?.totalWorkedHours ?? 0)
            }

            return {
              tasks,
              totalWorkedHours,
            }
          }),
        )

        if (!isCancelled) {
          const completedResults = taskFetchResults
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value)

          scopedTasks = completedResults.flatMap((result) => result.tasks)
          const totalWorkedHours = completedResults.reduce(
            (acc, result) => acc + Number(result.totalWorkedHours ?? 0),
            0,
          )

          const registered = scopedTasks.length
          const completed = scopedTasks.filter((task) => isCompletedStatus(task?.taskStatus)).length
          const pending = Math.max(registered - completed, 0)
          const nextStatusTotals = scopedTasks.reduce(
            (acc, task) => {
              const bucket = normalizeStatusBucket(task?.taskStatus)
              acc[bucket] += 1
              return acc
            },
            { todo: 0, inProgress: 0, completed: 0 },
          )

          setTeamCompletionMetrics({
            pieData: [
              { name: 'Completed', value: completed },
              { name: 'Pending', value: pending },
            ],
            completionRate: registered > 0 ? `${((completed / registered) * 100).toFixed(1)}%` : '0%',
            completionVsRegistered: `${completed}/${registered}`,
          })
          setAverageCompletionTime(completed > 0 ? totalWorkedHours / completed : 0)
          setStatusTotals(nextStatusTotals)

          if (taskFetchResults.some((result) => result.status === 'rejected')) {
            setTeamCompletionError({
              message: 'Some developer task requests failed. Metrics may be partial.',
            })
          }
        }
      } catch (error) {
        if (!isCancelled) {
          setTeamMemberOptions([])
          setTeamCompletionError({
            message: error instanceof Error
              ? error.message
              : 'Failed to calculate team completion metrics from backend tasks.',
          })
        }
      } finally {
        if (!isCancelled) {
          setTeamCompletionLoading(false)
        }
      }

      try {
        const reworkPath = isDeveloperScoped
          ? `/api/tasks/rework-rate/by-dev/${forcedDeveloperId}`
          : `/api/tasks/rework-rate/by-team/${teamId}`
        const reworkEndpoint = buildEndpoint(apiBaseUrl, reworkPath)
        const reworkResponse = await fetch(reworkEndpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })

        if (!reworkResponse.ok) {
          throw new Error(`Backend responded ${reworkResponse.status} ${reworkResponse.statusText}`)
        }

        const rawRate = await reworkResponse.json()
        const normalizedRate = Number(rawRate ?? 0)

        if (!isCancelled) {
          setReopenedTaskRate(Number.isFinite(normalizedRate) ? normalizedRate : 0)
        }
      } catch (error) {
        if (!isCancelled) {
          setReopenedTaskRateError({
            message: error instanceof Error ? error.message : 'Failed to load reopened task rate.',
          })
        }
      } finally {
        if (!isCancelled) {
          setReopenedTaskRateLoading(false)
        }
      }

      try {
        const tasksByDatePath = (isDeveloperScoped || selectedDeveloperId !== 'all')
          ? `/api/tasks/grouped-by-date/${isDeveloperScoped ? forcedDeveloperId : selectedDeveloperId}`
          : '/api/tasks/grouped-by-date'
        const tasksByDateEndpoint = buildEndpoint(apiBaseUrl, tasksByDatePath)
        const tasksByDateResponse = await fetch(tasksByDateEndpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })

        if (!tasksByDateResponse.ok) {
          throw new Error(`Backend responded ${tasksByDateResponse.status} ${tasksByDateResponse.statusText}`)
        }

        const rawTasksByDate = await tasksByDateResponse.json()
        const formattedTasksByDate = Array.isArray(rawTasksByDate)
          ? rawTasksByDate.map((item) => ({
              date: normalizeChartDate(
                item?.date
                ?? item?.taskDate
                ?? item?.creationDate
                ?? item?.TASKDATE,
              ),
              registered: toNumericCount(item?.registered, item?.REGISTERED, item?.total, item?.count),
              completed: toNumericCount(item?.completed, item?.COMPLETED, item?.finished),
            }))
          : []

        if (!isCancelled) {
          const normalizedData = formattedTasksByDate
            .filter((item) => item?.date)
            .sort((a, b) => String(a.date).localeCompare(String(b.date)))

          setTasksByDateData(normalizedData)
          setTasksByDateError(null)
        }
      } catch (error) {
        if (!isCancelled) {
          const fallbackByDate = groupTasksByCreationDate(scopedTasks)

          if (fallbackByDate.length > 0) {
            setTasksByDateData(fallbackByDate)
            setTasksByDateError(null)
          } else {
            setTasksByDateError({
              message: error instanceof Error ? error.message : 'Failed to load tasks by date.',
            })
          }
        }
      } finally {
        if (!isCancelled) {
          setTasksByDateLoading(false)
        }
      }

      try {
        let formattedTasksByType = []

        if (isDeveloperScoped || selectedDeveloperId !== 'all') {
          const byTypeMap = scopedTasks.reduce((acc, task) => {
            const typeName = getTaskTypeName(task)
            acc.set(typeName, (acc.get(typeName) ?? 0) + 1)
            return acc
          }, new Map())

          formattedTasksByType = Array.from(byTypeMap.entries()).map(([name, value]) => ({ name, value }))
        } else {
          const tasksByTypeEndpoint = buildEndpoint(apiBaseUrl, `/api/tasks/by-type/by-team/${teamId}`)
          const tasksByTypeResponse = await fetch(tasksByTypeEndpoint, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          })

          if (!tasksByTypeResponse.ok) {
            throw new Error(`Backend responded ${tasksByTypeResponse.status} ${tasksByTypeResponse.statusText}`)
          }

          const rawTasksByType = await tasksByTypeResponse.json()
          formattedTasksByType = Array.isArray(rawTasksByType)
            ? rawTasksByType.map((item) => ({
                name: item.typeName ?? 'Unknown',
                value: Number(item.count ?? 0),
              }))
            : []
        }

        if (!isCancelled) {
          setTasksByTypeData(formattedTasksByType)
        }
      } catch (error) {
        if (!isCancelled) {
          setTasksByTypeError({
            message: error instanceof Error ? error.message : 'Failed to load task type distribution.',
          })
        }
      } finally {
        if (!isCancelled) {
          setTasksByTypeLoading(false)
        }
      }
    }

    loadTeamMetrics()

    return () => {
      isCancelled = true
    }
  }, [apiBaseUrl, teamId, isDeveloperScoped, forcedDeveloperId, selectedDeveloperId])

  const developerOptions = useMemo(
    () => {
      if (isDeveloperScoped) {
        const currentMemberLabel = teamMemberOptions
          .find((option) => option.value === forcedDeveloperId)
          ?.label
        const label = currentMemberLabel || user?.name || user?.username || 'My view'
        return [{ value: forcedDeveloperId, label }]
      }

      return [{ value: 'all', label: 'Team view' }, ...teamMemberOptions]
    },
    [isDeveloperScoped, teamMemberOptions, forcedDeveloperId, user],
  )

  useEffect(() => {
    if (isDeveloperScoped && forcedDeveloperId) {
      setDeveloperFilter(forcedDeveloperId)
    }
  }, [isDeveloperScoped, forcedDeveloperId])

  return (
    <>
      <PageHeader
        title="KPI Dashboard"
        subtitle="Find out how your team is doing"
      />

      <AnalyticsFilters
        developerFilter={selectedDeveloperId}
        onDeveloperFilterChange={setDeveloperFilter}
        developerOptions={developerOptions}
      />

      <div className="kpi-grid kpi-grid--2">
        {/* <DeveloperAverageHoursCard selectedDeveloperId={selectedDeveloperId} /> */}
        <TeamAverageFinishedTasksCard selectedDeveloperId={isDeveloperScoped ? forcedDeveloperId : null} />
        <TeamAverageWorkedHoursCard selectedDeveloperId={isDeveloperScoped ? forcedDeveloperId : null} />
      </div>

      <KpiSection
        averageCompletionTime={averageCompletionTime}
        completionRate={teamCompletionMetrics.completionRate}
        completionVsRegistered={teamCompletionMetrics.completionVsRegistered}
        completionRateLoading={teamCompletionLoading}
        completionRateError={teamCompletionError}
        statusTotals={statusTotals}
        reopenedTaskRate={reopenedTaskRate}
        reopenedTaskRateLoading={reopenedTaskRateLoading}
        reopenedTaskRateError={reopenedTaskRateError}
      />

      <ChartGrid>
        <div className="analytics-grid__full-row">
          <TasksByStatusChart
            data={[]}
            isLoading={false}
            error={null}
            renderTooltip={StatusTooltip}
            selectedDeveloperId={selectedDeveloperId}
          />
        </div>
        <div className="analytics-grid__full-row">
          <TasksRegisteredByDateChart data={tasksByDateData} isLoading={tasksByDateLoading} error={tasksByDateError} />
        </div>
        <TeamCompletionChart
          data={teamCompletionMetrics.pieData}
          isLoading={teamCompletionLoading}
          error={teamCompletionError}
        />
        <TaskTypeDistributionChart data={tasksByTypeData} isLoading={tasksByTypeLoading} error={tasksByTypeError} />
        <TimeComparisonChart
          data={[]}
          isLoading={false}
          error={null}
          renderTooltip={TimeComparisonTooltip}
          selectedDeveloperId={selectedDeveloperId}
        />
      </ChartGrid>
    </>
  )
}
