import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'
import { getRoleHomePath } from '../utils/authRoutes'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, role } = useAuth()

  const {
    values,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useForm(
    { username: '', password: '' },
    async (formData) => {
      const authenticatedUser = await login(formData)
      navigate(getRoleHomePath(authenticatedUser?.role ?? role), { replace: true })
    }
  )

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">Enterprise Access</p>
        <h1>Project Management Portal</h1>
        <p className="auth-description">
          Sign in with your username and password.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            className="form-input"
            placeholder="Username"
            autoComplete="username"
            value={values.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            placeholder="Password"
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            required
          />

          {submitError ? <p className="form-error auth-form-error">{submitError}</p> : null}

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  )
}
