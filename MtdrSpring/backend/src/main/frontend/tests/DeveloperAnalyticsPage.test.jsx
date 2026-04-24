import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import DeveloperAnalyticsPage from '../src/pages/DeveloperAnalyticsPage'
import { useAuth } from '../src/hooks/useAuth'

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../src/pages/AnalyticsPage', () => ({
  default: ({ lockedDeveloperId }) => <div>AnalyticsLocked:{String(lockedDeveloperId ?? '')}</div>,
}))

describe('DeveloperAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes authenticated userId to locked analytics view and matches snapshot', () => {
    useAuth.mockReturnValue({
      user: { userId: 77, name: 'Dev User' },
    })

    const { container } = render(<DeveloperAnalyticsPage />)

    expect(screen.getByText('AnalyticsLocked:77')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
