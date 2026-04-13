/**
 * Analytics Aggregation Service
 * 
 * Pure utility functions for calculating analytics metrics.
 * These functions don't depend on React or the component hierarchy.
 * They can be tested independently and reused anywhere in the app.
 * 
 * These calculations remain consistent when swapping mock data for real API data.
 */

/**
 * Calculate completion rate percentage
 * @param {number} completed - Number of completed tasks
 * @param {number} registered - Total number of tasks
 * @returns {number} - Percentage (0-100)
 */
export function calculateCompletionRate(completed, registered) {
	if (registered === 0) return 0
	return (completed / registered) * 100
}

/**
 * Calculate average time per completed task
 * @param {number} totalHours - Total hours spent
 * @param {number} completedCount - Number of completed tasks
 * @returns {number} - Hours per task
 */
export function calculateAverageCompletionTime(totalHours, completedCount) {
	if (completedCount === 0) return 0
	return totalHours / completedCount
}

/**
 * Calculate reopened percentage by type
 * @param {number} reopenedCount - Number of reopened items of a type
 * @param {number} totalCount - Total count of that type
 * @returns {number} - Percentage (0-100)
 */
export function calculateReopenedPercentage(reopenedCount, totalCount) {
	if (totalCount === 0) return 0
	return (reopenedCount / totalCount) * 100
}

/**
 * Aggregate task metrics across multiple developers
 * @param {array} tasks - Array of task objects with properties like registered, completed, etc.
 * @returns {object} - Aggregated totals
 */
export function aggregateTasks(tasks = []) {
	return tasks.reduce(
		(acc, item) => {
			acc.registered += item.registered || 0
			acc.completed += item.completed || 0
			acc.reopened += item.reopened || 0
			acc.estimatedHours += item.estimatedHours || 0
			acc.realHours += item.realHours || 0
			return acc
		},
		{ registered: 0, completed: 0, reopened: 0, estimatedHours: 0, realHours: 0 },
	)
}

/**
 * Aggregate task types across multiple developers
 * @param {array} tasks - Array of task objects with properties like bug, feature, research, documentation
 * @returns {object} - Task type totals
 */
export function aggregateTaskTypes(tasks = []) {
	return tasks.reduce(
		(acc, item) => {
			acc.bug += item.bug || 0
			acc.feature += item.feature || 0
			acc.research += item.research || 0
			acc.documentation += item.documentation || 0
			return acc
		},
		{ bug: 0, feature: 0, research: 0, documentation: 0 },
	)
}

/**
 * Aggregate task status across multiple developers
 * @param {array} tasks - Array of task objects with properties like todo, inProgress, completed
 * @returns {object} - Status totals
 */
export function aggregateTaskStatus(tasks = []) {
	return tasks.reduce(
		(acc, item) => {
			acc.todo += item.todo || 0
			acc.inProgress += item.inProgress || 0
			acc.completed += item.completed || 0
			return acc
		},
		{ todo: 0, inProgress: 0, completed: 0 },
	)
}

/**
 * Aggregate reopened tasks by type
 * @param {array} tasks - Array of task objects with reopenedByType property
 * @returns {object} - Reopened count by type
 */
export function aggregateReopenedByType(tasks = []) {
	return tasks.reduce(
		(acc, item) => {
			const reopened = item.reopenedByType || {}
			acc.bug += reopened.bug || 0
			acc.feature += reopened.feature || 0
			acc.research += reopened.research || 0
			acc.documentation += reopened.documentation || 0
			return acc
		},
		{ bug: 0, feature: 0, research: 0, documentation: 0 },
	)
}

/**
 * Transform task time data for stacked bar chart
 * @param {array} tasks - Array with estimatedHours and realHours
 * @returns {array} - Transformed data suitable for recharts stacked bar
 */
export function transformTimeComparisonData(tasks = []) {
	return tasks.map((item) => {
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
}

/**
 * Calculate percentage breakdown of a total
 * @param {object} counts - Object with counts for each category { bug: 10, feature: 20, ... }
 * @returns {object} - Percentages for each category
 */
export function calculatePercentageBreakdown(counts = {}) {
	const total = Object.values(counts).reduce((sum, val) => sum + (val || 0), 0)

	if (total === 0) {
		return Object.keys(counts).reduce((acc, key) => {
			acc[key] = 0
			return acc
		}, {})
	}

	return Object.entries(counts).reduce((acc, [key, val]) => {
		acc[key] = ((val || 0) / total) * 100
		return acc
	}, {})
}
