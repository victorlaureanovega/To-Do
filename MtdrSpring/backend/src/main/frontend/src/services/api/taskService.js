/**
 * Task Service
 * 
 * Handles task-related API operations: fetch, create, update, delete.
 * Currently uses mock data; swap mockDataService for real API fetch() calls.
 */

import { mockDataService } from '../mocks/mockDataService'
import { restAdapter } from './restAdapter'

export const taskService = {
	/**
	 * Fetch all tasks for the current developer
	 * 
	 * @param {object} filters - Optional filters { status, assignee, etc. }
	 * @returns {Promise<{ success: bool, data: Task[], error?: object }>}
	 */
	async fetchDeveloperTasks(filters = {}) {
		try {
			const tasks = await mockDataService.fetchDeveloperTasks()
			const normalized = restAdapter.normalizeTasks(tasks)
			
			// Apply filters if provided
			let filtered = normalized
			if (filters.status && filters.status !== 'All') {
				filtered = filtered.filter((t) => t.status === filters.status)
			}
			
			return {
				success: true,
				data: filtered,
			}
		} catch (error) {
			return {
				success: false,
				data: null,
				error: restAdapter.normalizeError(error),
			}
		}
	},

	/**
	 * Fetch all team tasks (read-only)
	 * 
	 * @param {object} filters - Optional filters { developerId, status, etc. }
	 * @returns {Promise<{ success: bool, data: Task[], error?: object }>}
	 */
	async fetchTeamTasks(filters = {}) {
		try {
			const tasks = await mockDataService.fetchTeamTasks()
			const normalized = restAdapter.normalizeTasks(tasks)
			
			// Apply filters if provided
			let filtered = normalized
			if (filters.assignee && filters.assignee !== 'All') {
				filtered = filtered.filter((t) => t.assignee === filters.assignee)
			}
			if (filters.status && filters.status !== 'All') {
				filtered = filtered.filter((t) => t.status === filters.status)
			}
			
			return {
				success: true,
				data: filtered,
			}
		} catch (error) {
			return {
				success: false,
				data: null,
				error: restAdapter.normalizeError(error),
			}
		}
	},

	/**
	 * Fetch a single task by ID
	 * 
	 * @param {string} taskId - Task ID (e.g., "TASK-1001")
	 * @returns {Promise<{ success: bool, data: Task | null, error?: object }>}
	 */
	async fetchTaskById(taskId) {
		try {
			const allTasks = await mockDataService.fetchDeveloperTasks()
			const task = allTasks.find((t) => t.id === taskId)
			
			if (!task) {
				return {
					success: false,
					data: null,
					error: {
						message: `Task ${taskId} not found`,
						code: 'TASK_NOT_FOUND',
					},
				}
			}
			
			const normalized = restAdapter.normalizeTask(task)
			return {
				success: true,
				data: normalized,
			}
		} catch (error) {
			return {
				success: false,
				data: null,
				error: restAdapter.normalizeError(error),
			}
		}
	},

	/**
	 * Create a new task
	 * 
	 * @param {object} taskData - Task data { title, description, status, estimatedDuration }
	 * @returns {Promise<{ success: bool, data: Task | null, error?: object }>}
	 */
	async createTask(taskData) {
		try {
			// Validation (can be moved to a validator utility)
			if (!taskData.title || !taskData.title.trim()) {
				return {
					success: false,
					data: null,
					error: {
						message: 'Task title is required',
						code: 'VALIDATION_ERROR',
					},
				}
			}
			
			const created = await mockDataService.createTask(taskData)
			const normalized = restAdapter.normalizeTask(created)
			
			return {
				success: true,
				data: normalized,
			}
		} catch (error) {
			return {
				success: false,
				data: null,
				error: restAdapter.normalizeError(error),
			}
		}
	},

	/**
	 * Update an existing task
	 * 
	 * @param {string} taskId - Task ID to update
	 * @param {object} updates - Fields to update { title, status, etc. }
	 * @returns {Promise<{ success: bool, data: Task | null, error?: object }>}
	 */
	async updateTask(taskId, updates) {
		try {
			if (!taskId) {
				return {
					success: false,
					data: null,
					error: {
						message: 'Task ID is required',
						code: 'VALIDATION_ERROR',
					},
				}
			}
			
			const updated = await mockDataService.updateTask(taskId, updates)
			const normalized = restAdapter.normalizeTask(updated)
			
			return {
				success: true,
				data: normalized,
			}
		} catch (error) {
			return {
				success: false,
				data: null,
				error: restAdapter.normalizeError(error),
			}
		}
	},

	/**
	 * Delete a task
	 * 
	 * @param {string} taskId - Task ID to delete
	 * @returns {Promise<{ success: bool, data: { id }, error?: object }>}
	 */
	async deleteTask(taskId) {
		try {
			if (!taskId) {
				return {
					success: false,
					data: null,
					error: {
						message: 'Task ID is required',
						code: 'VALIDATION_ERROR',
					},
				}
			}
			
			await mockDataService.deleteTask(taskId)
			
			return {
				success: true,
				data: { id: taskId },
			}
		} catch (error) {
			return {
				success: false,
				data: null,
				error: restAdapter.normalizeError(error),
			}
		}
	},
}
