/**
 * KpiSection Component
 * 
 * Composite wrapper that renders a grid of KPI cards.
 * Receives pre-calculated metrics and renders them.
 */

import { Timer, ClipboardList, CheckCircle2, RotateCcw } from 'lucide-react'
import KpiCard from '../../../components/common/KpiCard'

export default function KpiSection({
	averageCompletionTime,
	completionRate,
	completionVsRegistered,
	completionRateLoading,
	completionRateError,
	statusTotals,
	reopenedTaskRate,
	reopenedTaskRateLoading,
	reopenedTaskRateError,
}) {
	return (
		<div className="kpi-grid kpi-grid--4">
			<KpiCard
				label="Average task completion time"
				value={`${averageCompletionTime.toFixed(1)}h`}
				icon={Timer}
				accent="warning"
			/>
			<KpiCard
				label="Total number of tasks, by status"
				value={
					<div className="kpi-card__value-list">
						<div className="kpi-card__value-item kpi-card__value-item--todo">
							<strong>To Do</strong>
							<span>{statusTotals.todo}</span>
						</div>
						<div className="kpi-card__value-item kpi-card__value-item--in-progress">
							<strong>In Progress</strong>
							<span>{statusTotals.inProgress}</span>
						</div>
						<div className="kpi-card__value-item kpi-card__value-item--completed">
							<strong>Completed</strong>
							<span>{statusTotals.completed}</span>
						</div>
					</div>
				}
				icon={ClipboardList}
				trend={{
					value: `${statusTotals.todo + statusTotals.inProgress + statusTotals.completed} total tasks`,
					direction: 'neutral',
				}}
			/>
			<KpiCard
				label="Task completion rate"
				value={completionRateLoading ? 'Loading...' : completionRateError ? 'N/A' : completionRate}
				icon={CheckCircle2}
				accent="success"
				trend={{
					value: completionRateError?.message ?? `${completionVsRegistered} completed vs total`,
					direction: completionRateError ? 'neutral' : 'up',
				}}
			/>
			<KpiCard
				label="Reopened Task Rate"
				value={
					reopenedTaskRateLoading
						? 'Loading...'
						: reopenedTaskRateError
							? 'N/A'
							: `${Number(reopenedTaskRate ?? 0).toFixed(1)}%`
				}
				icon={RotateCcw}
				accent="danger"
				trend={{
					value: reopenedTaskRateError?.message ?? 'Team-wide rework rate',
					direction: 'neutral',
				}}
			/>
		</div>
	)
}
