/**
 * StatusTooltip Component
 * 
 * Custom tooltip for the status comparison chart.
 * Shows task counts by status (To Do, In Progress, Completed).
 */

export function StatusTooltip({ active, payload, label }) {
	if (!active || !payload?.length) {
		return null
	}

	const row = payload[0]?.payload ?? {}

	return (
		<div className="recharts-default-tooltip" style={{ margin: 0, padding: '10px', background: '#fff', border: '1px solid #d9e0e8', borderRadius: '8px' }}>
			<p className="recharts-tooltip-label" style={{ margin: 0, fontWeight: 600 }}>
				{label}
			</p>
			<p className="recharts-tooltip-item" style={{ margin: '4px 0 0' }}>
				To Do: {row.todo}
			</p>
			<p className="recharts-tooltip-item" style={{ margin: '4px 0 0' }}>
				In Progress: {row.inProgress}
			</p>
			<p className="recharts-tooltip-item" style={{ margin: '4px 0 0' }}>
				Completed: {row.completed}
			</p>
		</div>
	)
}
