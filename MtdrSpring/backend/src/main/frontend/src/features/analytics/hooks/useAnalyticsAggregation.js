/**
 * useAnalyticsAggregation Hook
 * 
 * Extracts all analytics data aggregations from AnalyticsPage.
 * Computes KPI metrics, chart data, and derived values.
 * 
 * Usage:
 *   const {
 *     filteredByDeveloper,
 *     totals,
 *     averageCompletionTime,
 *     completionRate,
 *     pieData,
 *     taskTypeTotals,
 *     taskTypePieData,
 *     timeComparisonData,
 *     statusComparisonData,
 *     statusTotals,
 *     reopenedByTypePercentages,
 *   } = useAnalyticsAggregation(mockAnalytics, developerFilter)
 */

import { useMemo } from 'react'

export function useAnalyticsAggregation(mockAnalytics, developerFilter) {
	const filteredByDeveloper = useMemo(() => {
		if (!mockAnalytics?.tasksByDeveloper) {
			return []
		}

		if (developerFilter === 'all') {
			return mockAnalytics.tasksByDeveloper
		}

		return mockAnalytics.tasksByDeveloper.filter((item) => item.developerId === developerFilter)
	}, [mockAnalytics, developerFilter])

	const totals = useMemo(() => {
		return filteredByDeveloper.reduce(
			(acc, item) => {
				acc.registered += item.registered
				acc.completed += item.completed
				acc.reopened += item.reopened
				acc.estimatedHours += item.estimatedHours
				acc.realHours += item.realHours
				return acc
			},
			{ registered: 0, completed: 0, reopened: 0, estimatedHours: 0, realHours: 0 },
		)
	}, [filteredByDeveloper])

	const averageCompletionTime = useMemo(() => {
		return totals.completed > 0 ? totals.realHours / totals.completed : 0
	}, [totals])

	const completionRate = useMemo(() => {
		return totals.registered > 0 ? `${((totals.completed / totals.registered) * 100).toFixed(1)}%` : '0%'
	}, [totals])

	const pieData = useMemo(() => {
		return [
			{ name: 'Completed', value: totals.completed },
			{ name: 'Pending', value: Math.max(totals.registered - totals.completed, 0) },
		]
	}, [totals])

	const completionVsRegistered = useMemo(() => {
		return `${totals.completed}/${totals.registered}`
	}, [totals])

	const taskTypeTotals = useMemo(() => {
		return filteredByDeveloper.reduce(
			(acc, item) => {
				acc.bug += item.bug
				acc.feature += item.feature
				acc.research += item.research
				acc.documentation += item.documentation
				return acc
			},
			{ bug: 0, feature: 0, research: 0, documentation: 0 },
		)
	}, [filteredByDeveloper])

	const taskTypePieData = useMemo(() => {
		return [
			{ name: 'Debug', value: taskTypeTotals.bug },
			{ name: 'Feature', value: taskTypeTotals.feature },
			{ name: 'Research', value: taskTypeTotals.research },
			{ name: 'Documentation', value: taskTypeTotals.documentation },
		]
	}, [taskTypeTotals])

	const timeComparisonData = useMemo(() => {
		return filteredByDeveloper.map((item) => {
			const estimatedIsLower = item.estimatedHours <= item.realHours
			const lowerValue = Math.min(item.estimatedHours, item.realHours)
			const upperDelta = Math.abs(item.realHours - item.estimatedHours)

			return {
				...item,
				estimatedLower: estimatedIsLower ? lowerValue : 0,
				realLower: estimatedIsLower ? 0 : lowerValue,
				estimatedUpper: estimatedIsLower ? 0 : upperDelta,
				realUpper: estimatedIsLower ? upperDelta : 0,
			}
		})
	}, [filteredByDeveloper])

	const statusComparisonData = useMemo(() => {
		if (!mockAnalytics?.tasksByStatusByDeveloper) {
			return []
		}

		if (developerFilter === 'all') {
			return mockAnalytics.tasksByStatusByDeveloper
		}

		return mockAnalytics.tasksByStatusByDeveloper.filter((item) => item.developerId === developerFilter)
	}, [mockAnalytics, developerFilter])

	const statusTotals = useMemo(() => {
		return statusComparisonData.reduce(
			(acc, item) => {
				acc.todo += item.todo
				acc.inProgress += item.inProgress
				acc.completed += item.completed
				return acc
			},
			{ todo: 0, inProgress: 0, completed: 0 },
		)
	}, [statusComparisonData])

	const reopenedByTypeTotals = useMemo(() => {
		return filteredByDeveloper.reduce(
			(acc, item) => {
				acc.bug += item.reopenedByType?.bug ?? 0
				acc.feature += item.reopenedByType?.feature ?? 0
				acc.research += item.reopenedByType?.research ?? 0
				acc.documentation += item.reopenedByType?.documentation ?? 0
				return acc
			},
			{ bug: 0, feature: 0, research: 0, documentation: 0 },
		)
	}, [filteredByDeveloper])

	const reopenedByTypePercentages = useMemo(() => {
		return {
			bug: taskTypeTotals.bug > 0 ? (reopenedByTypeTotals.bug / taskTypeTotals.bug) * 100 : 0,
			feature:
				taskTypeTotals.feature > 0 ? (reopenedByTypeTotals.feature / taskTypeTotals.feature) * 100 : 0,
			research:
				taskTypeTotals.research > 0
					? (reopenedByTypeTotals.research / taskTypeTotals.research) * 100
					: 0,
			documentation:
				taskTypeTotals.documentation > 0
					? (reopenedByTypeTotals.documentation / taskTypeTotals.documentation) * 100
					: 0,
		}
	}, [taskTypeTotals, reopenedByTypeTotals])

	return {
		filteredByDeveloper,
		totals,
		averageCompletionTime,
		completionRate,
		completionVsRegistered,
		pieData,
		taskTypeTotals,
		taskTypePieData,
		timeComparisonData,
		statusComparisonData,
		statusTotals,
		reopenedByTypeTotals,
		reopenedByTypePercentages,
	}
}
