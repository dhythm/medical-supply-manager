import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MeterBar } from '@/components/shared'

describe('MeterBar', () => {
  it('exposes its value to assistive technology', () => {
    render(<MeterBar value={71} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '71')
  })
})
