import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>The page you requested was not found.</p>
      <Link to="/analytics" className="btn btn-primary">Back to analytics</Link>
    </div>
  )
}
