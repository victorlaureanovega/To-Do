import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

const buildEndpoint = (apiBaseUrl, path) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path)

export default function TeamAverageWorkedHoursCard({ selectedDeveloperId = null }) {
  const {
    teamAverageWorkedHours,
    teamAverageWorkedHoursLoading,
    teamAverageWorkedHoursError,
    fetchTeamAverageWorkedHoursFromBackend,
  } = useData()

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
  const [developerValue, setDeveloperValue] = useState(0)
  const [developerLoading, setDeveloperLoading] = useState(false)
  const [developerError, setDeveloperError] = useState(null)

  useEffect(() => {
    if (selectedDeveloperId) {
      return
    }

    fetchTeamAverageWorkedHoursFromBackend()
  }, [fetchTeamAverageWorkedHoursFromBackend, selectedDeveloperId])

  useEffect(() => {
    let isCancelled = false

    const fetchDeveloperAverageWorkedHours = async () => {
      if (!selectedDeveloperId) {
        return
      }

      setDeveloperLoading(true)
      setDeveloperError(null)

      try {
        const endpoint = buildEndpoint(apiBaseUrl, `/api/tasks/hours/average-by-dev/${selectedDeveloperId}`)
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

    fetchDeveloperAverageWorkedHours()

    return () => {
      isCancelled = true
    }
  }, [apiBaseUrl, selectedDeveloperId])

  const value = selectedDeveloperId
    ? (developerError
        ? 'Error'
        : developerLoading
          ? 'Loading...'
          : `${Number(developerValue ?? 0).toFixed(2)}h`)
    : (teamAverageWorkedHoursError
        ? 'Error'
        : teamAverageWorkedHoursLoading
          ? 'Loading...'
          : `${(teamAverageWorkedHours?.averageWorkedHours ?? 0).toFixed(2)}h`)

  return (
    <KpiCard
      label={selectedDeveloperId ? 'Average hours worked' : 'Average hours worked by team member'}
      value={value}
      icon={Clock3}
      accent="warning"
    />
  )
}