/**
 * TaskTypeDistributionChart Component
 * 
 * Pie chart showing distribution of tasks by type (bug, feature, research, documentation).
 * Purely presentational - receives all data as props.
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

const TASK_TYPE_PIE_COLORS = ['#dc2626', '#2563eb', '#7c3aed', '#0f766e']

export default function TaskTypeDistributionChart({ data, isLoading, error }) {
	if (error) {
		return (
			<SectionCard title="Task Type Distribution">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Task Type Distribution">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Task Type Distribution">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={62}
							outerRadius={104}
							dataKey="value"
							nameKey="name"
							label
						>
							{data.map((entry, index) => (
								<Cell key={entry.name} fill={TASK_TYPE_PIE_COLORS[index % TASK_TYPE_PIE_COLORS.length]} />
							))}
						</Pie>
						<Tooltip />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
