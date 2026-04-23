const normalizeRole = (role) => {
	const normalized = String(role ?? '').trim().toUpperCase()
	if (normalized === 'MANAGER' || normalized === 'DEVELOPER') {
		return normalized
	}

	return null
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const buildEndpoint = (path) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path)

const getDisplayName = (user) => {
	const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
	return fullName || user?.name || user?.username || `Developer ${user?.userId ?? ''}`
}

async function login({ username, password }) {
	const normalizedUsername = String(username ?? '').trim()

	if (!normalizedUsername) {
		throw new Error('Username is required')
	}

	const endpoint = buildEndpoint(`/api/users/get-by-username/${encodeURIComponent(normalizedUsername)}`)
	const response = await fetch(endpoint, {
		method: 'GET',
		headers: { Accept: 'application/json' },
	})

	if (response.status === 404) {
		throw new Error('User not found')
	}

	if (!response.ok) {
		throw new Error(`Backend responded ${response.status} ${response.statusText}`)
	}

	const backendUser = await response.json()
	const normalizedRole = normalizeRole(backendUser?.role) ?? 'DEVELOPER'

	return {
		...backendUser,
		id: String(backendUser?.userId ?? backendUser?.id ?? backendUser?.username ?? normalizedUsername),
		name: getDisplayName(backendUser),
		role: normalizedRole,
		passwordLength: String(password ?? '').length,
	}
}

export const authService = {
	login,
}
