import { User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getRoleLabel } from '../../utils/authRoutes'

export default function Topbar() {
  const { user, role } = useAuth()
  const displayName = user?.name ?? user?.username ?? 'User'

  return (
    <header className="app-topbar">
      <div>
        <p className="topbar-title">Task Flow</p>
        <p className="topbar-subtitle">Welcome back, {displayName}.</p>
      </div>

      <div className="topbar-actions">
        <span className="role-badge">{getRoleLabel(role)}</span>
        <button
          type="button"
          className="topbar-profile-btn"
          aria-label={`Profile for ${displayName}`}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
      </div>
    </header>
  )
}
