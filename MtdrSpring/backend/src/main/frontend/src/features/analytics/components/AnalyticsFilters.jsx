/**
 * AnalyticsFilters Component
 * 
 * Composite wrapper for all filter controls on the analytics page.
 * Handles developer filtering and date range selection.
 */

import { useState } from 'react'
import SectionCard from '../../../components/common/SectionCard'
import FilterBar from '../../../components/common/FilterBar'

export default function AnalyticsFilters({
	developerOptions,
	developerFilter,
	onDeveloperFilterChange,
}) {
	const [dateRange, setDateRange] = useState({ start: '', end: '' })

	const handleClearFilters = () => {
		onDeveloperFilterChange('all')
		setDateRange({ start: '', end: '' })
	}

	return (
		<SectionCard
			title="Filters"
			noPad
			actions={
				<div className="analytics-filters-actions">
					<FilterBar
						filters={[
							{
								id: 'developer',
								label: 'Developer',
								options: developerOptions,
								value: developerFilter,
								onChange: onDeveloperFilterChange,
							},
						]}
					/>
					<button type="button" className="btn btn-ghost analytics-filters-clear" onClick={handleClearFilters}>
						Clear filters
					</button>
				</div>
			}
		/>
	)
}
