const normalizeRole = (role) => {
	const normalized = String(role ?? '').trim().toUpperCase()
	if (normalized === 'MANAGER' || normalized === 'DEVELOPER') {
		return normalized
	}

	return null
}

const HARD_CODED_USERS = {
	admin: {
		id: 'admin',
		username: 'admin',
		name: 'Admin',
		role: 'MANAGER',
	},
	developer: {
		id: 'developer',
		username: 'developer',
		name: 'Developer',
		role: 'DEVELOPER',
	},
}

async function login({ username, password }) {
	const normalizedUsername = String(username ?? '').trim()

	if (!normalizedUsername) {
		throw new Error('Username is required')
	}

	const profile = HARD_CODED_USERS[normalizedUsername.toLowerCase()]
	if (!profile) {
		throw new Error('Invalid username')
	}

	return {
		...profile,
		role: normalizeRole(profile.role),
		passwordLength: String(password ?? '').length,
	}
}

export const authService = {
	login,
}
