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
