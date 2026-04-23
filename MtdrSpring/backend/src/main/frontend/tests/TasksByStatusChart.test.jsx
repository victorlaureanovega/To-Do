import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TasksByStatusChart from '../src/features/analytics/components/charts/TasksByStatusChart'
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

describe('TasksByStatusChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useData.mockReturnValue({ teamId: 101 })
  })

  it('Test 3: renders real component and normalizes team status buckets', async () => {
    fetchTeamDevelopers.mockResolvedValue([
      { userId: 1, firstName: 'Alice', lastName: 'A' },
      { userId: 2, firstName: 'Bob', lastName: 'B' },
    ])

    global.fetch = vi.fn((url) => {
      if (url.includes('/by-developer/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { taskStatus: 'todo' },
            { taskStatus: 'progreso' },
            { taskStatus: 'final' },
            { taskStatus: 'unknown' },
          ],
        })
      }

      return Promise.resolve({
        ok: true,
        json: async () => [
          { taskStatus: 'pendiente' },
          { taskStatus: 'curso' },
          { taskStatus: 'done' },
        ],
      })
    })

    render(<TasksByStatusChart selectedDeveloperId="all" />)

    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeTruthy()
    })

    expect(fetchTeamDevelopers).toHaveBeenCalledWith('', 101)
    expect(global.fetch).toHaveBeenCalledTimes(2)

    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent)
    expect(chartData).toHaveLength(2)
    expect(chartData[0]).toMatchObject({
      developer: 'Alice A',
      todo: 2,
      inProgress: 1,
      completed: 1,
    })
    expect(chartData[1]).toMatchObject({
      developer: 'Bob B',
      todo: 1,
      inProgress: 1,
      completed: 1,
    })
  })

  it('Test 4: renders real component and filters to one developer', async () => {
    fetchTeamDevelopers.mockResolvedValue([
      { userId: 1, firstName: 'Alice', lastName: 'A' },
      { userId: 2, firstName: 'Bob', lastName: 'B' },
    ])

    global.fetch = vi.fn((url) => {
      if (url.includes('/by-developer/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { taskStatus: 'todo' },
            { taskStatus: 'progreso' },
            { taskStatus: 'final' },
          ],
        })
      }

      return Promise.resolve({
        ok: true,
        json: async () => [{ taskStatus: 'todo' }],
      })
    })

    render(<TasksByStatusChart selectedDeveloperId="1" />)

    await waitFor(() => {
      const chartData = JSON.parse(screen.getByTestId('chart-data').textContent)
      expect(chartData).toHaveLength(1)
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/by-developer/1'),
      expect.objectContaining({ method: 'GET' }),
    )

    const chartData = JSON.parse(screen.getByTestId('chart-data').textContent)
    expect(chartData[0]).toMatchObject({
      developer: 'Alice A',
      todo: 1,
      inProgress: 1,
      completed: 1,
    })
  })
})

