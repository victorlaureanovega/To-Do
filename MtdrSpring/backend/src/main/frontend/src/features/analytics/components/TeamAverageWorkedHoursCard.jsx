import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

export default function TeamAverageWorkedHoursCard() {
  const [backendTeamId, setBackendTeamId] = useState('1')
  const {
    teamAverageWorkedHours,
    teamAverageWorkedHoursLoading,
    teamAverageWorkedHoursError,
    fetchTeamAverageWorkedHoursFromBackend,
  } = useData()

  useEffect(() => {
    fetchTeamAverageWorkedHoursFromBackend(backendTeamId)
  }, [backendTeamId, fetchTeamAverageWorkedHoursFromBackend])

  const handleLoadTeamHours = () => {
    fetchTeamAverageWorkedHoursFromBackend(backendTeamId)
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
        <button className="btn btn-primary" type="button" onClick={handleLoadTeamHours}>
          Load team hours
        </button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <KpiCard
          label="Average worked hours by team"
          value={teamAverageWorkedHoursLoading ? 'Loading...' : `${(teamAverageWorkedHours?.averageWorkedHours ?? 0).toFixed(2)}h`}
          icon={Clock3}
          accent="warning"
          trend={{
            value: teamAverageWorkedHoursError
              ? `Error: ${teamAverageWorkedHoursError.message}`
              : `Team ID ${teamAverageWorkedHours?.teamId ?? backendTeamId}`,
            direction: teamAverageWorkedHoursError ? 'down' : 'neutral',
          }}
        />
      </div>
    </section>
  )
}