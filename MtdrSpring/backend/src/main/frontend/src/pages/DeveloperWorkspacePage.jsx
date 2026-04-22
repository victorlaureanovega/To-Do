import { Sparkles } from 'lucide-react'
import PageHeader from '../components/common/PageHeader'
import SectionCard from '../components/common/SectionCard'
import EmptyState from '../components/common/EmptyState'
import DeveloperTasksBoard from '../features/developer/components/DeveloperTasksBoard'

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
    subtitle: 'Placeholder for future AI-based prioritization logic.',
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
      {selectedView === 'ai' && (
        <SectionCard title="AI prioritization" subtitle="Placeholder for the upcoming backend-driven view." noPad>
          <EmptyState
            icon={Sparkles}
            title="AI prioritization is coming soon"
            message="This tab is reserved for the future prioritization engine and backend integration."
          />
        </SectionCard>
      )}
    </section>
  )
}
