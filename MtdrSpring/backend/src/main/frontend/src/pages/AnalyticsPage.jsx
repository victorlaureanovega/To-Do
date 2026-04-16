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

export default function AnalyticsPage() {
  const { teamId } = useData()
  const [developerFilter, setDeveloperFilter] = useState('all')
  const [teamMemberOptions, setTeamMemberOptions] = useState([])

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

  const {
    averageCompletionTime,
    completionRate,
    completionVsRegistered,
    pieData,
    taskTypePieData,
    timeComparisonData,
    statusComparisonData,
    statusTotals,
    reopenedByTypePercentages,
  } = useAnalyticsAggregation(mockAnalytics, 'all')

  useEffect(() => {
    let isCancelled = false

    const loadTeamMembers = async () => {
      try {
        const members = await fetchTeamDevelopers(apiBaseUrl, teamId)
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
      } catch {
        if (!isCancelled) {
          setTeamMemberOptions([])
        }
      }
    }

    loadTeamMembers()

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
        completionRate={completionRate}
        completionVsRegistered={completionVsRegistered}
        statusTotals={statusTotals}
        reopenedByTypePercentages={reopenedByTypePercentages}
      />

      <ChartGrid>
        <TasksByStatusChart
          data={statusComparisonData}
          isLoading={false}
          error={null}
          renderTooltip={StatusTooltip}
          selectedDeveloperId={developerFilter}
        />
        <TasksRegisteredByDateChart data={mockAnalytics.tasksByDate} isLoading={false} error={null} />
        <TeamCompletionChart data={pieData} isLoading={false} error={null} />
        <TaskTypeDistributionChart data={taskTypePieData} isLoading={false} error={null} />
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
