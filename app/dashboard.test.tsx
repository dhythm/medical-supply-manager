import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/link', () => ({ default: 'a' }))

import DashboardPage from '@/app/(app)/page'

describe('DashboardPage', () => {
  it('prioritizes todays work and labels estimates as hypotheses', () => {
    render(<DashboardPage />)

    expect(screen.getByRole('heading', { name: '今日の対応' })).toBeInTheDocument()
    expect(screen.getAllByText('ヒアリング仮説').length).toBeGreaterThan(0)
  })
})
