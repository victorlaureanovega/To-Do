/**
 * TimeComparisonChart Component
 * 
 * Stacked bar chart comparing estimated vs real hours per developer.
 * Uses custom tooltip to show original values.
 * Uses real backend data from /api/tasks/hours/by-developer/{developerId}.
 */

import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

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

export default function TimeComparisonChart({ data, isLoading, error, renderTooltip }) {
	const [backendData, setBackendData] = useState([])
	const [backendLoading, setBackendLoading] = useState(false)
	const [backendError, setBackendError] = useState(null)

	useEffect(() => {
		let isCancelled = false

		const fetchTimeComparisonData = async () => {
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
	}, [])

	const effectiveError = backendError ?? error
	const effectiveLoading = backendLoading || isLoading
	const chartData = backendData

	if (effectiveError) {
		return (
			<SectionCard title="Estimated vs Real Time by Developer">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {effectiveError.message}</div>
			</SectionCard>
		)
	}

	if (effectiveLoading) {
		return (
			<SectionCard title="Estimated vs Real Time by Developer">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Estimated vs Real Time by Developer">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="developer" />
						<YAxis />
						<Tooltip content={renderTooltip} />
						<Legend />
						<Bar dataKey="estimatedLower" stackId="time" fill="#2f4158" name="Estimated (h)" />
						<Bar dataKey="realLower" stackId="time" fill="#c74634" name="Real (h)" />
						<Bar dataKey="estimatedUpper" stackId="time" fill="#2f4158" legendType="none" radius={[4, 4, 0, 0]} />
						<Bar dataKey="realUpper" stackId="time" fill="#c74634" legendType="none" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
