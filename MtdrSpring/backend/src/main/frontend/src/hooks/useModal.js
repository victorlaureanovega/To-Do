/**
 * useModal Hook
 * 
 * Reusable modal state management.
 * Simplifies open/close and context-specific data (e.g., editing a specific task).
 * 
 * Usage:
 *   const modal = useModal()
 *   
 *   modal.isOpen
 *   modal.data
 *   modal.open(someData)
 *   modal.close()
 *   modal.reset()
 */

import { useState, useCallback } from 'react'

export function useModal(initialData = null) {
	const [isOpen, setIsOpen] = useState(false)
	const [data, setData] = useState(initialData)

	const open = useCallback((modalData = null) => {
		setData(modalData)
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
	}, [])

	const reset = useCallback(() => {
		setIsOpen(false)
		setData(initialData)
	}, [initialData])

	return {
		isOpen,
		data,
		open,
		close,
		reset,
	}
}
