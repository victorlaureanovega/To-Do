import clsx from 'clsx'

/**
 * KpiCard
 * Card de métricas KPI reutilizable para dashboards.
 * Props:
 *   label   – texto descriptivo
 *   value   – valor principal (string o number)
 *   icon    – componente Lucide
 *   trend   – objeto opcional { value: string, direction: 'up'|'down'|'neutral' }
 *   accent  – 'default' | 'success' | 'warning' | 'danger'
 */
export default function KpiCard({ label, value, icon: Icon, trend, accent = 'default' }) {
  return (
    <article className={clsx('kpi-card', `kpi-card--${accent}`)}>
      <div className="kpi-card__header">
        <p className="kpi-card__label">{label}</p>
        {Icon && (
          <span className="kpi-card__icon-wrap">
            <Icon size={20} />
          </span>
        )}
      </div>

      <div className="kpi-card__value">{value}</div>

      {trend && (
        <p className={clsx('kpi-card__trend', `kpi-card__trend--${trend.direction}`)}>
          {trend.direction === 'up' && '↑'}
          {trend.direction === 'down' && '↓'}
          {trend.direction === 'neutral' && '→'}
          {' '}
          {trend.value}
        </p>
      )}
    </article>
  )
}
