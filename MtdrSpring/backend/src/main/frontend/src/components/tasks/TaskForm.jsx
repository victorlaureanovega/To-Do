import { useState } from 'react'

/**
 * TaskForm
 * Formulario para crear/editar una tarea.
 * Props:
 *   initial   – valores iniciales del formulario (para edición)
 *   onSubmit  – función (formData) => void
 *   onCancel  – función
 */
const EMPTY_FORM = {
  title: '',
  description: '',
  estimatedDuration: '',
}

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.estimatedDuration.trim()) next.estimatedDuration = 'Estimated duration is required'
    return next
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(form)
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="tf-title" className="form-label">Title / Body *</label>
        <input
          id="tf-title"
          type="text"
          className="form-input"
          placeholder="e.g. Refactor authentication middleware"
          value={form.title}
          onChange={handleChange('title')}
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="tf-desc" className="form-label">Description</label>
        <textarea
          id="tf-desc"
          className="form-input form-textarea"
          placeholder="Optional description with context and acceptance criteria"
          value={form.description}
          onChange={handleChange('description')}
          rows={4}
        />
      </div>

      <div className="form-field">
        <label htmlFor="tf-duration" className="form-label">Estimated Duration *</label>
        <input
          id="tf-duration"
          type="text"
          className="form-input"
          placeholder="e.g. 3h 30m"
          value={form.estimatedDuration}
          onChange={handleChange('estimatedDuration')}
        />
        {errors.estimatedDuration && <span className="form-error">{errors.estimatedDuration}</span>}
      </div>

      <div className="form-footer">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">
          {initial ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  )
}
