import { useState, useEffect } from 'react'
import { ListChecks } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import FilterBar from '../components/common/FilterBar'
import EmptyState from '../components/common/EmptyState'
import TaskTable from '../components/tasks/TaskTable'
import SkeletonCard from '../components/common/SkeletonCard'
import { useData } from '../hooks/useData'
import { useFilter } from '../hooks/useFilter'
import { STATUS_OPTIONS } from '../data'


export default function DeveloperTasksPage() {
  const {
    developerTasks,
    tasksLoading,
    tasksError,
    fetchDeveloperTasksFromBackend,
  } = useData()
  const [statusFilter, setStatusFilter] = useState('All')
  const [developerId, setDeveloperId] = useState('1')

  useEffect(() => {
    fetchDeveloperTasksFromBackend(developerId)
  }, [developerId, fetchDeveloperTasksFromBackend])

  const filtered = useFilter(developerTasks, 'status', statusFilter)

  const handleLoad = () => {
    fetchDeveloperTasksFromBackend(developerId)
  }

  return (
    <>
      <PageHeader
        title="My Tasks"
        subtitle="Datos cargados desde backend usando el endpoint /api/tasks/by-developer/{id}."
        actions={(
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              min="1"
              className="form-input"
              style={{ width: '120px' }}
              value={developerId}
              onChange={(event) => setDeveloperId(event.target.value)}
              placeholder="Developer ID"
            />
            <button className="btn btn-primary" type="button" onClick={handleLoad}>
              Load from backend
            </button>
          </div>
        )}
      />

      <SectionCard
        title="Task list"
        actions={
          <FilterBar
            filters={[{ id: 'status', label: 'Status', options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter }]}
          />
        }
        noPad
      >
        {tasksError && (
          <div style={{ padding: '1rem', color: '#b00020' }}>
            Error loading backend tasks: {tasksError.message}
          </div>
        )}

        {tasksLoading ? (
          <div style={{ padding: '1rem' }}><SkeletonCard rows={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks found"
            message={`No hay tareas para developerId=${developerId} o no coinciden con el filtro.`}
          />
        ) : (
          <TaskTable
            tasks={filtered}
            readOnly
          />
        )}
      </SectionCard>
    </>
  )
}
