/**
 * Analytics Service
 * 
 * Handles analytics queries: dashboard metrics, aggregations, etc.
 * Currently uses mock data; swap mockDataService for real API fetch() calls.
 */

import { mockDataService } from '../mocks/mockDataService'
import { restAdapter } from './restAdapter'

export const analyticsService = {
	/**
	 * Fetch dashboard metrics (KPIs, aggregations, charts data)
	 * 
	 * @param {object} filters - Optional filters { developerId, dateRange, etc. }
	 * @returns {Promise<{ success: bool, data: analytics, error?: object }>}
	 */
	async fetchDashboardMetrics(filters = {}) {
		try {
			const data = await mockDataService.fetchAnalyticsDashboard(filters)
			const normalized = restAdapter.normalizeAnalytics(data)
			
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
	 * Fetch aggregated task completion metrics
	 * 
	 * @param {object} filters - Optional filters
	 * @returns {Promise<{ success: bool, data: object, error?: object }>}
	 */
	async fetchCompletionMetrics(filters = {}) {
		try {
			const data = await mockDataService.fetchAnalyticsDashboard(filters)
			
			// Calculate aggregations (to be moved to aggregationService)
			const totals = data.tasksByDeveloper.reduce(
				(acc, item) => {
					acc.registered += item.registered
					acc.completed += item.completed
					acc.reopened += item.reopened
					acc.estimatedHours += item.estimatedHours
					acc.realHours += item.realHours
					return acc
				},
				{ registered: 0, completed: 0, reopened: 0, estimatedHours: 0, realHours: 0 }
			)
			
			const result = {
				registered: totals.registered,
				completed: totals.completed,
				reopened: totals.reopened,
				completionRate: totals.registered > 0 ? (totals.completed / totals.registered) * 100 : 0,
				averageCompletionTime: totals.completed > 0 ? totals.realHours / totals.completed : 0,
			}
			
			return {
				success: true,
				data: result,
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
	 * Fetch task type distribution metrics
	 * 
	 * @param {object} filters - Optional filters
	 * @returns {Promise<{ success: bool, data: object, error?: object }>}
	 */
	async fetchTaskTypeMetrics(filters = {}) {
		try {
			const data = await mockDataService.fetchAnalyticsDashboard(filters)
			
			const totals = data.tasksByDeveloper.reduce(
				(acc, item) => {
					acc.bug += item.bug
					acc.feature += item.feature
					acc.research += item.research
					acc.documentation += item.documentation
					return acc
				},
				{ bug: 0, feature: 0, research: 0, documentation: 0 }
			)
			
			return {
				success: true,
				data: totals,
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
