import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ManagerOverviewPage from '../src/pages/ManagerOverviewPage'
import { useData } from '../src/hooks/useData'

vi.mock('../src/hooks/useData', () => ({
  useData: vi.fn(),
}))

const renderPage = () => render(
  <MemoryRouter>
    <ManagerOverviewPage />
  </MemoryRouter>,
)

describe('ManagerOverviewPage', () => {
  let getTeamTasksMock
  let teamTasksState

  beforeEach(() => {
    vi.clearAllMocks()

    getTeamTasksMock = vi.fn()
    teamTasksState = [
      {
        id: '1',
        title: 'Build API schema',
        status: 'In Progress',
        assignee: 'Alice',
        estimatedDuration: '4',
      },
      {
        id: '2',
        title: 'Fix UI bug',
        status: 'To Do',
        assignee: 'Bob',
        estimatedDuration: '2',
      },
      {
        id: '3',
        title: 'Write tests',
        status: 'Completed',
        assignee: 'Alice',
        estimatedDuration: '3',
      },
    ]

    useData.mockImplementation(() => ({
      teamTasks: teamTasksState,
      getTeamTasks: getTeamTasksMock,
    }))
  })

  it('renders grouped team tasks and matches snapshot', () => {
    const { container } = renderPage()

    expect(screen.getByText('Team Overview')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Alice' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Bob' })).toBeTruthy()
    expect(screen.getByText('2 tasks')).toBeTruthy()
    expect(screen.getByText('1 tasks')).toBeTruthy()
    expect(getTeamTasksMock).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()
  })

  it('filters by developer and status using user interactions', async () => {
    renderPage()

    const user = userEvent.setup()
    const [developerSelect, statusSelect] = screen.getAllByRole('combobox')

    await user.selectOptions(developerSelect, 'Alice')
    expect(screen.queryByRole('heading', { name: 'Bob' })).toBeNull()
    expect(screen.getByText('Build API schema')).toBeTruthy()
    expect(screen.getByText('Write tests')).toBeTruthy()

    await user.selectOptions(statusSelect, 'Completed')
    expect(screen.queryByText('Build API schema')).toBeNull()
    expect(screen.getByText('Write tests')).toBeTruthy()
  })

  it('updates displayed developer groups when team data changes (reactive state)', () => {
    const { rerender } = renderPage()

    expect(screen.queryByText('Carla')).toBeNull()

    teamTasksState = [
      {
        id: '9',
        title: 'Integrate auth',
        status: 'To Do',
        assignee: 'Carla',
      },
    ]

    rerender(
      <MemoryRouter>
        <ManagerOverviewPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Carla' })).toBeTruthy()
    expect(screen.getByText('Integrate auth')).toBeTruthy()
  })
})
