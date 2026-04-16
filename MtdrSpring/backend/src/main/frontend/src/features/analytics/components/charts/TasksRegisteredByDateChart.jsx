/**
 * TasksRegisteredByDateChart Component
 * 
 * Line chart showing tasks registered and completed over time.
 * Purely presentational - receives all data as props.
 */

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'
import { CHART_THEME, CHART_MESSAGE_STYLE, CHART_ERROR_STYLE } from '../../constants/chartTheme'

export default function TasksRegisteredByDateChart({ data, isLoading, error }) {
	if (error) {
		return (
			<SectionCard title="Tasks Registered by Date">
				<div style={CHART_ERROR_STYLE}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Tasks Registered by Date">
				<div style={CHART_MESSAGE_STYLE}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Tasks Registered by Date">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridStroke} />
						<XAxis dataKey="date" stroke={CHART_THEME.axisStroke} tick={{ fill: CHART_THEME.axisTick }} tickLine={{ stroke: CHART_THEME.axisStroke }} axisLine={{ stroke: CHART_THEME.axisStroke }} />
						<YAxis stroke={CHART_THEME.axisStroke} tick={{ fill: CHART_THEME.axisTick }} tickLine={{ stroke: CHART_THEME.axisStroke }} axisLine={{ stroke: CHART_THEME.axisStroke }} />
						<Tooltip contentStyle={CHART_THEME.tooltip.contentStyle} labelStyle={CHART_THEME.tooltip.labelStyle} itemStyle={CHART_THEME.tooltip.itemStyle} />
						<Legend wrapperStyle={{ color: CHART_THEME.legendText }} />
						<Line type="monotone" dataKey="registered" name="Registered" stroke={CHART_THEME.registeredVsFinished.registered} strokeWidth={2.5} />
						<Line type="monotone" dataKey="completed" name="Finished" stroke={CHART_THEME.registeredVsFinished.finished} strokeWidth={2.5} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
