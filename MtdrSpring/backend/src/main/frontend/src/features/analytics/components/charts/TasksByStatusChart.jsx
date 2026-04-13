/**
 * TasksByStatusChart Component
 * 
 * Stacked bar chart showing task status distribution per developer.
 * Purely presentational - receives all data and handlers as props.
 */

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

const TASK_STATUS_COLORS = {
	todo: '#334155',
	inProgress: '#b45309',
	completed: '#276749',
}

export default function TasksByStatusChart({ data, isLoading, error, renderTooltip }) {
	if (error) {
		return (
			<SectionCard title="Tasks by Status by Developer">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Tasks by Status by Developer">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Tasks by Status by Developer">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="developer" />
						<YAxis />
						<Tooltip content={renderTooltip} />
						<Legend />
						<Bar dataKey="todo" stackId="status" fill={TASK_STATUS_COLORS.todo} name="To Do" />
						<Bar dataKey="inProgress" stackId="status" fill={TASK_STATUS_COLORS.inProgress} name="In Progress" />
						<Bar dataKey="completed" stackId="status" fill={TASK_STATUS_COLORS.completed} name="Completed" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
