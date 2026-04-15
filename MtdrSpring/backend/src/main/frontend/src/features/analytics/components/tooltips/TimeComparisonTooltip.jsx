/**
 * TimeComparisonTooltip Component
 * 
 * Custom tooltip for the time comparison chart.
 * Shows estimated and real hours in a clean format.
 */

export function TimeComparisonTooltip({ active, payload, label }) {
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
				Estimated hours: {row.estimatedHours}
			</p>
			<p className="recharts-tooltip-item" style={{ margin: '4px 0 0' }}>
				Real hours: {row.realHours}
			</p>
		</div>
	)
}
