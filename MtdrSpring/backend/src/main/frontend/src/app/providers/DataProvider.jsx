/**
 * DataProvider Context
 * 
 * Centralized data management for the application.
 * Manages: tasks, analytics, developers, loading states, errors.
 * 
 * This allows any page to access data without prop drilling.
 * When integrating with a real API, service calls are wired here.
 */

import { createContext, useState, useCallback, useEffect } from 'react'
import { taskService } from '../../services/api/taskService'
import { analyticsService } from '../../services/api/analyticsService'

export const DataContext = createContext(null)

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const mapBackendTaskToUiTask = (task) => {
	const fullName = `${task?.user?.firstName ?? ''} ${task?.user?.lastName ?? ''}`.trim()

	return {
		id: String(task?.taskId ?? ''),
		title: task?.content ? task.content.slice(0, 80) : `Task ${task?.taskId ?? ''}`,
		description: task?.content ?? '',
		status: task?.taskStatus ?? 'Unknown',
		estimatedDuration: task?.estimatedDuration != null ? String(task.estimatedDuration) : '',
		createdAt: task?.creationDate ? String(task.creationDate).split('T')[0] : '',
		assignee: fullName || task?.user?.username || null,
	}
}

export function DataProvider({ children }) {
	// Tasks state (developer tasks)
	const [developerTasks, setDeveloperTasks] = useState([])
	const [tasksLoading, setTasksLoading] = useState(false)
	const [tasksError, setTasksError] = useState(null)
	const [developerHours, setDeveloperHours] = useState(null)
	const [developerHoursLoading, setDeveloperHoursLoading] = useState(false)
	const [developerHoursError, setDeveloperHoursError] = useState(null)
	const [teamAverageFinishedTasks, setTeamAverageFinishedTasks] = useState(null)
	const [teamAverageFinishedTasksLoading, setTeamAverageFinishedTasksLoading] = useState(false)
	const [teamAverageFinishedTasksError, setTeamAverageFinishedTasksError] = useState(null)
	const [teamAverageWorkedHours, setTeamAverageWorkedHours] = useState(null)
	const [teamAverageWorkedHoursLoading, setTeamAverageWorkedHoursLoading] = useState(false)
	const [teamAverageWorkedHoursError, setTeamAverageWorkedHoursError] = useState(null)

	// Team tasks state (read-only)
	const [teamTasks, setTeamTasks] = useState([])
	const [teamTasksLoading, setTeamTasksLoading] = useState(false)
	const [teamTasksError, setTeamTasksError] = useState(null)

	// Analytics state
	const [analytics, setAnalytics] = useState(null)
	const [analyticsLoading, setAnalyticsLoading] = useState(false)
	const [analyticsError, setAnalyticsError] = useState(null)

	// ==================== Developer Tasks Operations ====================

	const fetchDeveloperTasks = useCallback(async (filters = {}) => {
		setTasksLoading(true)
		setTasksError(null)

		const response = await taskService.fetchDeveloperTasks(filters)

		if (response.success) {
			setDeveloperTasks(response.data)
			setTasksError(null)
		} else {
			setTasksError(response.error)
		}

		setTasksLoading(false)
		return response
	}, [])

	// Connectivity smoke test: calls backend endpoint /api/tasks/by-developer/{id}.
	// This is opt-in and does not replace existing mock-driven flows.
	const fetchDeveloperTasksFromBackend = useCallback(async (developerId) => {
		if (!developerId) {
			const error = {
				message: 'Developer ID is required',
				code: 'VALIDATION_ERROR',
			}

			setTasksError(error)
			return { success: false, data: null, error }
		}

		setTasksLoading(true)
		setTasksError(null)

		try {
			const endpoint = apiBaseUrl
				? `${apiBaseUrl}/api/tasks/by-developer/${developerId}`
				: `/api/tasks/by-developer/${developerId}`

			const response = await fetch(endpoint, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			})

			if (!response.ok) {
				const error = {
					message: `Backend responded ${response.status} ${response.statusText}`,
					code: 'BACKEND_HTTP_ERROR',
				}

				setTasksError(error)
				return { success: false, data: null, error }
			}

			const rawTasks = await response.json()
			const mappedTasks = Array.isArray(rawTasks) ? rawTasks.map(mapBackendTaskToUiTask) : []

			setDeveloperTasks(mappedTasks)
			setTasksError(null)

			return { success: true, data: mappedTasks }
		} catch (error) {
			const normalizedError = {
				message: error instanceof Error ? error.message : 'Failed to call backend endpoint',
				code: 'BACKEND_CALL_FAILED',
			}

			setTasksError(normalizedError)
			return { success: false, data: null, error: normalizedError }
		} finally {
			setTasksLoading(false)
		}
	}, [])

	// KPI backend call: computes average worked hours per task for a developer.
	const fetchDeveloperAverageHoursFromBackend = useCallback(async (developerId) => {
		if (!developerId) {
			const error = {
				message: 'Developer ID is required',
				code: 'VALIDATION_ERROR',
			}

			setDeveloperHoursError(error)
			return { success: false, data: null, error }
		}

		setDeveloperHoursLoading(true)
		setDeveloperHoursError(null)

		try {
			const hoursEndpoint = apiBaseUrl
				? `${apiBaseUrl}/api/tasks/hours/by-developer/${developerId}`
				: `/api/tasks/hours/by-developer/${developerId}`

			const tasksEndpoint = apiBaseUrl
				? `${apiBaseUrl}/api/tasks/by-developer/${developerId}`
				: `/api/tasks/by-developer/${developerId}`

			const [hoursResponse, tasksResponse] = await Promise.all([
				fetch(hoursEndpoint, {
					method: 'GET',
					headers: { Accept: 'application/json' },
				}),
				fetch(tasksEndpoint, {
					method: 'GET',
					headers: { Accept: 'application/json' },
				}),
			])

			if (!hoursResponse.ok || !tasksResponse.ok) {
				const status = !hoursResponse.ok
					? `${hoursResponse.status} ${hoursResponse.statusText}`
					: `${tasksResponse.status} ${tasksResponse.statusText}`

				const error = {
					message: `Backend responded ${status}`,
					code: 'BACKEND_HTTP_ERROR',
				}

				setDeveloperHoursError(error)
				return { success: false, data: null, error }
			}

			const hoursData = await hoursResponse.json()
			const tasksData = await tasksResponse.json()

			const totalWorkedHours = Number(hoursData?.totalWorkedHours ?? 0)
			const totalEstimatedHours = Number(hoursData?.totalEstimatedHours ?? 0)
			const taskCount = Array.isArray(tasksData) ? tasksData.length : 0
			const averageWorkedHours = taskCount > 0 ? totalWorkedHours / taskCount : 0

			const payload = {
				developerId: String(developerId),
				averageWorkedHours,
				totalWorkedHours,
				totalEstimatedHours,
				taskCount,
			}

			setDeveloperHours(payload)
			setDeveloperHoursError(null)

			return { success: true, data: payload }
		} catch (error) {
			const normalizedError = {
				message: error instanceof Error ? error.message : 'Failed to load developer hours',
				code: 'BACKEND_CALL_FAILED',
			}

			setDeveloperHoursError(normalizedError)
			return { success: false, data: null, error: normalizedError }
		} finally {
			setDeveloperHoursLoading(false)
		}
	}, [])

	// KPI backend call: average finished tasks per member for a team.
	const fetchTeamAverageFinishedTasksFromBackend = useCallback(async (teamId) => {
		if (!teamId) {
			const error = {
				message: 'Team ID is required',
				code: 'VALIDATION_ERROR',
			}

			setTeamAverageFinishedTasksError(error)
			return { success: false, data: null, error }
		}

		setTeamAverageFinishedTasksLoading(true)
		setTeamAverageFinishedTasksError(null)

		try {
			const endpoint = apiBaseUrl
				? `${apiBaseUrl}/api/tasks/average-by-team/${teamId}`
				: `/api/tasks/average-by-team/${teamId}`

			const response = await fetch(endpoint, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			})

			if (!response.ok) {
				const error = {
					message: `Backend responded ${response.status} ${response.statusText}`,
					code: 'BACKEND_HTTP_ERROR',
				}

				setTeamAverageFinishedTasksError(error)
				return { success: false, data: null, error }
			}

			const rawAverage = await response.json()
			const averageFinishedTasks = Number(rawAverage ?? 0)

			const payload = {
				teamId: String(teamId),
				averageFinishedTasks,
			}

			setTeamAverageFinishedTasks(payload)
			setTeamAverageFinishedTasksError(null)

			return { success: true, data: payload }
		} catch (error) {
			const normalizedError = {
				message: error instanceof Error ? error.message : 'Failed to load team average finished tasks',
				code: 'BACKEND_CALL_FAILED',
			}

			setTeamAverageFinishedTasksError(normalizedError)
			return { success: false, data: null, error: normalizedError }
		} finally {
			setTeamAverageFinishedTasksLoading(false)
		}
	}, [])

	// KPI backend call: average worked hours per member for a team.
	const fetchTeamAverageWorkedHoursFromBackend = useCallback(async (teamId) => {
		if (!teamId) {
			const error = {
				message: 'Team ID is required',
				code: 'VALIDATION_ERROR',
			}

			setTeamAverageWorkedHoursError(error)
			return { success: false, data: null, error }
		}

		setTeamAverageWorkedHoursLoading(true)
		setTeamAverageWorkedHoursError(null)

		try {
			const endpoint = apiBaseUrl
				? `${apiBaseUrl}/api/tasks/hours/average-by-team/${teamId}`
				: `/api/tasks/hours/average-by-team/${teamId}`

			const response = await fetch(endpoint, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
			})

			if (!response.ok) {
				const error = {
					message: `Backend responded ${response.status} ${response.statusText}`,
					code: 'BACKEND_HTTP_ERROR',
				}

				setTeamAverageWorkedHoursError(error)
				return { success: false, data: null, error }
			}

			const rawAverage = await response.json()
			const averageWorkedHours = Number(rawAverage ?? 0)

			const payload = {
				teamId: String(teamId),
				averageWorkedHours,
			}

			setTeamAverageWorkedHours(payload)
			setTeamAverageWorkedHoursError(null)

			return { success: true, data: payload }
		} catch (error) {
			const normalizedError = {
				message: error instanceof Error ? error.message : 'Failed to load team average worked hours',
				code: 'BACKEND_CALL_FAILED',
			}

			setTeamAverageWorkedHoursError(normalizedError)
			return { success: false, data: null, error: normalizedError }
		} finally {
			setTeamAverageWorkedHoursLoading(false)
		}
	}, [])

	const createTask = useCallback(async (taskData) => {
		const response = await taskService.createTask(taskData)

		if (response.success) {
			// Optimistic update: add to local state
			setDeveloperTasks((prev) => [...prev, response.data])
			setTasksError(null)
		} else {
			setTasksError(response.error)
		}

		return response
	}, [])

	const updateTask = useCallback(async (taskId, updates) => {
		const response = await taskService.updateTask(taskId, updates)

		if (response.success) {
			// Optimistic update: update in local state
			setDeveloperTasks((prev) => prev.map((t) => (t.id === taskId ? response.data : t)))
			setTasksError(null)
		} else {
			setTasksError(response.error)
		}

		return response
	}, [])

	const deleteTask = useCallback(async (taskId) => {
		const response = await taskService.deleteTask(taskId)

		if (response.success) {
			// Optimistic update: remove from local state
			setDeveloperTasks((prev) => prev.filter((t) => t.id !== taskId))
			setTasksError(null)
		} else {
			setTasksError(response.error)
		}

		return response
	}, [])

	// ==================== Team Tasks Operations ====================

	const fetchTeamTasks = useCallback(async (filters = {}) => {
		setTeamTasksLoading(true)
		setTeamTasksError(null)

		const response = await taskService.fetchTeamTasks(filters)

		if (response.success) {
			setTeamTasks(response.data)
			setTeamTasksError(null)
		} else {
			setTeamTasksError(response.error)
		}

		setTeamTasksLoading(false)
		return response
	}, [])

	// ==================== Analytics Operations ====================

	const fetchAnalytics = useCallback(async (filters = {}) => {
		setAnalyticsLoading(true)
		setAnalyticsError(null)

		const response = await analyticsService.fetchDashboardMetrics(filters)

		if (response.success) {
			setAnalytics(response.data)
			setAnalyticsError(null)
		} else {
			setAnalyticsError(response.error)
		}

		setAnalyticsLoading(false)
		return response
	}, [])

	// ==================== Initialize on Mount ====================

	useEffect(() => {
		// Fetch initial data when app loads
		fetchDeveloperTasks()
		fetchTeamTasks()
		fetchAnalytics()
	}, [fetchDeveloperTasks, fetchTeamTasks, fetchAnalytics])

	// ==================== Context Value ====================

	const value = {
		// Developer tasks
		developerTasks,
		tasksLoading,
		tasksError,
		fetchDeveloperTasks,
		fetchDeveloperTasksFromBackend,
		developerHours,
		developerHoursLoading,
		developerHoursError,
		fetchDeveloperAverageHoursFromBackend,
		teamAverageFinishedTasks,
		teamAverageFinishedTasksLoading,
		teamAverageFinishedTasksError,
		fetchTeamAverageFinishedTasksFromBackend,
		teamAverageWorkedHours,
		teamAverageWorkedHoursLoading,
		teamAverageWorkedHoursError,
		fetchTeamAverageWorkedHoursFromBackend,
		getTasks: fetchDeveloperTasks,
		createTask,
		updateTask,
		deleteTask,

		// Team tasks
		teamTasks,
		teamTasksLoading,
		teamTasksError,
		fetchTeamTasks,
		getTeamTasks: fetchTeamTasks,

		// Analytics
		analytics,
		analyticsLoading,
		analyticsError,
		fetchAnalytics,
		getAnalytics: fetchAnalytics,
	}

	return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
