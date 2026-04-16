import { User } from 'lucide-react'

export default function Topbar() {
  return (
    <header className="app-topbar">
      <div>
        <p className="topbar-title">Task Flow</p>
        <p className="topbar-subtitle">Welcome back, Ken Bauer.</p>
      </div>

      <div className="topbar-actions">
        <span className="role-badge">Manager</span>
        <button type="button" className="topbar-profile-btn" aria-label="Profile">
          <User size={18} />
          <span>Profile</span>
        </button>
      </div>
    </header>
  )
}
