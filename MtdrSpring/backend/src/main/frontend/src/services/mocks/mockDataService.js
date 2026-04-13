/**
 * Mock Data Service
 * 
 * Supplies mock data to the application. When integrating with a real API,
 * this can be swapped with actual API calls without changing any consumer code.
 * 
 * Pattern: All methods return Promises to mimic async API behavior.
 */

import {
	mockAnalytics,
	mockDeveloperTasks,
	mockTeamTasks,
	mockDevelopers,
	mockUsers,
	mockTeams,
} from '../../data'

const DELAY = 300 // Simulate network latency

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const mockDataService = {
	// Analytics queries
	async fetchAnalyticsDashboard(filters = {}) {
		await delay(DELAY)
		
		let filteredData = { ...mockAnalytics }
		
		// Apply developer filter if provided
		if (filters.developerId && filters.developerId !== 'all') {
			filteredData.tasksByDeveloper = filteredData.tasksByDeveloper.filter(
				(item) => item.developerId === filters.developerId
			)
			filteredData.tasksByStatusByDeveloper = filteredData.tasksByStatusByDeveloper.filter(
				(item) => item.developerId === filters.developerId
			)
		}
		
		return filteredData
	},

	// Task CRUD operations for Developer
	async fetchDeveloperTasks() {
		await delay(DELAY)
		return [...mockDeveloperTasks]
	},

	async createTask(taskData) {
		await delay(DELAY)
		
		const newTask = {
			id: `TASK-${Date.now()}`,
			...taskData,
			createdAt: new Date().toISOString().split('T')[0],
		}
		
		// Simulate success
		return newTask
	},

	async updateTask(taskId, updatedData) {
		await delay(DELAY)
		
		const task = { ...mockDeveloperTasks.find((t) => t.id === taskId), ...updatedData }
		
		if (!task) {
			throw new Error(`Task ${taskId} not found`)
		}
		
		return task
	},

	async deleteTask(taskId) {
		await delay(DELAY)
		
		const exists = mockDeveloperTasks.some((t) => t.id === taskId)
		if (!exists) {
			throw new Error(`Task ${taskId} not found`)
		}
		
		return { success: true, id: taskId }
	},

	// Team tasks (read-only view)
	async fetchTeamTasks() {
		await delay(DELAY)
		return [...mockTeamTasks]
	},

	// Developers list
	async fetchDevelopers() {
		await delay(DELAY)
		return [...mockDevelopers]
	},

	// Users list
	async fetchUsers() {
		await delay(DELAY)
		return [...mockUsers]
	},

	// Teams list
	async fetchTeams() {
		await delay(DELAY)
		return [...mockTeams]
	},
}
