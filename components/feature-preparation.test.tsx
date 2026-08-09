import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FeaturePreparation } from '@/components/feature-preparation'

describe('FeaturePreparation', () => {
  it('makes an unimplemented feature explicit', () => {
    render(<FeaturePreparation featureName="共同購入・価格交渉" />)

    expect(screen.getByText('準備中')).toBeInTheDocument()
    expect(screen.getByText('共同購入・価格交渉は準備中です。')).toBeInTheDocument()
  })
})
