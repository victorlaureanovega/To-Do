import { useState, useEffect, useMemo } from 'react'
import { Users } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import FilterBar from '../components/common/FilterBar'
import EmptyState from '../components/common/EmptyState'
import TaskTable from '../components/tasks/TaskTable'
import { useData } from '../hooks/useData'
import { useFilter } from '../hooks/useFilter'
import { STATUS_OPTIONS } from '../data'


export default function ManagerOverviewPage() {
  const [developerFilter, setDeveloperFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const { teamTasks, getTeamTasks } = useData()

  useEffect(() => {
    getTeamTasks()
  }, [getTeamTasks])

  const developerOptions = [
    { value: 'All', label: 'All developers' },
    ...new Set(teamTasks.map(t => t.assignee)).size > 0
      ? Array.from(new Set(teamTasks.map(t => t.assignee))).map(dev => ({ value: dev, label: dev }))
      : []
  ]

  const byDeveloper = useFilter(teamTasks, 'assignee', developerFilter)
  const filtered = useFilter(byDeveloper, 'status', statusFilter)
  const groupedByDeveloper = useMemo(() => {
    return filtered.reduce((accumulator, task) => {
      const assignee = task?.assignee || 'Unassigned'
      if (!accumulator[assignee]) {
        accumulator[assignee] = []
      }

      accumulator[assignee].push(task)
      return accumulator
    }, {})
  }, [filtered])

  const sortedDeveloperNames = useMemo(
    () => Object.keys(groupedByDeveloper).sort((a, b) => a.localeCompare(b)),
    [groupedByDeveloper],
  )

  return (
    <>
      <PageHeader
        title="Team Overview"
        subtitle="Vista de tareas del equipo. Solo lectura: no expone acciones de edicion ni creacion."
      />

      <SectionCard
        title="Team tasks"
        actions={
          <FilterBar
            filters={[
              { id: 'dev', label: 'Developer', options: developerOptions, value: developerFilter, onChange: setDeveloperFilter },
              { id: 'status', label: 'Status', options: STATUS_OPTIONS, value: statusFilter, onChange: setStatusFilter },
            ]}
          />
        }
        noPad
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No tasks match your filters"
            message="Ajusta los filtros de developer o estado para ver resultados."
          />
        ) : (
          <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
            {sortedDeveloperNames.map((developerName) => (
              <SectionCard
                key={developerName}
                title={developerName}
                subtitle={`${groupedByDeveloper[developerName].length} tasks`}
                noPad
              >
                <TaskTable tasks={groupedByDeveloper[developerName]} readOnly />
              </SectionCard>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  )
}
