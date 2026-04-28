/**
 * TasksByStatusChart Component
 * 
 * Stacked bar chart showing task status distribution per developer.
 * Uses real backend data from /api/users and /api/tasks/by-developer/{userId}.
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

const normalizeStatus = (taskStatus) => {
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

const createEmptyStatusRow = (developer) => ({
	developer,
	todo: 0,
	inProgress: 0,
	completed: 0,
})

const getSprintNumber = (task) => {
	const sprintValue = task?._Sprint
	if (sprintValue == null || sprintValue === '') {
		return null
	}

	const sprintNumber = Number(sprintValue)
	return Number.isFinite(sprintNumber) ? sprintNumber : null
}

export default function TasksByStatusChart({ data: _data, isLoading, error, renderTooltip, selectedDeveloperId = 'all' }) {
	const { teamId } = useData()
	const [backendData, setBackendData] = useState([])
	const [backendLoading, setBackendLoading] = useState(false)
	const [backendError, setBackendError] = useState(null)
	const [selectedSprint, setSelectedSprint] = useState('all')
	const [availableSprints, setAvailableSprints] = useState([])

	useEffect(() => {
		let isCancelled = false

		const fetchStatusData = async () => {
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
							? `${apiBaseUrl}/api/tasks/by-developer/${developerId}`
							: `/api/tasks/by-developer/${developerId}`

						const response = await fetch(endpoint, {
							method: 'GET',
							headers: { Accept: 'application/json' },
						})

						if (!response.ok) {
							throw new Error(`Backend responded ${response.status} ${response.statusText}`)
						}

						const tasks = await response.json()
						const statusRow = createEmptyStatusRow(getDisplayName(developer))
						const sprintNumbers = new Set()

						if (Array.isArray(tasks)) {
							for (const task of tasks) {
								const sprintNumber = getSprintNumber(task)
								if (sprintNumber != null) {
									sprintNumbers.add(sprintNumber)
								}

								if (sprintFilter != null && sprintNumber !== sprintFilter) {
									continue
								}

								const bucket = normalizeStatus(task?.taskStatus)
								statusRow[bucket] += 1
							}
						}

						return { statusRow, sprintNumbers: Array.from(sprintNumbers) }
					}),
				)

				const rows = settled
					.filter((result) => result.status === 'fulfilled')
					.map((result) => result.value.statusRow)

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

		fetchStatusData()

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
			<SectionCard title="Tasks by Status by Developer">
				<div style={CHART_ERROR_STYLE}>Error loading chart: {effectiveError.message}</div>
			</SectionCard>
		)
	}

	if (effectiveLoading) {
		return (
			<SectionCard title="Tasks by Status by Developer">
				<div style={CHART_MESSAGE_STYLE}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Tasks by Status by Developer">
			<div className="chart-filter-bar">
				<div className="form-field chart-filter-bar__field">
					<label className="form-label" htmlFor="tasks-status-sprint-filter">Sprint</label>
					<select
						id="tasks-status-sprint-filter"
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
						<Bar dataKey="todo" stackId="status" fill={CHART_THEME.status.todo} name="To Do" />
						<Bar dataKey="inProgress" stackId="status" fill={CHART_THEME.status.inProgress} name="In Progress" />
						<Bar dataKey="completed" stackId="status" fill={CHART_THEME.status.completed} name="Completed" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
