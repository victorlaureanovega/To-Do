export const mockAnalytics = {
	developers: [
		{ id: 'dev-1', name: 'Daniel Torres' },
		{ id: 'dev-2', name: 'Camila Ruiz' },
		{ id: 'dev-3', name: 'Andres Mora' },
		{ id: 'dev-4', name: 'Lucia Herrera' },
	],
	tasksByDeveloper: [
		{ developerId: 'dev-1', developer: 'Daniel Torres', registered: 36, completed: 24, reopened: 3, estimatedHours: 68, realHours: 75, bug: 10, feature: 15, research: 5, documentation: 6, reopenedByType: { bug: 1, feature: 1, research: 1, documentation: 0 } },
		{ developerId: 'dev-2', developer: 'Camila Ruiz', registered: 30, completed: 20, reopened: 2, estimatedHours: 57, realHours: 63, bug: 8, feature: 12, research: 4, documentation: 6, reopenedByType: { bug: 1, feature: 1, research: 0, documentation: 0 } },
		{ developerId: 'dev-3', developer: 'Andres Mora', registered: 27, completed: 18, reopened: 4, estimatedHours: 52, realHours: 60, bug: 9, feature: 10, research: 4, documentation: 4, reopenedByType: { bug: 1, feature: 2, research: 1, documentation: 0 } },
		{ developerId: 'dev-4', developer: 'Lucia Herrera', registered: 22, completed: 15, reopened: 1, estimatedHours: 43, realHours: 46, bug: 6, feature: 9, research: 3, documentation: 4, reopenedByType: { bug: 0, feature: 1, research: 0, documentation: 0 } },
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
