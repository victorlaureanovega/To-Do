import { useEffect } from 'react'
import { Clock3 } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

export default function TeamAverageWorkedHoursCard() {
  const {
    teamAverageWorkedHours,
    teamAverageWorkedHoursLoading,
    teamAverageWorkedHoursError,
    fetchTeamAverageWorkedHoursFromBackend,
  } = useData()

  useEffect(() => {
    fetchTeamAverageWorkedHoursFromBackend()
  }, [fetchTeamAverageWorkedHoursFromBackend])

  const value = teamAverageWorkedHoursError
    ? 'Error'
    : teamAverageWorkedHoursLoading
      ? 'Loading...'
      : `${(teamAverageWorkedHours?.averageWorkedHours ?? 0).toFixed(2)}h`

  return (
    <KpiCard
      label="Average hours worked by team member"
      value={value}
      icon={Clock3}
      accent="warning"
    />
  )
}