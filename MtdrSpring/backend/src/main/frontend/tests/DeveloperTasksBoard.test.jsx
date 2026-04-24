import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DeveloperTasksBoard from '../src/features/developer/components/DeveloperTasksBoard'
import { useAuth } from '../src/hooks/useAuth'

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

const jsonResponse = (payload) => Promise.resolve({
  ok: true,
  json: async () => payload,
})

describe('DeveloperTasksBoard', () => {
  let tasksPayload

  beforeEach(() => {
    vi.clearAllMocks()

    useAuth.mockReturnValue({
      user: { userId: 7, name: 'Dev One' },
    })

    tasksPayload = [
      {
        taskId: 11,
        content: 'Initial task',
        taskStatus: 'Pendiente',
        creationDate: '2026-03-10T00:00:00.000Z',
        estimatedDuration: 2,
        finishDate: null,
        realDuration: null,
        type: { name: 'Feature', typeId: 101 },
        isActive: 1,
      },
    ]

    global.fetch = vi.fn((url, options = {}) => {
      const method = options.method ?? 'GET'

      if (url.includes('/api/tasks/by-developer/7')) {
        return jsonResponse(tasksPayload)
      }

      if (url.endsWith('/api/tasks') && method === 'GET') {
        return jsonResponse([
          { type: { name: 'Feature', typeId: 101 } },
          { type: { name: 'Bug', typeId: 102 } },
        ])
      }

      if (url.includes('/api/tasks/11') && method === 'PUT') {
        const body = JSON.parse(options.body)
        tasksPayload = [
          {
            ...tasksPayload[0],
            content: body.content,
            estimatedDuration: body.estimatedDuration,
            type: { name: body.typeId === 102 ? 'Bug' : 'Feature', typeId: body.typeId },
          },
        ]
        return jsonResponse(tasksPayload[0])
      }

      return jsonResponse({})
    })
  })

  it('renders backend tasks and matches snapshot', async () => {
    const { container } = render(<DeveloperTasksBoard />)

    await waitFor(() => {
      expect(screen.getByText('Initial task')).toBeTruthy()
    })

    expect(screen.getByText('Total tasks: 1')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  it('updates task fields and sends PUT payload on save', async () => {
    render(<DeveloperTasksBoard />)

    await waitFor(() => {
      expect(screen.getByText('Initial task')).toBeTruthy()
    })

    const user = userEvent.setup()
    await user.click(screen.getByLabelText('Edit task'))

    const editTaskInput = screen.getByDisplayValue('Initial task')
    await user.clear(editTaskInput)
    await user.type(editTaskInput, 'Updated task title')

    const typeSelects = screen.getAllByLabelText('Type')
    await user.selectOptions(typeSelects[1], 'Bug')

    const estimatedEditInput = screen.getByLabelText('Estimated hours')
    await user.clear(estimatedEditInput)
    await user.type(estimatedEditInput, '5.5')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText('Updated task title')).toBeTruthy()
    })

    const putCall = global.fetch.mock.calls.find(([url, opts]) => (
      url.includes('/api/tasks/11') && opts?.method === 'PUT'
    ))

    expect(putCall).toBeTruthy()
    const [, putOptions] = putCall
    const body = JSON.parse(putOptions.body)

    expect(body).toMatchObject({
      content: 'Updated task title',
      estimatedDuration: 5.5,
      userId: 7,
      typeId: 102,
    })
  })
})
