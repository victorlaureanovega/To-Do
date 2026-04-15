import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useForm } from '../hooks/useForm'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (formData) => {
      login(formData)
      navigate('/analytics', { replace: true })
    }
  )

  return (
    <div className="auth-page">
      <section className="auth-card">
        <p className="auth-eyebrow">Enterprise Access</p>
        <h1>Project Management Portal</h1>
        <p className="auth-description">
          Frontend mock preparado para integrarse luego con auth-service y arquitectura de microservicios.
          Puedes iniciar con cualquier correo por ahora.
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="email" className="form-label">Correo corporativo</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="tu.nombre@empresa.com"
            value={values.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password" className="form-label">Contrasena</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-input"
            placeholder="Ingresa tu contrasena"
            value={values.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary">Sign in</button>
        </form>
      </section>
    </div>
  )
}
