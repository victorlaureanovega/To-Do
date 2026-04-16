import { DEFAULT_TEAM_ID, resolveTeamId } from './teamScope'

const buildEndpoint = (apiBaseUrl, path) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path)

const isDeveloperUser = (user) => {
	const role = String(user?.role ?? '').toLowerCase()
	return !role || role === 'developer'
}

const isTeamMatch = (user, teamId) => {
	const userTeamId = resolveTeamId(user?.teamId ?? user?.teamID ?? user?.team?.teamId ?? user?.team?.id)
	return userTeamId === resolveTeamId(teamId)
}

export async function fetchTeamDevelopers(apiBaseUrl, teamId = DEFAULT_TEAM_ID) {
	const resolvedTeamId = resolveTeamId(teamId)
	const endpoints = [
		buildEndpoint(apiBaseUrl, `/api/teams/${resolvedTeamId}/users`),
		buildEndpoint(apiBaseUrl, `/api/users?teamId=${resolvedTeamId}`),
		buildEndpoint(apiBaseUrl, '/api/users'),
	]

	for (const endpoint of endpoints) {
		try {
			const response = await fetch(endpoint, {
				method: 'GET',
				headers: { Accept: 'application/json' },
			})

			if (!response.ok) {
				continue
			}

			const users = await response.json()
			if (!Array.isArray(users)) {
				continue
			}

			const scopedUsers = users.filter(isDeveloperUser).filter((user) => isTeamMatch(user, resolvedTeamId))

			if (scopedUsers.length > 0) {
				return scopedUsers
			}

			if (endpoint.endsWith('/api/users')) {
				return users.filter(isDeveloperUser)
			}
		} catch {
			// Try the next fallback endpoint.
		}
	}

	return []
}