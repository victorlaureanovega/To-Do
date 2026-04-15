/**
 * useFilter Hook
 * 
 * Reusable hook for filtering data arrays by a key.
 * Simplifies filter logic across pages.
 * 
 * Usage:
 *   const filtered = useFilter(tasks, 'status', 'Completed')
 */

import { useMemo } from 'react'

export function useFilter(data, filterKey, filterValue) {
	return useMemo(() => {
		if (!data || !Array.isArray(data)) {
			return []
		}

		if (!filterKey || !filterValue || filterValue === 'All') {
			return data
		}

		return data.filter((item) => item[filterKey] === filterValue)
	}, [data, filterKey, filterValue])
}
