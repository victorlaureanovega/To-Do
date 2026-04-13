/**
 * Consolidated Mock Data - Single Source of Truth
 * 
 * All mock data is centralized here for consistency and easy swap with real API data.
 * Each export represents a data domain (analytics, tasks, developers, users, teams).
 */

export const mockDevelopers = [
	{ id: 'dev-1', name: 'Daniel Torres' },
	{ id: 'dev-2', name: 'Camila Ruiz' },
	{ id: 'dev-3', name: 'Andres Mora' },
	{ id: 'dev-4', name: 'Lucia Herrera' },
]

export const mockAnalytics = {
	developers: mockDevelopers,
	tasksByDeveloper: [
		{
			developerId: 'dev-1',
			developer: 'Daniel Torres',
			registered: 36,
			completed: 24,
			reopened: 3,
			estimatedHours: 68,
			realHours: 75,
			bug: 10,
			feature: 15,
			research: 5,
			documentation: 6,
			reopenedByType: { bug: 1, feature: 1, research: 1, documentation: 0 },
		},
		{
			developerId: 'dev-2',
			developer: 'Camila Ruiz',
			registered: 30,
			completed: 20,
			reopened: 2,
			estimatedHours: 57,
			realHours: 63,
			bug: 8,
			feature: 12,
			research: 4,
			documentation: 6,
			reopenedByType: { bug: 1, feature: 1, research: 0, documentation: 0 },
		},
		{
			developerId: 'dev-3',
			developer: 'Andres Mora',
			registered: 27,
			completed: 18,
			reopened: 4,
			estimatedHours: 52,
			realHours: 60,
			bug: 9,
			feature: 10,
			research: 4,
			documentation: 4,
			reopenedByType: { bug: 1, feature: 2, research: 1, documentation: 0 },
		},
		{
			developerId: 'dev-4',
			developer: 'Lucia Herrera',
			registered: 22,
			completed: 15,
			reopened: 1,
			estimatedHours: 43,
			realHours: 46,
			bug: 6,
			feature: 9,
			research: 3,
			documentation: 4,
			reopenedByType: { bug: 0, feature: 1, research: 0, documentation: 0 },
		},
	],
	tasksByStatusByDeveloper: [
		{ developerId: 'dev-1', developer: 'Daniel Torres', todo: 9, inProgress: 3, completed: 24 },
		{ developerId: 'dev-2', developer: 'Camila Ruiz', todo: 8, inProgress: 2, completed: 20 },
		{ developerId: 'dev-3', developer: 'Andres Mora', todo: 7, inProgress: 2, completed: 18 },
		{ developerId: 'dev-4', developer: 'Lucia Herrera', todo: 5, inProgress: 2, completed: 15 },
	],
	tasksByDate: [
		{ date: 'Mar 01', registered: 7, completed: 4, reopened: 1 },
		{ date: 'Mar 02', registered: 9, completed: 6, reopened: 0 },
		{ date: 'Mar 03', registered: 6, completed: 5, reopened: 1 },
		{ date: 'Mar 04', registered: 11, completed: 7, reopened: 2 },
		{ date: 'Mar 05', registered: 8, completed: 6, reopened: 1 },
		{ date: 'Mar 06', registered: 10, completed: 8, reopened: 1 },
		{ date: 'Mar 07', registered: 7, completed: 5, reopened: 0 },
	],
}

export const mockDeveloperTasks = [
	{
		id: 'TASK-1001',
		title: 'Refactor authentication middleware',
		description: 'Revisit JWT validation logic and add refresh token support.',
		status: 'In Progress',
		estimatedDuration: '6h',
		createdAt: '2026-03-01',
	},
	{
		id: 'TASK-1002',
		title: 'Implement webhooks for Telegram events',
		description: 'Listen to /newtask, /complete and sync with task-service.',
		status: 'To Do',
		estimatedDuration: '4h 30m',
		createdAt: '2026-03-04',
	},
	{
		id: 'TASK-1003',
		title: 'Update API observability dashboard',
		description: 'Add Prometheus metrics for p95 latency.',
		status: 'Completed',
		estimatedDuration: '3h',
		createdAt: '2026-02-28',
	},
]

export const mockTeamTasks = [
	{
		id: 'TASK-1001',
		title: 'Refactor authentication middleware',
		status: 'In Progress',
		estimatedDuration: '6h',
		createdAt: '2026-03-01',
		assignee: 'Daniel Torres',
	},
	{
		id: 'TASK-1002',
		title: 'Implement webhooks for Telegram events',
		status: 'To Do',
		estimatedDuration: '4h 30m',
		createdAt: '2026-03-04',
		assignee: 'Daniel Torres',
	},
	{
		id: 'TASK-1004',
		title: 'Design database schema for notifications',
		status: 'Completed',
		estimatedDuration: '5h',
		createdAt: '2026-03-02',
		assignee: 'Camila Ruiz',
	},
	{
		id: 'TASK-1005',
		title: 'Write unit tests for prioritization engine',
		status: 'To Do',
		estimatedDuration: '3h',
		createdAt: '2026-03-05',
		assignee: 'Camila Ruiz',
	},
	{
		id: 'TASK-1006',
		title: 'Setup CI/CD pipeline for analytics-service',
		status: 'In Progress',
		estimatedDuration: '8h',
		createdAt: '2026-03-03',
		assignee: 'Andres Mora',
	},
]

export const mockUsers = []

export const mockTeams = []

// Status & filtering constants (extracted from pages; centralized for consistency)
export const STATUS_OPTIONS = [
	{ value: 'All', label: 'All statuses' },
	{ value: 'To Do', label: 'To Do' },
	{ value: 'In Progress', label: 'In Progress' },
	{ value: 'Completed', label: 'Completed' },
]

export const DEVELOPER_OPTIONS = [
	{ value: 'All', label: 'All developers' },
	...mockDevelopers.map((dev) => ({ value: dev.name, label: dev.name })),
]
