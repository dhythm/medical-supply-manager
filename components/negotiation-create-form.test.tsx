import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { NegotiationCreateForm } from '@/components/negotiation-create-form'

describe('NegotiationCreateForm', () => {
  it('keeps a product select with a long option inside its grid column', () => {
    render(
      <NegotiationCreateForm
        action={() => undefined}
        products={[
          {
            id: 'product-1',
            label: '中心静脈カテーテルキット 4Fr ダブルルーメン（非常に長い商品名）',
          },
        ]}
      />,
    )

    expect(screen.getByLabelText('商品')).toHaveClass('w-full', 'min-w-0')
  })
})
