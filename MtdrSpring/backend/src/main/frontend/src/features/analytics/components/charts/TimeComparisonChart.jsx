/**
 * TimeComparisonChart Component
 * 
 * Stacked bar chart comparing estimated vs real hours per developer.
 * Uses custom tooltip to show original values.
 * Uses real backend data from /api/tasks/hours/by-developer/{developerId}.
 */

import { useEffect, useState } from 'react'
import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'
import { CHART_THEME, CHART_MESSAGE_STYLE, CHART_ERROR_STYLE } from '../../constants/chartTheme'
import { useData } from '../../../../hooks/useData'
import { fetchTeamDevelopers } from '../../../../utils/teamApi'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const getDisplayName = (user) => {
	const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
	if (fullName) return fullName
	if (user?.username) return user.username
	return `Developer ${user?.userId ?? ''}`
}

const toStackedRow = (developerLabel, estimatedHours, realHours) => {
	const estimatedIsLower = estimatedHours <= realHours
	const lowerValue = Math.min(estimatedHours, realHours)
	const upperDelta = Math.abs(realHours - estimatedHours)

	return {
		developer: developerLabel,
		estimatedHours,
		realHours,
		estimatedLower: estimatedIsLower ? lowerValue : 0,
		realLower: estimatedIsLower ? 0 : lowerValue,
		estimatedUpper: estimatedIsLower ? 0 : upperDelta,
		realUpper: estimatedIsLower ? upperDelta : 0,
	}
}

export default function TimeComparisonChart({ data: _data, isLoading, error, renderTooltip, selectedDeveloperId = 'all' }) {
	const { teamId } = useData()
	const [backendData, setBackendData] = useState([])
	const [backendLoading, setBackendLoading] = useState(false)
	const [backendError, setBackendError] = useState(null)

	useEffect(() => {
		let isCancelled = false

		const fetchTimeComparisonData = async () => {
			setBackendLoading(true)
			setBackendError(null)

			try {
				const developers = await fetchTeamDevelopers(apiBaseUrl, teamId)
				const scopedDevelopers =
					selectedDeveloperId === 'all'
						? developers
						: developers.filter((developer) => String(developer?.userId ?? '') === String(selectedDeveloperId))

				const settled = await Promise.allSettled(
					scopedDevelopers.map(async (developer) => {
						const developerId = developer?.userId
						const endpoint = apiBaseUrl
							? `${apiBaseUrl}/api/tasks/hours/by-developer/${developerId}`
							: `/api/tasks/hours/by-developer/${developerId}`

						const response = await fetch(endpoint, {
							method: 'GET',
							headers: { Accept: 'application/json' },
						})

						if (!response.ok) {
							throw new Error(`Backend responded ${response.status} ${response.statusText}`)
						}

						const hours = await response.json()
						const estimatedHours = Number(hours?.totalEstimatedHours ?? 0)
						const realHours = Number(hours?.totalWorkedHours ?? 0)

						return toStackedRow(getDisplayName(developer), estimatedHours, realHours)
					}),
				)

				const rows = settled
					.filter((result) => result.status === 'fulfilled')
					.map((result) => result.value)

				if (!isCancelled) {
					setBackendData(rows)
				}
			} catch (fetchError) {
				if (!isCancelled) {
					setBackendError(fetchError)
				}
			} finally {
				if (!isCancelled) {
					setBackendLoading(false)
				}
			}
		}

		fetchTimeComparisonData()

		return () => {
			isCancelled = true
		}
	}, [teamId, selectedDeveloperId])

	const effectiveError = backendError ?? error
	const effectiveLoading = backendLoading || isLoading
	const chartData = backendData

	if (effectiveError) {
		return (
			<SectionCard title="Estimated vs Real Time by Developer">
				<div style={CHART_ERROR_STYLE}>Error loading chart: {effectiveError.message}</div>
			</SectionCard>
		)
	}

	if (effectiveLoading) {
		return (
			<SectionCard title="Estimated vs Real Time by Developer">
				<div style={CHART_MESSAGE_STYLE}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Estimated vs Real Time by Developer">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridStroke} />
						<XAxis dataKey="developer" stroke={CHART_THEME.axisStroke} tick={{ fill: CHART_THEME.axisTick }} tickLine={{ stroke: CHART_THEME.axisStroke }} axisLine={{ stroke: CHART_THEME.axisStroke }} />
						<YAxis stroke={CHART_THEME.axisStroke} tick={{ fill: CHART_THEME.axisTick }} tickLine={{ stroke: CHART_THEME.axisStroke }} axisLine={{ stroke: CHART_THEME.axisStroke }} />
						<Tooltip content={renderTooltip} contentStyle={CHART_THEME.tooltip.contentStyle} labelStyle={CHART_THEME.tooltip.labelStyle} itemStyle={CHART_THEME.tooltip.itemStyle} />
						<Legend wrapperStyle={{ color: CHART_THEME.legendText }} />
						<Bar dataKey="estimatedLower" stackId="time" fill={CHART_THEME.timeComparison.estimated} name="Estimated (h)" />
						<Bar dataKey="realLower" stackId="time" fill={CHART_THEME.timeComparison.real} name="Real (h)" />
						<Bar dataKey="estimatedUpper" stackId="time" fill={CHART_THEME.timeComparison.estimated} legendType="none" radius={[4, 4, 0, 0]} />
						<Bar dataKey="realUpper" stackId="time" fill={CHART_THEME.timeComparison.real} legendType="none" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
