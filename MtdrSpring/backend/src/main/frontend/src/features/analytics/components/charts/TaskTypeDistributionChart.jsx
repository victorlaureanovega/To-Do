/**
 * TaskTypeDistributionChart Component
 * 
 * Pie chart showing distribution of tasks by type (bug, feature, research, documentation).
 * Purely presentational - receives all data as props.
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'
import { CHART_THEME, CHART_MESSAGE_STYLE, CHART_ERROR_STYLE } from '../../constants/chartTheme'

export default function TaskTypeDistributionChart({ data, isLoading, error }) {
	if (error) {
		return (
			<SectionCard title="Task Type Distribution">
				<div style={CHART_ERROR_STYLE}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Task Type Distribution">
				<div style={CHART_MESSAGE_STYLE}>Loading...</div>
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
							label={{ fill: CHART_THEME.pieLabel }}
						>
							{data.map((entry, index) => (
								<Cell key={entry.name} fill={CHART_THEME.taskType[index % CHART_THEME.taskType.length]} />
							))}
						</Pie>
						<Tooltip contentStyle={CHART_THEME.tooltip.contentStyle} labelStyle={CHART_THEME.tooltip.labelStyle} itemStyle={CHART_THEME.tooltip.itemStyle} />
						<Legend wrapperStyle={{ color: CHART_THEME.legendText }} />
					</PieChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
