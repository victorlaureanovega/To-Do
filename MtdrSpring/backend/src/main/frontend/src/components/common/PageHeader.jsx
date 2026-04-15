export default function PageHeader({ title, subtitle, actions }) {
  return (
    <section className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="page-header-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  )
}
