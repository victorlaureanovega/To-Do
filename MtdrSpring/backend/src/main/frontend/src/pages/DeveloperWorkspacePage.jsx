import PageHeader from '../components/common/PageHeader'
import DeveloperTasksBoard from '../features/developer/components/DeveloperTasksBoard'
import DeveloperAiPrioritization from '../features/developer/components/DeveloperAiPrioritization'

const WORKSPACE_CONTENT = {
  tasks: {
    title: 'My tasks',
    subtitle: 'What are we up to today?',
  },
  dashboard: {
    title: 'My Dashboard',
    subtitle: 'Find out how you have been doing.',
  },
  ai: {
    title: 'Developer Workspace: AI Prioritization',
    subtitle: 'Use AI to prioritize your in-progress tasks.',
  },
}

export default function DeveloperWorkspacePage({ view = 'tasks' }) {
  const selectedView = WORKSPACE_CONTENT[view] ? view : 'tasks'
  const { title, subtitle } = WORKSPACE_CONTENT[selectedView]

  return (
    <section className="developer-workspace">
      <PageHeader title={title} subtitle={subtitle} />

      {selectedView === 'tasks' && <DeveloperTasksBoard />}
      {selectedView === 'dashboard' && <DeveloperTasksBoard />}
      {selectedView === 'ai' && <DeveloperAiPrioritization />}
    </section>
  )
}
