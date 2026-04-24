import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnalyticsPage from '../src/pages/AnalyticsPage'
import { useAuth } from '../src/hooks/useAuth'
import { useData } from '../src/hooks/useData'
import { fetchTeamDevelopers } from '../src/utils/teamApi'

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../src/hooks/useData', () => ({
  useData: vi.fn(),
}))

vi.mock('../src/utils/teamApi', () => ({
  fetchTeamDevelopers: vi.fn(),
}))

vi.mock('../src/components/common/PageHeader', () => ({
  default: ({ title, subtitle }) => (
    <header>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
}))

vi.mock('../src/features/analytics/components/DeveloperAverageHoursCard', () => ({
  default: ({ selectedDeveloperId }) => <div>DeveloperHours:{selectedDeveloperId}</div>,
}))

vi.mock('../src/features/analytics/components/TeamAverageFinishedTasksCard', () => ({
  default: ({ selectedDeveloperId }) => <div>FinishedAvg:{selectedDeveloperId ?? 'team'}</div>,
}))

vi.mock('../src/features/analytics/components/TeamAverageWorkedHoursCard', () => ({
  default: ({ selectedDeveloperId }) => <div>WorkedAvg:{selectedDeveloperId ?? 'team'}</div>,
}))

vi.mock('../src/features/analytics/components/KpiSection', () => ({
  default: ({ completionRate }) => <div>KPI:{completionRate}</div>,
}))

vi.mock('../src/features/analytics/components/ChartGrid', () => ({
  default: ({ children }) => <div>{children}</div>,
}))

vi.mock('../src/features/analytics/components/charts/TasksByStatusChart', () => ({
  default: ({ selectedDeveloperId }) => <div>StatusChart:{selectedDeveloperId}</div>,
}))

vi.mock('../src/features/analytics/components/charts/TasksRegisteredByDateChart', () => ({
  default: ({ data }) => <div>ByDate:{data.length}</div>,
}))

vi.mock('../src/features/analytics/components/charts/TeamCompletionChart', () => ({
  default: ({ data }) => <div>Completion:{data.length}</div>,
}))

vi.mock('../src/features/analytics/components/charts/TaskTypeDistributionChart', () => ({
  default: ({ data }) => <div>TaskType:{data.length}</div>,
}))

vi.mock('../src/features/analytics/components/charts/TimeComparisonChart', () => ({
  default: ({ selectedDeveloperId }) => <div>TimeChart:{selectedDeveloperId}</div>,
}))

const okResponse = (payload) => Promise.resolve({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => payload,
})

describe('AnalyticsPage role customization', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    useData.mockReturnValue({ teamId: 101 })

    fetchTeamDevelopers.mockResolvedValue([
      { userId: 1, firstName: 'Alice', lastName: 'Dev' },
      { userId: 2, firstName: 'Bob', lastName: 'Dev' },
    ])

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/tasks/by-developer/')) {
        return okResponse([
          {
            taskStatus: 'Finalizada',
            type: { typeName: 'Bug' },
          },
        ])
      }

      if (url.includes('/api/tasks/hours/by-developer/')) {
        return okResponse({ totalWorkedHours: 3, totalEstimatedHours: 2 })
      }

      if (url.includes('/api/tasks/rework-rate/by-team/')) {
        return okResponse(10)
      }

      if (url.includes('/api/tasks/rework-rate/by-dev/')) {
        return okResponse(5)
      }

      if (url.includes('/api/tasks/grouped-by-date/')) {
        return okResponse([{ date: '2026-04-01', registered: 1, completed: 1 }])
      }

      if (url.endsWith('/api/tasks/grouped-by-date')) {
        return okResponse([{ date: '2026-04-01', registered: 2, completed: 1 }])
      }

      if (url.includes('/api/tasks/by-type/by-team/')) {
        return okResponse([{ typeName: 'Bug', count: 2 }])
      }

      return okResponse([])
    })
  })

  it('renders manager dashboard and matches snapshot', async () => {
    useAuth.mockReturnValue({
      role: 'MANAGER',
      user: { userId: 99, name: 'Manager One' },
    })

    const { container } = render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText('KPI Dashboard')).toBeTruthy()
      expect(screen.getByText('Team view')).toBeTruthy()
    })

    expect(container).toMatchSnapshot()
  })

  it('applies manager developer filter and calls developer-scoped backend endpoints', async () => {
    useAuth.mockReturnValue({
      role: 'MANAGER',
      user: { userId: 99, name: 'Manager One' },
    })

    render(<AnalyticsPage />)

    await waitFor(() => {
      expect(screen.getByText('Team view')).toBeTruthy()
    })

    const user = userEvent.setup()
    const developerSelect = screen.getByRole('combobox')
    await user.selectOptions(developerSelect, '2')

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/grouped-by-date/2'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/by-developer/2'),
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('renders developer-scoped dashboard without team view option', async () => {
    useAuth.mockReturnValue({
      role: 'DEVELOPER',
      user: { userId: 7, name: 'Dev One' },
    })

    const { container } = render(<AnalyticsPage lockedDeveloperId="7" />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/rework-rate/by-dev/7'),
        expect.objectContaining({ method: 'GET' }),
      )
    })

    expect(screen.queryByText('Team view')).toBeNull()
    expect(screen.getByText('Dev One')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
