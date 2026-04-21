import { createContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../../services/api/authService'
import { normalizeRole } from '../../utils/authRoutes'

export const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'taskflow.auth.user'
const LEGACY_AUTH_STORAGE_KEY = 'pms.mock.auth'

const getDisplayName = (user) => {
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  return user?.name || fullName || user?.username || 'User'
}

const normalizeUser = (user) => {
  if (!user) {
    return null
  }

  return {
    ...user,
    role: normalizeRole(user?.role),
    name: getDisplayName(user),
    id: String(user?.id ?? user?.userId ?? user?.username ?? ''),
  }
}

const getStoredUser = () => {
  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    ?? window.localStorage.getItem(LEGACY_AUTH_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return normalizeUser(JSON.parse(stored))
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setUser(storedUser)
    }
  }, [])

  const login = async ({ username, password }) => {
    const authenticatedUser = normalizeUser(await authService.login({ username, password }))

    setUser(authenticatedUser)
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authenticatedUser))
    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)

    return authenticatedUser
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY)
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      role: user?.role ?? null,
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
