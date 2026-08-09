import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RegistrationConsole } from '@/components/registration-console'

describe('RegistrationConsole', () => {
  afterEach(() => vi.useRealTimers())

  it('keeps the fetch state understandable without redundant helper copy', () => {
    vi.useFakeTimers()
    render(<RegistrationConsole />)

    expect(
      screen.queryByText('型番や仕様は不要です。院内での呼び名・略称でも照合します。'),
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '製品情報を検索' }))
    expect(screen.getByRole('button', { name: '製品情報を取得中' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('公的情報を照合しています')

    act(() => vi.runAllTimers())
    expect(screen.getByText('推奨')).toBeInTheDocument()
  })
})
