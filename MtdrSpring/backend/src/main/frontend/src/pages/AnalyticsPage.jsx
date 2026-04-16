import { useEffect, useMemo, useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AnalyticsFilters from '../features/analytics/components/AnalyticsFilters'
import DeveloperAverageHoursCard from '../features/analytics/components/DeveloperAverageHoursCard'
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
import { useAnalyticsAggregation } from '../features/analytics/hooks/useAnalyticsAggregation'
import { useData } from '../hooks/useData'
import { fetchTeamDevelopers } from '../utils/teamApi'
import { mockAnalytics } from '../data'

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

export default function AnalyticsPage() {
  const { teamId } = useData()
  const [developerFilter, setDeveloperFilter] = useState('all')
  const [teamMemberOptions, setTeamMemberOptions] = useState([])
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

  const {
    averageCompletionTime,
    timeComparisonData,
    statusComparisonData,
    statusTotals,
  } = useAnalyticsAggregation(mockAnalytics, 'all')

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

      let members = []

      try {
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

        const taskFetchResults = await Promise.allSettled(
          members.map(async (member) => {
            const developerId = String(member?.userId ?? '').trim()
            if (!developerId) {
              return []
            }

            const endpoint = buildEndpoint(apiBaseUrl, `/api/tasks/by-developer/${developerId}`)
            const response = await fetch(endpoint, {
              method: 'GET',
              headers: { Accept: 'application/json' },
            })

            if (!response.ok) {
              throw new Error(`Backend responded ${response.status} ${response.statusText}`)
            }

            const payload = await response.json()
            return Array.isArray(payload) ? payload : []
          }),
        )

        if (!isCancelled) {
          const allTasks = taskFetchResults
            .filter((result) => result.status === 'fulfilled')
            .flatMap((result) => result.value)

          const registered = allTasks.length
          const completed = allTasks.filter((task) => isCompletedStatus(task?.taskStatus)).length
          const pending = Math.max(registered - completed, 0)

          setTeamCompletionMetrics({
            pieData: [
              { name: 'Completed', value: completed },
              { name: 'Pending', value: pending },
            ],
            completionRate: registered > 0 ? `${((completed / registered) * 100).toFixed(1)}%` : '0%',
            completionVsRegistered: `${completed}/${registered}`,
          })

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
        const reworkEndpoint = buildEndpoint(apiBaseUrl, `/api/tasks/rework-rate/by-team/${teamId}`)
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
        const tasksByDateEndpoint = buildEndpoint(apiBaseUrl, '/api/tasks/grouped-by-date')
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
              date: normalizeChartDate(item?.date ?? item?.taskDate ?? item?.creationDate),
              registered: Number(item.registered ?? 0),
              completed: Number(item.completed ?? 0),
            }))
          : []

        if (!isCancelled) {
          setTasksByDateData(formattedTasksByDate)
        }
      } catch (error) {
        if (!isCancelled) {
          setTasksByDateError({
            message: error instanceof Error ? error.message : 'Failed to load tasks by date.',
          })
        }
      } finally {
        if (!isCancelled) {
          setTasksByDateLoading(false)
        }
      }

      try {
        const tasksByTypeEndpoint = buildEndpoint(apiBaseUrl, `/api/tasks/by-type/by-team/${teamId}`)
        const tasksByTypeResponse = await fetch(tasksByTypeEndpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })

        if (!tasksByTypeResponse.ok) {
          throw new Error(`Backend responded ${tasksByTypeResponse.status} ${tasksByTypeResponse.statusText}`)
        }

        const rawTasksByType = await tasksByTypeResponse.json()
        const formattedTasksByType = Array.isArray(rawTasksByType)
          ? rawTasksByType.map((item) => ({
              name: item.typeName ?? 'Unknown',
              value: Number(item.count ?? 0),
            }))
          : []

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
  }, [apiBaseUrl, teamId])

  const developerOptions = useMemo(
    () => [{ value: 'all', label: 'Team view' }, ...teamMemberOptions],
    [teamMemberOptions],
  )

  return (
    <>
      <PageHeader
        title="KPI Dashboard"
        subtitle="Find out how your team is doing"
      />

      <AnalyticsFilters
        developerFilter={developerFilter}
        onDeveloperFilterChange={setDeveloperFilter}
        developerOptions={developerOptions}
      />

      <div className="kpi-grid">
        <DeveloperAverageHoursCard selectedDeveloperId={developerFilter} />
        <TeamAverageFinishedTasksCard />
        <TeamAverageWorkedHoursCard />
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
            data={statusComparisonData}
            isLoading={false}
            error={null}
            renderTooltip={StatusTooltip}
            selectedDeveloperId={developerFilter}
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
          data={timeComparisonData}
          isLoading={false}
          error={null}
          renderTooltip={TimeComparisonTooltip}
          selectedDeveloperId={developerFilter}
        />
      </ChartGrid>
    </>
  )
}
