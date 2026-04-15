import { createContext, useEffect, useMemo, useState } from 'react'

export const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'pms.mock.auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) {
      return
    }

    try {
      setUser(JSON.parse(stored))
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }, [])

  const login = ({ email, password }) => {
    const normalizedEmail = (email ?? '').trim().toLowerCase()
    const localPart = normalizedEmail.split('@')[0] ?? 'user'

    // Mock login: accepts any email/password for now.
    const role = normalizedEmail.includes('manager') ? 'Manager' : 'Developer'
    const displayName = localPart
      .split(/[._-]/g)
      .filter(Boolean)
      .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
      .join(' ')

    const selectedUser = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      name: displayName || 'User',
      email: normalizedEmail,
      role,
      passwordLength: String(password ?? '').length,
    }

    setUser(selectedUser)
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(selectedUser))
  }

  const logout = () => {
    setUser(null)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
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
