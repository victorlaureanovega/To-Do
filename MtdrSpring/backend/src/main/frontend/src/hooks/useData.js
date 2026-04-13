/**
 * useData Hook
 * 
 * Consumer hook for DataProvider context.
 * Provides a clean interface to access and modify app-level data.
 */

import { useContext } from 'react'
import { DataContext } from '../app/providers/DataProvider'

export function useData() {
	const context = useContext(DataContext)

	if (!context) {
		throw new Error('useData must be used within a DataProvider')
	}

	return context
}
