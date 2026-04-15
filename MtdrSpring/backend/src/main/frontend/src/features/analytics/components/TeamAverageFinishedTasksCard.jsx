import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

export default function TeamAverageFinishedTasksCard() {
  const [backendTeamId, setBackendTeamId] = useState('1')
  const {
    teamAverageFinishedTasks,
    teamAverageFinishedTasksLoading,
    teamAverageFinishedTasksError,
    fetchTeamAverageFinishedTasksFromBackend,
  } = useData()

  useEffect(() => {
    fetchTeamAverageFinishedTasksFromBackend(backendTeamId)
  }, [backendTeamId, fetchTeamAverageFinishedTasksFromBackend])

  const handleLoadTeamAverage = () => {
    fetchTeamAverageFinishedTasksFromBackend(backendTeamId)
  }

  return (
    <section>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem' }}>
        <input
          type="number"
          min="1"
          className="form-input"
          style={{ width: '120px' }}
          value={backendTeamId}
          onChange={(event) => setBackendTeamId(event.target.value)}
          placeholder="Team ID"
        />
        <button className="btn btn-primary" type="button" onClick={handleLoadTeamAverage}>
          Load team avg
        </button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <KpiCard
          label="Average finished tasks by team"
          value={teamAverageFinishedTasksLoading ? 'Loading...' : `${(teamAverageFinishedTasks?.averageFinishedTasks ?? 0).toFixed(2)}`}
          icon={Users}
          accent="default"
          trend={{
            value: teamAverageFinishedTasksError
              ? `Error: ${teamAverageFinishedTasksError.message}`
              : `Team ID ${teamAverageFinishedTasks?.teamId ?? backendTeamId}`,
            direction: teamAverageFinishedTasksError ? 'down' : 'neutral',
          }}
        />
      </div>
    </section>
  )
}