/**
 * REST API Adapter
 * 
 * Normalizes API responses to a consistent internal data shape.
 * This layer decouples the UI from the API contract.
 * 
 * When the API changes response structure, only this file needs updating.
 */

/**
 * Standardized API Response format all service methods follow:
 * {
 *   success: boolean,
 *   data: any,
 *   error?: { message: string, code: string }
 * }
 */

export const restAdapter = {
	/**
	 * Normalizes a generic API response to internal format
	 * 
	 * @param {any} apiResponse - Raw API response
	 * @returns {object} - Normalized { success, data, error }
	 */
	normalizeResponse(apiResponse) {
		if (!apiResponse) {
			return {
				success: false,
				data: null,
				error: { message: 'No response', code: 'NO_RESPONSE' },
			}
		}

		// If response already follows our format, return as-is
		if ('success' in apiResponse && 'data' in apiResponse) {
			return apiResponse
		}

		// Otherwise, assume success if we got here
		return {
			success: true,
			data: apiResponse,
		}
	},

	/**
	 * Maps task API response to internal Task shape
	 */
	normalizeTask(apiTask) {
		return {
			id: apiTask.id,
			title: apiTask.title,
			description: apiTask.description || '',
			status: apiTask.status || 'To Do',
			estimatedDuration: apiTask.estimatedDuration || '',
			createdAt: apiTask.createdAt || new Date().toISOString().split('T')[0],
			assignee: apiTask.assignee || null,
		}
	},

	/**
	 * Maps task array API response to internal shape
	 */
	normalizeTasks(apiTasks) {
		return Array.isArray(apiTasks) ? apiTasks.map(this.normalizeTask) : []
	},

	/**
	 * Maps analytics API response to internal shape
	 */
	normalizeAnalytics(apiAnalytics) {
		return {
			developers: apiAnalytics.developers || [],
			tasksByDeveloper: apiAnalytics.tasksByDeveloper || [],
			tasksByStatusByDeveloper: apiAnalytics.tasksByStatusByDeveloper || [],
			tasksByDate: apiAnalytics.tasksByDate || [],
		}
	},

	/**
	 * Maps error response to internal error shape
	 */
	normalizeError(error) {
		if (error instanceof Error) {
			return {
				message: error.message,
				code: error.code || 'UNKNOWN_ERROR',
			}
		}

		if (typeof error === 'object' && error !== null) {
			return {
				message: error.message || 'An error occurred',
				code: error.code || 'UNKNOWN_ERROR',
			}
		}

		return {
			message: String(error),
			code: 'UNKNOWN_ERROR',
		}
	},
}
