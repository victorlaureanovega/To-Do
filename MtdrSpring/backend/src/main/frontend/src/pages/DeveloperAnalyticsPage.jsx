import React from 'react'
import { useMemo } from 'react'
import AnalyticsPage from './AnalyticsPage'
import { useAuth } from '../hooks/useAuth'

const resolveUserId = (user) => {
  const rawId = user?.userId ?? user?.id ?? user?.username
  const normalized = String(rawId ?? '').trim()
  return normalized || null
}

export default function DeveloperAnalyticsPage() {
  const { user } = useAuth()

  const developerId = useMemo(() => resolveUserId(user), [user])

  return <AnalyticsPage lockedDeveloperId={developerId} />
}
