import { useEffect, useState } from 'react'
import { Hourglass } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'
import { fetchTeamDevelopers } from '../../../utils/teamApi'

export default function DeveloperAverageHoursCard({ selectedDeveloperId = 'all' }) {
  const { teamId } = useData()
  const [hoursByDeveloper, setHoursByDeveloper] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

  useEffect(() => {
    let isCancelled = false

    const fetchHoursByDeveloper = async () => {
      setLoading(true)
      setError(null)

      try {
        const developers = await fetchTeamDevelopers(apiBaseUrl, teamId)

        const scopedDevelopers =
          selectedDeveloperId === 'all'
            ? developers
            : developers.filter((developer) => String(developer?.userId ?? '') === String(selectedDeveloperId))

        const settled = await Promise.allSettled(
          scopedDevelopers.map(async (developer) => {
            const developerId = developer?.userId
            const hoursEndpoint = apiBaseUrl
              ? `${apiBaseUrl}/api/tasks/hours/by-developer/${developerId}`
              : `/api/tasks/hours/by-developer/${developerId}`
            const tasksEndpoint = apiBaseUrl
              ? `${apiBaseUrl}/api/tasks/by-developer/${developerId}`
              : `/api/tasks/by-developer/${developerId}`

            const [hoursResponse, tasksResponse] = await Promise.all([
              fetch(hoursEndpoint, {
                method: 'GET',
                headers: { Accept: 'application/json' },
              }),
              fetch(tasksEndpoint, {
                method: 'GET',
                headers: { Accept: 'application/json' },
              }),
            ])

            if (!hoursResponse.ok || !tasksResponse.ok) {
              throw new Error(`Backend responded ${hoursResponse.status}/${tasksResponse.status}`)
            }

            const hoursData = await hoursResponse.json()
            const tasksData = await tasksResponse.json()

            const taskCount = Array.isArray(tasksData) ? tasksData.length : 0
            const totalWorkedHours = Number(hoursData?.totalWorkedHours ?? 0)
            const averageWorkedHours = taskCount > 0 ? totalWorkedHours / taskCount : 0

            const fullName = `${developer?.firstName ?? ''} ${developer?.lastName ?? ''}`.trim()
            const developerName = fullName || developer?.username || `Developer ${developerId ?? ''}`

            return {
              developerId,
              developerName,
              averageWorkedHours,
            }
          }),
        )

        const rows = settled
          .filter((result) => result.status === 'fulfilled')
          .map((result) => result.value)
          .sort((a, b) => a.developerName.localeCompare(b.developerName))

        if (!isCancelled) {
          setHoursByDeveloper(rows)
        }
      } catch (fetchError) {
        if (!isCancelled) {
          setError(fetchError)
          setHoursByDeveloper([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchHoursByDeveloper()

    return () => {
      isCancelled = true
    }
  }, [apiBaseUrl, teamId, selectedDeveloperId])

  const valueContent = loading
    ? 'Loading...'
    : error
      ? 'Error'
      : (
        <div className="kpi-card__value-list">
          {hoursByDeveloper.map((row) => (
            <div key={row.developerId ?? row.developerName} className="kpi-card__value-item">
              <strong>{row.developerName}</strong>
              <span>{row.averageWorkedHours.toFixed(2)}h</span>
            </div>
          ))}
          {hoursByDeveloper.length === 0 && <span>No data</span>}
        </div>
      )

  return (
    <KpiCard
      label="Average worked hours by developer"
      value={valueContent}
      valueClassName={loading || error ? undefined : 'kpi-card__value--compact'}
      icon={Hourglass}
      accent="warning"
      trend={error ? { value: `Error: ${error.message}`, direction: 'down' } : undefined}
    />
  )
}