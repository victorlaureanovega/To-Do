import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

const buildEndpoint = (apiBaseUrl, path) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path)

export default function TeamAverageFinishedTasksCard({ selectedDeveloperId = null }) {
  const {
    teamAverageFinishedTasks,
    teamAverageFinishedTasksLoading,
    teamAverageFinishedTasksError,
    fetchTeamAverageFinishedTasksFromBackend,
  } = useData()

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const [developerValue, setDeveloperValue] = useState(0)
  const [developerLoading, setDeveloperLoading] = useState(false)
  const [developerError, setDeveloperError] = useState(null)

  useEffect(() => {
    if (selectedDeveloperId) {
      return
    }

    fetchTeamAverageFinishedTasksFromBackend()
  }, [fetchTeamAverageFinishedTasksFromBackend, selectedDeveloperId])

  useEffect(() => {
    let isCancelled = false

    const fetchDeveloperAverageFinishedTasks = async () => {
      if (!selectedDeveloperId) {
        return
      }

      setDeveloperLoading(true)
      setDeveloperError(null)

      try {
        const endpoint = buildEndpoint(apiBaseUrl, `/api/tasks/average-by-dev/${selectedDeveloperId}`)
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Backend responded ${response.status} ${response.statusText}`)
        }

        const rawAverage = await response.json()

        if (!isCancelled) {
          setDeveloperValue(Number(rawAverage ?? 0))
        }
      } catch (error) {
        if (!isCancelled) {
          setDeveloperError(error)
          setDeveloperValue(0)
        }
      } finally {
        if (!isCancelled) {
          setDeveloperLoading(false)
        }
      }
    }

    fetchDeveloperAverageFinishedTasks()

    return () => {
      isCancelled = true
    }
  }, [apiBaseUrl, selectedDeveloperId])

  const value = selectedDeveloperId
    ? (developerError
        ? 'Error'
        : developerLoading
          ? 'Loading...'
          : `${Number(developerValue ?? 0).toFixed(2)}`)
    : (teamAverageFinishedTasksError
        ? 'Error'
        : teamAverageFinishedTasksLoading
          ? 'Loading...'
          : `${(teamAverageFinishedTasks?.averageFinishedTasks ?? 0).toFixed(2)}`)

  return (
    <KpiCard
      label={selectedDeveloperId ? 'Average finished tasks' : 'Average finished tasks of team members'}
      value={value}
      icon={Users}
      accent="default"
    />
  )
}