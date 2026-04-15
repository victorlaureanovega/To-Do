/**
 * TeamCompletionChart Component
 * 
 * Donut pie chart showing task completion ratio (completed vs pending).
 * Purely presentational - receives all data as props.
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

const PIE_COLORS = ['#c74634', '#d7dee8']

export default function TeamCompletionChart({ data, isLoading, error }) {
	if (error) {
		return (
			<SectionCard title="Team Completion Ratio">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Team Completion Ratio">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Team Completion Ratio">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<PieChart>
						<Pie
							data={data}
							cx="50%"
							cy="50%"
							innerRadius={70}
							outerRadius={105}
							dataKey="value"
							nameKey="name"
							label
						>
							{data.map((entry, index) => (
								<Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
