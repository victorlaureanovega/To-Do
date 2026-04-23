import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TimeComparisonChart from '../src/features/analytics/components/charts/TimeComparisonChart'
import { useData } from '../src/hooks/useData'
import { fetchTeamDevelopers } from '../src/utils/teamApi'

vi.mock('../src/hooks/useData', () => ({
  useData: vi.fn(),
}))

vi.mock('../src/utils/teamApi', () => ({
  fetchTeamDevelopers: vi.fn(),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  BarChart: ({ data, children }) => (
    <div data-testid="bar-chart">
      <pre data-testid="chart-data">{JSON.stringify(data)}</pre>
      {children}
    </div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}))

describe('TimeComparisonChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useData.mockReturnValue({ teamId: 101 })
  })

  it('Test 1: renders real component and aggregates hours for all developers', async () => {
    fetchTeamDevelopers.mockResolvedValue([
      { userId: 1, firstName: 'Alice', lastName: 'A' },
      { userId: 2, firstName: 'Bob', lastName: 'B' },
      { userId: 3, username: 'charlie' },
    ])

    global.fetch = vi.fn((url) => {
      if (url.includes('/by-developer/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ totalEstimatedHours: 40, totalWorkedHours: 38 }),
        })
      }
      if (url.includes('/by-developer/2')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ totalEstimatedHours: 35, totalWorkedHours: 36 }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ totalEstimatedHours: 50, totalWorkedHours: 52 }),
      })
    })

    render(<TimeComparisonChart selectedDeveloperId="all" />)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeTruthy()
    })

    expect(fetchTeamDevelopers).toHaveBeenCalledWith('', 101)
    expect(global.fetch).toHaveBeenCalledTimes(3)

    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent)
    expect(chartData).toHaveLength(3)
    expect(chartData[0]).toMatchObject({
      developer: 'Alice A',
      estimatedHours: 40,
      realHours: 38,
    })
  })

  it('Test 2: renders real component and filters to a single developer', async () => {
    fetchTeamDevelopers.mockResolvedValue([
      { userId: 1, firstName: 'Alice', lastName: 'A' },
      { userId: 2, firstName: 'Bob', lastName: 'B' },
    ])

    global.fetch = vi.fn((url) => {
      if (url.includes('/by-developer/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ totalEstimatedHours: 40, totalWorkedHours: 38 }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ totalEstimatedHours: 35, totalWorkedHours: 36 }),
      })
    })

    render(<TimeComparisonChart selectedDeveloperId="1" />)

    await waitFor(() => {
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent)
      expect(chartData).toHaveLength(1)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/hours/by-developer/1'),
      expect.objectContaining({ method: 'GET' }),
    )
  })
})

