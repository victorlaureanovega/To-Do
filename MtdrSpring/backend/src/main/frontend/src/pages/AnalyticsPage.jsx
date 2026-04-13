import { useState } from 'react'
import PageHeader from '../components/common/PageHeader'
import AnalyticsFilters from '../features/analytics/components/AnalyticsFilters'
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
import { mockAnalytics } from '../data'

export default function AnalyticsPage() {
  const [developerFilter, setDeveloperFilter] = useState('all')

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
  } = useAnalyticsAggregation(mockAnalytics, developerFilter)

  const developerOptions = [
    { value: 'all', label: 'Team view' },
    ...mockAnalytics.developers.map((dev) => ({ value: dev.id, label: dev.name })),
  ]

  return (
    <>
      <PageHeader
        title="KPI Dashboard"
        subtitle="KPIs y visualizaciones del equipo con datos mock listos para conectar a analytics-service."
      />

      <AnalyticsFilters
        developerFilter={developerFilter}
        onDeveloperFilterChange={setDeveloperFilter}
        developerOptions={developerOptions}
      />

      <KpiSection
        averageCompletionTime={averageCompletionTime}
        completionRate={completionRate}
        completionVsRegistered={completionVsRegistered}
        statusTotals={statusTotals}
        reopenedByTypePercentages={reopenedByTypePercentages}
      />

      <ChartGrid>
        <TasksByStatusChart data={statusComparisonData} isLoading={false} error={null} renderTooltip={StatusTooltip} />
        <TasksRegisteredByDateChart data={mockAnalytics.tasksByDate} isLoading={false} error={null} />
        <TeamCompletionChart data={pieData} isLoading={false} error={null} />
        <TaskTypeDistributionChart data={taskTypePieData} isLoading={false} error={null} />
        <TimeComparisonChart data={timeComparisonData} isLoading={false} error={null} renderTooltip={TimeComparisonTooltip} />
      </ChartGrid>
    </>
  )
}
