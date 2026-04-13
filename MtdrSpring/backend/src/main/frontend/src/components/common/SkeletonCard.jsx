/**
 * SkeletonCard
 * Placeholder de carga para cards y listas.
 * Props:
 *   rows    – número de filas skeleton (default: 3)
 *   height  – altura en px de cada fila (default: 20)
 */
export default function SkeletonCard({ rows = 3, height = 20 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-line--title" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-line"
          style={{ height, width: i % 2 === 0 ? '90%' : '65%' }}
        />
      ))}
    </div>
  )
}

/**
 * SkeletonKpi
 * Placeholder de carga específico para KPI cards.
 */
export function SkeletonKpi() {
  return (
    <div className="skeleton-kpi">
      <div className="skeleton-line" style={{ width: '55%', height: 14 }} />
      <div className="skeleton-line" style={{ width: '40%', height: 36, marginTop: '0.5rem' }} />
    </div>
  )
}
