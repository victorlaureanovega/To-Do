const STATUS_CANONICAL = {
  pending: 'pending',
  ongoing: 'ongoing',
  finished: 'finished',
  unknown: 'unknown',
}

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase()

export const getCanonicalTaskStatus = (value) => {
  const normalized = normalizeStatus(value)

  if (!normalized) {
    return STATUS_CANONICAL.unknown
  }

  if (
    normalized === 'pendiente'
    || normalized === 'pending'
    || normalized === 'todo'
    || normalized === 'to do'
    || normalized === 'to-do'
  ) {
    return STATUS_CANONICAL.pending
  }

  if (
    normalized === 'en curso'
    || normalized === 'ongoing'
    || normalized === 'in progress'
    || normalized === 'in-progress'
    || normalized === 'progreso'
    || normalized === 'progress'
    || normalized === 'curso'
  ) {
    return STATUS_CANONICAL.ongoing
  }

  if (
    normalized === 'finalizada'
    || normalized === 'finished'
    || normalized === 'completed'
    || normalized === 'complete'
    || normalized === 'done'
  ) {
    return STATUS_CANONICAL.finished
  }

  return STATUS_CANONICAL.unknown
}

export const toEnglishTaskStatus = (value) => {
  const canonical = getCanonicalTaskStatus(value)

  if (canonical === STATUS_CANONICAL.pending) {
    return 'Pending'
  }

  if (canonical === STATUS_CANONICAL.ongoing) {
    return 'Ongoing'
  }

  if (canonical === STATUS_CANONICAL.finished) {
    return 'Finished'
  }

  return String(value ?? 'Unknown').trim() || 'Unknown'
}

export const toBackendTaskStatus = (value) => {
  const canonical = getCanonicalTaskStatus(value)

  if (canonical === STATUS_CANONICAL.pending) {
    return 'Pendiente'
  }

  if (canonical === STATUS_CANONICAL.ongoing) {
    return 'En curso'
  }

  if (canonical === STATUS_CANONICAL.finished) {
    return 'Finalizada'
  }

  return null
}

export const isFinishedTaskStatus = (value) => getCanonicalTaskStatus(value) === STATUS_CANONICAL.finished
export const isPendingOrOngoingTaskStatus = (value) => {
  const canonical = getCanonicalTaskStatus(value)
  return canonical === STATUS_CANONICAL.pending || canonical === STATUS_CANONICAL.ongoing
}
