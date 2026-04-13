/**
 * TimeComparisonChart Component
 * 
 * Stacked bar chart comparing estimated vs real hours per developer.
 * Uses custom tooltip to show original values.
 * Purely presentational - receives all data and handlers as props.
 */

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

export default function TimeComparisonChart({ data, isLoading, error, renderTooltip }) {
	if (error) {
		return (
			<SectionCard title="Estimated vs Real Time by Developer">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Estimated vs Real Time by Developer">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Estimated vs Real Time by Developer">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="developer" />
						<YAxis />
						<Tooltip content={renderTooltip} />
						<Legend />
						<Bar dataKey="estimatedLower" stackId="time" fill="#2f4158" name="Estimated (h)" />
						<Bar dataKey="realLower" stackId="time" fill="#c74634" name="Real (h)" />
						<Bar dataKey="estimatedUpper" stackId="time" fill="#2f4158" legendType="none" radius={[4, 4, 0, 0]} />
						<Bar dataKey="realUpper" stackId="time" fill="#c74634" legendType="none" radius={[4, 4, 0, 0]} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
