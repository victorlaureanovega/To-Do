import React from 'react'

/**
 * SectionCard
 * Contenedor con header, título y slot de acciones.
 * Props:
 *   title   – string
 *   actions – ReactNode opcional (botones, filtros)
 *   children
 *   noPad   – boolean, desactiva padding interior
 */
export default function SectionCard({ title, subtitle, actions, children, noPad = false }) {
  return (
    <section className="section-card">
      {(title || actions) && (
        <div className="section-card__header">
          <div>
            {title && <h2 className="section-card__title">{title}</h2>}
            {subtitle && <p className="section-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="section-card__actions">{actions}</div>}
        </div>
      )}
      <div className={noPad ? undefined : 'section-card__body'}>
        {children}
      </div>
    </section>
  )
}
