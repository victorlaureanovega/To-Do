import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../components/common/PageHeader'
import { useData } from '../hooks/useData'
import SkeletonCard from '../components/common/SkeletonCard'
import EmptyState from '../components/common/EmptyState'
import { isFinishedTaskStatus } from '../utils/taskStatus'

export default function TaskDetailPage() {
  const { taskId } = useParams()
  const { developerTasks, tasksLoading, getTasks } = useData()
  const [task, setTask] = useState(null)

  useEffect(() => {
    getTasks()
  }, [getTasks])

  useEffect(() => {
    const foundTask = developerTasks.find((t) => t.id === taskId)
    setTask(foundTask)
  }, [developerTasks, taskId])

  if (tasksLoading) {
    return (
      <>
        <PageHeader
          title={`Task Detail: ${taskId}`}
          subtitle="Loading task details..."
        />
        <section className="panel-card">
          <SkeletonCard rows={4} />
        </section>
      </>
    )
  }

  if (!task) {
    return (
      <>
        <PageHeader
          title={`Task Detail: ${taskId}`}
          subtitle="Vista de detalle con historial, estado, duracion estimada y fechas clave."
        />
        <EmptyState
          title="Task not found"
          message={`Could not find task with ID: ${taskId}`}
        />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title={`Task Detail: ${task.id}`}
        subtitle="Vista de detalle con historial, estado, duracion estimada y fechas clave."
      />

      <section className="panel-card">
        <dl className="detail-grid">
          <div>
            <dt>Status</dt>
            <dd><span className={`status-badge ${task.status.toLowerCase().replace(/\s+/g, '-')}`}>{task.status}</span></dd>
          </div>
          <div>
            <dt>Estimated duration</dt>
            <dd>{task.estimatedDuration}</dd>
          </div>
          <div>
            <dt>Created at</dt>
            <dd>{task.createdAt}</dd>
          </div>
          <div>
            <dt>Finished at</dt>
            <dd>{isFinishedTaskStatus(task.status) ? task.finishedAt || 'Not recorded' : 'Not finished'}</dd>
          </div>
        </dl>
      </section>
    </>
  )
}
