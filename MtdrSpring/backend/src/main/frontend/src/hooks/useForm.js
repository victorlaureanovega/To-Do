/**
 * useForm Hook
 * 
 * Reusable form state management for any form.
 * Handles: initial values, field changes, validation, reset.
 * 
 * Usage:
 *   const form = useForm(
 *     { title: '', status: 'To Do' },
 *     (values) => submitForm(values)
 *   )
 *   
 *   form.values.title
 *   form.handleChange(e)
 *   form.handleReset()
 *   form.isSubmitting
 */

import { useState, useCallback } from 'react'

export function useForm(initialValues, onSubmit) {
	const [values, setValues] = useState(initialValues)
	const [errors, setErrors] = useState({})
	const [touched, setTouched] = useState({})
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleChange = useCallback((e) => {
		const { name, value } = e.target
		setValues((prev) => ({
			...prev,
			[name]: value,
		}))
		// Clear error for this field on change
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}))
		}
	}, [errors])

	const handleBlur = useCallback((e) => {
		const { name } = e.target
		setTouched((prev) => ({
			...prev,
			[name]: true,
		}))
	}, [])

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault()
			setIsSubmitting(true)

			try {
				await onSubmit(values)
				// Reset form on success
				setValues(initialValues)
				setTouched({})
				setErrors({})
			} catch (error) {
				// Handle submission error if needed
				console.error('Form submission error:', error)
			} finally {
				setIsSubmitting(false)
			}
		},
		[values, onSubmit, initialValues]
	)

	const handleReset = useCallback(() => {
		setValues(initialValues)
		setErrors({})
		setTouched({})
	}, [initialValues])

	const setFieldError = useCallback((field, error) => {
		setErrors((prev) => ({
			...prev,
			[field]: error,
		}))
	}, [])

	const setFieldValue = useCallback((field, value) => {
		setValues((prev) => ({
			...prev,
			[field]: value,
		}))
	}, [])

	return {
		values,
		errors,
		touched,
		isSubmitting,
		setValues,
		setFieldValue,
		setFieldError,
		handleChange,
		handleBlur,
		handleSubmit,
		handleReset,
	}
}
