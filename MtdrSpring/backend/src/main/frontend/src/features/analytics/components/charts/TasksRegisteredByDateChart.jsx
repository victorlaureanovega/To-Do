/**
 * TasksRegisteredByDateChart Component
 * 
 * Line chart showing tasks registered and completed over time.
 * Purely presentational - receives all data as props.
 */

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import SectionCard from '../../../../components/common/SectionCard'

export default function TasksRegisteredByDateChart({ data, isLoading, error }) {
	if (error) {
		return (
			<SectionCard title="Tasks Registered by Date">
				<div style={{ padding: '20px', color: '#dc2626' }}>Error loading chart: {error.message}</div>
			</SectionCard>
		)
	}

	if (isLoading) {
		return (
			<SectionCard title="Tasks Registered by Date">
				<div style={{ padding: '20px' }}>Loading...</div>
			</SectionCard>
		)
	}

	return (
		<SectionCard title="Tasks Registered by Date">
			<div className="chart-box">
				<ResponsiveContainer width="100%" height={290}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis dataKey="date" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line type="monotone" dataKey="registered" name="Registered" stroke="#2f4158" strokeWidth={2.5} />
						<Line type="monotone" dataKey="completed" name="Finished" stroke="#c74634" strokeWidth={2.5} />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</SectionCard>
	)
}
