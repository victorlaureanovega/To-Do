/**
 * TeamCompletionChart Component
 * 
 * Donut pie chart showing task completion ratio (completed vs pending).
 * Purely presentational - receives all data as props.
 */

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'
import { CHART_THEME, CHART_MESSAGE_STYLE, CHART_ERROR_STYLE } from '../../constants/chartTheme'

export default function TeamCompletionChart({ data, isLoading, error }) {
	if (error) {
		return (
			<SectionCard title="Team Completion Ratio">
				<div style={CHART_ERROR_STYLE}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Team Completion Ratio">
				<div style={CHART_MESSAGE_STYLE}>Loading...</div>
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
							label={{ fill: CHART_THEME.pieLabel }}
						>
							{data.map((entry, index) => (
								<Cell key={entry.name} fill={CHART_THEME.teamCompletion[index % CHART_THEME.teamCompletion.length]} />
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
