/**
 * TimeComparisonChart Component
 * 
 * Stacked bar chart comparing estimated vs real hours per developer.
 * Uses custom tooltip to show original values.
 * Uses real backend data from /api/tasks/hours/by-developer/{developerId}.
 */

import { useEffect, useMemo, useState } from 'react'
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

const getSprintNumber = (value) => {
	if (value == null || value === '') {
		return null
	}

	const sprintNumber = Number(value)
	return Number.isFinite(sprintNumber) ? sprintNumber : null
}

const sumHoursRows = (rows, sprintFilter) => {
	if (!Array.isArray(rows) || rows.length === 0) {
		return { estimatedHours: 0, realHours: 0 }
	}

	if (sprintFilter == null) {
		return rows.reduce((accumulator, row) => ({
			estimatedHours: accumulator.estimatedHours + Number(row?.totalEstimatedHours ?? 0),
			realHours: accumulator.realHours + Number(row?.totalWorkedHours ?? 0),
		}), { estimatedHours: 0, realHours: 0 })
	}

	const match = rows.find((row) => getSprintNumber(row?.sprint) === sprintFilter)
	return {
		estimatedHours: Number(match?.totalEstimatedHours ?? 0),
		realHours: Number(match?.totalWorkedHours ?? 0),
	}
}

export default function TimeComparisonChart({ data: _data, isLoading, error, renderTooltip, selectedDeveloperId = 'all' }) {
	const { teamId } = useData()
	const [backendData, setBackendData] = useState([])
	const [backendLoading, setBackendLoading] = useState(false)
	const [backendError, setBackendError] = useState(null)
	const [selectedSprint, setSelectedSprint] = useState('all')
	const [availableSprints, setAvailableSprints] = useState([])

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
				const sprintFilter = selectedSprint === 'all' ? null : Number(selectedSprint)

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
						const hoursRows = Array.isArray(hours) ? hours : []
						const sprintNumbers = hoursRows
							.map((row) => getSprintNumber(row?.sprint))
							.filter((value) => value != null)

						const { estimatedHours, realHours } = sumHoursRows(hoursRows, sprintFilter)

						return { row: toStackedRow(getDisplayName(developer), estimatedHours, realHours), sprintNumbers }
					}),
				)

				const rows = settled
					.filter((result) => result.status === 'fulfilled')
					.map((result) => result.value.row)

				const sprintOptions = Array.from(new Set(
					settled
						.filter((result) => result.status === 'fulfilled')
						.flatMap((result) => result.value.sprintNumbers),
				)).sort((a, b) => a - b)

				if (!isCancelled) {
					setBackendData(rows)
					setAvailableSprints(sprintOptions)
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
	}, [teamId, selectedDeveloperId, selectedSprint])

	const effectiveError = backendError ?? error
	const effectiveLoading = backendLoading || isLoading
	const chartData = backendData
	const sprintSelectOptions = useMemo(() => availableSprints.slice().sort((a, b) => a - b), [availableSprints])

	const handleSprintChange = (event) => {
		setSelectedSprint(event.target.value)
	}

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
			<div className="chart-filter-bar">
				<div className="form-field chart-filter-bar__field">
					<label className="form-label" htmlFor="time-comparison-sprint-filter">Sprint</label>
					<select
						id="time-comparison-sprint-filter"
						className="form-select chart-filter-bar__select"
						value={selectedSprint}
						onChange={handleSprintChange}
					>
						<option value="all">All sprints</option>
						{sprintSelectOptions.map((sprintNumber) => (
							<option key={sprintNumber} value={String(sprintNumber)}>{`Sprint ${sprintNumber}`}</option>
						))}
					</select>
				</div>
			</div>
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
