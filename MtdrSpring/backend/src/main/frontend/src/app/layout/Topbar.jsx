import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function Topbar() {
  const { user, role, logout } = useAuth()

  return (
    <header className="app-topbar">
      <div>
        <p className="topbar-title">Project Management System</p>
        <p className="topbar-subtitle">Microservices-ready frontend mock</p>
      </div>

      <div className="topbar-actions">
        <span className="role-badge">{role}</span>
        <span className="user-name">{user?.name}</span>
        <button type="button" className="btn btn-ghost" onClick={logout}>
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </header>
  )
}
