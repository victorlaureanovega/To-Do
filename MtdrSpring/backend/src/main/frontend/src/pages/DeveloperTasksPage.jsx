import PageHeader from '../components/common/PageHeader'
import DeveloperTasksBoard from '../features/developer/components/DeveloperTasksBoard'

export default function DeveloperTasksPage() {
  return (
    <>
      <PageHeader
        title="My Team's Tasks"
        subtitle="Find out what your team members are up to."
      />

      <DeveloperTasksBoard />
    </>
  )
}
