import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Users } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import FilterBar from '../components/common/FilterBar'
import EmptyState from '../components/common/EmptyState'
import TaskTable from '../components/tasks/TaskTable'
import { useData } from '../hooks/useData'
import { STATUS_OPTIONS } from '../data'
import { getCanonicalTaskStatus } from '../utils/taskStatus'


export default function ManagerOverviewPage() {
  const [developerFilter, setDeveloperFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const { teamTasks, teamTasksError, getTeamTasks } = useData()

  useEffect(() => {
    getTeamTasks({
      developerId: developerFilter,
      status: statusFilter,
      startDate: dateRange.start,
      endDate: dateRange.end,
    })
  }, [getTeamTasks, developerFilter, statusFilter, dateRange])

  const developerOptions = useMemo(() => {
    const uniqueDevelopers = new Map()

    teamTasks.forEach((task) => {
      const assigneeName = String(task?.assignee ?? '').trim() || 'Unassigned'
      const assigneeId = String(task?.assigneeId ?? assigneeName).trim()

      if (assigneeId && !uniqueDevelopers.has(assigneeId)) {
        uniqueDevelopers.set(assigneeId, assigneeName)
      }
    })

    return [
      { value: 'All', label: 'All developers' },
      ...Array.from(uniqueDevelopers.entries()).map(([value, label]) => ({ value, label })),
    ]
  }, [teamTasks])

  const filteredTeamTasks = useMemo(() => {
    return teamTasks.filter((task) => {
      const taskDeveloperValue = String(task?.assigneeId ?? task?.assignee ?? '').trim()
      if (developerFilter !== 'All' && taskDeveloperValue !== String(developerFilter)) {
        return false
      }

      if (
        statusFilter !== 'All'
        && getCanonicalTaskStatus(task?.status) !== getCanonicalTaskStatus(statusFilter)
      ) {
        return false
      }

      const createdAt = String(task?.createdAt ?? '').trim()
      if (!createdAt) {
        return !dateRange.start && !dateRange.end
      }

      const createdDate = new Date(`${createdAt}T00:00:00`)
      if (Number.isNaN(createdDate.getTime())) {
        return false
      }

      if (dateRange.start) {
        const startDate = new Date(`${dateRange.start}T00:00:00`)
        if (!Number.isNaN(startDate.getTime()) && createdDate < startDate) {
          return false
        }
      }

      if (dateRange.end) {
        const endDate = new Date(`${dateRange.end}T23:59:59`)
        if (!Number.isNaN(endDate.getTime()) && createdDate > endDate) {
          return false
        }
      }

      return true
    })
  }, [teamTasks, developerFilter, statusFilter, dateRange])

  const groupedByDeveloper = useMemo(() => {
    return filteredTeamTasks.reduce((accumulator, task) => {
      const assignee = task?.assignee || 'Unassigned'
      if (!accumulator[assignee]) {
        accumulator[assignee] = []
      }

      accumulator[assignee].push(task)
      return accumulator
    }, {})
  }, [filteredTeamTasks])

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
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        }
        noPad
      >
        {teamTasksError ? (
          <EmptyState
            icon={Users}
            title="Unable to load team tasks"
            message={teamTasksError.message ?? 'The manager team endpoint returned an error.'}
          />
        ) : filteredTeamTasks.length === 0 ? (
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
