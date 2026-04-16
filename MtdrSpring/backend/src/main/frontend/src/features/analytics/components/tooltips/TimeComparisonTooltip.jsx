/**
 * TimeComparisonTooltip Component
 * 
 * Custom tooltip for the time comparison chart.
 * Shows estimated and real hours in a clean format.
 */

import { CHART_THEME } from '../../constants/chartTheme'

export function TimeComparisonTooltip({ active, payload, label }) {
	if (!active || !payload?.length) {
		return null
	}

	const row = payload[0]?.payload ?? {}

	return (
		<div
			className="recharts-default-tooltip"
			style={{
				margin: 0,
				padding: '10px',
				background: CHART_THEME.tooltip.background,
				border: `1px solid ${CHART_THEME.tooltip.border}`,
				borderRadius: '8px',
				color: CHART_THEME.tooltip.text,
			}}
		>
			<p className="recharts-tooltip-label" style={{ margin: 0, fontWeight: 700, color: CHART_THEME.tooltip.text }}>
				{label}
			</p>
			<p className="recharts-tooltip-item" style={{ margin: '4px 0 0', color: CHART_THEME.timeComparison.estimated }}>
				Estimated hours: {row.estimatedHours}
			</p>
			<p className="recharts-tooltip-item" style={{ margin: '4px 0 0', color: CHART_THEME.timeComparison.real }}>
				Real hours: {row.realHours}
			</p>
		</div>
	)
}
