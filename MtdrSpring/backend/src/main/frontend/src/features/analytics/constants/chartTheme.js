export const CHART_THEME = {
  gridStroke: 'var(--grid-stroke)',
  axisStroke: 'var(--chart-axis-stroke)',
  axisTick: 'var(--chart-axis-tick)',
  legendText: 'var(--chart-legend-text)',
  pieLabel: 'var(--chart-pie-label)',
  status: {
    todo: 'var(--chart-status-todo)',
    inProgress: 'var(--chart-status-in-progress)',
    completed: 'var(--chart-status-completed)',
  },
  timeComparison: {
    estimated: 'var(--chart-time-estimated)',
    real: 'var(--chart-time-real)',
  },
  teamCompletion: ['var(--chart-team-completed)', 'var(--chart-team-pending)'],
  taskType: [
    'var(--task-type-bug)',
    'var(--task-type-feature)',
    'var(--task-type-research)',
    'var(--task-type-documentation)',
  ],
  registeredVsFinished: {
    registered: 'var(--chart-registered)',
    finished: 'var(--chart-finished)',
  },
  tooltip: {
    background: 'var(--chart-tooltip-bg)',
    border: 'var(--chart-tooltip-border)',
    text: 'var(--chart-tooltip-text)',
    contentStyle: {
      background: 'var(--chart-tooltip-bg)',
      border: '1px solid var(--chart-tooltip-border)',
      borderRadius: '8px',
      color: 'var(--chart-tooltip-text)',
    },
    labelStyle: {
      color: 'var(--chart-tooltip-text)',
      fontWeight: 700,
    },
    itemStyle: {
      color: 'var(--chart-tooltip-text)',
    },
  },
  errorText: 'var(--error)',
}

export const CHART_MESSAGE_STYLE = {
  padding: '20px',
}

export const CHART_ERROR_STYLE = {
  ...CHART_MESSAGE_STYLE,
  color: 'var(--error)',
}
