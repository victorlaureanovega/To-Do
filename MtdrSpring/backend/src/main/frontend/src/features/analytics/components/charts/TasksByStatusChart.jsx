22/**
 * TasksByStatusChart Component
 * 
 * Stacked bar chart showing task status distribution per developer.
 * Uses real backend data from /api/users and /api/tasks/by-developer/{userId}.
 */

import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const TASK_STATUS_COLORS = {
	todo: '#334155',
	inProgress: '#b45309',
	completed: '#276749',
}

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

export default function TasksByStatusChart({ data, isLoading, error, renderTooltip }) {
	const [backendData, setBackendData] = useState([])
	const [backendLoading, setBackendLoading] = useState(false)
	const [backendError, setBackendError] = useState(null)

	useEffect(() => {
		let isCancelled = false

		const fetchStatusData = async () => {
			setBackendLoading(true)
			setBackendError(null)

			try {
				const usersEndpoint = apiBaseUrl ? `${apiBaseUrl}/api/users` : '/api/users'
				const usersResponse = await fetch(usersEndpoint, {
					method: 'GET',
					headers: { Accept: 'application/json' },
				})

				if (!usersResponse.ok) {
					throw new Error(`Backend responded ${usersResponse.status} ${usersResponse.statusText}`)
				}

				const users = await usersResponse.json()
				const developers = Array.isArray(users)
					? users.filter((user) => {
						const role = String(user?.role ?? '').toLowerCase()
						if (!role) return true
						return role === 'developer'
					})
					: []

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

						const tasks = await response.json()
						const statusRow = createEmptyStatusRow(getDisplayName(developer))

						if (Array.isArray(tasks)) {
							for (const task of tasks) {
								const bucket = normalizeStatus(task?.taskStatus)
								statusRow[bucket] += 1
							}
						}

						return statusRow
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

		fetchStatusData()

		return () => {
			isCancelled = true
		}
	}, [])

	const effectiveError = backendError ?? error
	const effectiveLoading = backendLoading || isLoading
	const chartData = backendData

	if (effectiveError) {
		return (
			<SectionCard title="Tasks by Status by Developer">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {effectiveError.message}</div>
			</SectionCard>
		)
	}

	if (effectiveLoading) {
		return (
			<SectionCard title="Tasks by Status by Developer">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Tasks by Status by Developer">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="developer" />
						<YAxis />
						<Tooltip content={renderTooltip} />
						<Legend />
						<Bar dataKey="todo" stackId="status" fill={TASK_STATUS_COLORS.todo} name="To Do" />
						<Bar dataKey="inProgress" stackId="status" fill={TASK_STATUS_COLORS.inProgress} name="In Progress" />
						<Bar dataKey="completed" stackId="status" fill={TASK_STATUS_COLORS.completed} name="Completed" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
