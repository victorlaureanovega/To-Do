import { useEffect } from 'react'
import { Users } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

export default function TeamAverageFinishedTasksCard() {
  const {
    teamAverageFinishedTasks,
    teamAverageFinishedTasksLoading,
    teamAverageFinishedTasksError,
    fetchTeamAverageFinishedTasksFromBackend,
  } = useData()

  useEffect(() => {
    fetchTeamAverageFinishedTasksFromBackend()
  }, [fetchTeamAverageFinishedTasksFromBackend])

  const value = teamAverageFinishedTasksError
    ? 'Error'
    : teamAverageFinishedTasksLoading
      ? 'Loading...'
      : `${(teamAverageFinishedTasks?.averageFinishedTasks ?? 0).toFixed(2)}`

  return (
    <KpiCard
      label="Average finished tasks of team members"
      value={value}
      icon={Users}
      accent="default"
    />
  )
}