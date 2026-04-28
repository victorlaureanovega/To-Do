import { useState } from 'react'

/**
 * FilterBar
 * Barra de filtros enterprise con selects, rango de fechas y slots de búsqueda.
 * Props:
 *   filters  – array de { id, label, options: [{value, label}], value, onChange }
 *   dateRange – opcional { start, end }
 *   onDateRangeChange – callback opcional ({ start, end })
 *   actions  – ReactNode opcional (botón derecho de la barra)
 */
export default function FilterBar({ filters = [], dateRange: controlledDateRange, onDateRangeChange, actions }) {
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const resolvedDateRange = controlledDateRange ?? dateRange

  const updateDateRange = (nextDateRange) => {
    if (!controlledDateRange) {
      setDateRange(nextDateRange)
    }

    onDateRangeChange?.(nextDateRange)
  }

  return (
    <div className="filter-bar">
      <div className="filter-bar__controls">
        {filters.map(({ id, label, options, value, onChange }) => (
          <label key={id} className="filter-bar__item">
            <span className="filter-bar__label">{label}</span>
            <select
              className="filter-bar__select"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <div className="filter-bar__date-group">
          <label className="filter-bar__item">
            <span className="filter-bar__label">Date</span>
            <div className="filter-bar__date-fields">
              <input
                type="date"
                className="filter-bar__input"
                value={resolvedDateRange.start}
                onChange={(e) => updateDateRange({ ...resolvedDateRange, start: e.target.value })}
                aria-label="Start date"
              />
              <span className="filter-bar__date-separator">to</span>
              <input
                type="date"
                className="filter-bar__input"
                value={resolvedDateRange.end}
                onChange={(e) => updateDateRange({ ...resolvedDateRange, end: e.target.value })}
                aria-label="End date"
              />
            </div>
          </label>
        </div>
      </div>

      {actions && <div className="filter-bar__actions">{actions}</div>}
    </div>
  )
}
