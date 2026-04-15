import { useEffect, useState } from 'react'
import { Hourglass } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'
import { useData } from '../../../hooks/useData'

export default function DeveloperAverageHoursCard() {
  const [backendDeveloperId, setBackendDeveloperId] = useState('1')
  const {
    developerHours,
    developerHoursLoading,
    developerHoursError,
    fetchDeveloperAverageHoursFromBackend,
  } = useData()

  useEffect(() => {
    fetchDeveloperAverageHoursFromBackend(backendDeveloperId)
  }, [backendDeveloperId, fetchDeveloperAverageHoursFromBackend])

  const handleLoadDeveloperHours = () => {
    fetchDeveloperAverageHoursFromBackend(backendDeveloperId)
  }

  return (
    <section>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.8rem' }}>
        <input
          type="number"
          min="1"
          className="form-input"
          style={{ width: '120px' }}
          value={backendDeveloperId}
          onChange={(event) => setBackendDeveloperId(event.target.value)}
          placeholder="Developer ID"
        />
        <button className="btn btn-primary" type="button" onClick={handleLoadDeveloperHours}>
          Load hours
        </button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
        <KpiCard
          label="Average worked hours by developer"
          value={developerHoursLoading ? 'Loading...' : `${(developerHours?.averageWorkedHours ?? 0).toFixed(2)}h`}
          icon={Hourglass}
          accent="warning"
          trend={{
            value: developerHoursError
              ? `Error: ${developerHoursError.message}`
              : `${developerHours?.taskCount ?? 0} tasks • ${(developerHours?.totalWorkedHours ?? 0).toFixed(1)}h worked • ${(developerHours?.totalEstimatedHours ?? 0).toFixed(1)}h estimated`,
            direction: developerHoursError ? 'down' : 'neutral',
          }}
        />
      </div>
    </section>
  )
}