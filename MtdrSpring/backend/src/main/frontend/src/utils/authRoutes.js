const ROLE_HOME_PATHS = {
  DEVELOPER: '/developer/tasks',
  MANAGER: '/manager/tasks',
}

export const normalizeRole = (role) => {
  const normalized = String(role ?? '').trim().toUpperCase()
  if (normalized === 'DEVELOPER' || normalized === 'MANAGER') {
    return normalized
  }

  return null
}

export const getRoleHomePath = (role) => ROLE_HOME_PATHS[normalizeRole(role)] ?? ROLE_HOME_PATHS.DEVELOPER

export const getRoleLabel = (role) => {
  const normalized = normalizeRole(role)
  if (normalized === 'MANAGER') {
    return 'Manager'
  }

  return 'Developer'
}
