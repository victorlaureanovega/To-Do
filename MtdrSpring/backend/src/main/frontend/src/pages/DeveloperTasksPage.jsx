import { useState, useEffect } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import FilterBar from '../components/common/FilterBar'
import Modal from '../components/common/Modal'
import EmptyState from '../components/common/EmptyState'
import TaskTable from '../components/tasks/TaskTable'
import TaskForm from '../components/tasks/TaskForm'
import SkeletonCard from '../components/common/SkeletonCard'
import { useData } from '../hooks/useData'
import { useModal } from '../hooks/useModal'
import { useFilter } from '../hooks/useFilter'
import { STATUS_OPTIONS } from '../data'


export default function DeveloperTasksPage() {
  const { developerTasks, tasksLoading, createTask, updateTask, deleteTask, getTasks } = useData()
  const { isOpen: modalOpen, data: editingTask, open: openModal, close: closeModal } = useModal()
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    getTasks()
  }, [getTasks])

  const filtered = useFilter(developerTasks, 'status', statusFilter)

  const handleCreate = async (formData) => {
    const newTask = {
      ...formData,
      status: 'To Do'
    }
    await createTask(newTask)
    closeModal()
  }

  const handleEdit = (task) => {
    openModal(task)
  }

  const handleSaveEdit = async (formData) => {
    await updateTask(editingTask.id, formData)
    closeModal()
  }

  const handleDelete = async (taskId) => {
    await deleteTask(taskId)
  }

  const handleComplete = async (taskId) => {
    const task = developerTasks.find((t) => t.id === taskId)
    if (task) {
      await updateTask(taskId, { ...task, status: 'Completed' })
    }
  }

  const openCreate = () => {
    openModal(null)
  }

  return (
    <>
      <PageHeader
        title="My Tasks"
        subtitle="Gestiona tus tareas: crea, edita, completa o elimina. Conectado en Parte 3 con task-service mock."
        actions={
          <button className="btn btn-primary" type="button" onClick={openCreate}>
            <Plus size={16} /> New task
          </button>
        }
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
        {tasksLoading ? (
          <div style={{ padding: '1rem' }}><SkeletonCard rows={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks found"
            message="Crea tu primera tarea o cambia el filtro de estado."
            action={<button className="btn btn-primary" type="button" onClick={openCreate}><Plus size={15} /> New task</button>}
          />
        ) : (
          <TaskTable
            tasks={filtered}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
        )}
      </SectionCard>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit task' : 'New task'}
        size="md"
      >
        <TaskForm
          initial={editingTask ? { title: editingTask.title, description: editingTask.description, estimatedDuration: editingTask.estimatedDuration } : undefined}
          onSubmit={editingTask ? handleSaveEdit : handleCreate}
          onCancel={closeModal}
        />
      </Modal>
    </>
  )
}
