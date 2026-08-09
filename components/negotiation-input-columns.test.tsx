import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { NegotiationInputColumns } from '@/components/negotiation-input-columns'

afterEach(cleanup)

describe('NegotiationInputColumns', () => {
  it('aligns both columns by heading, existing data, and input form rows', () => {
    render(
      <NegotiationInputColumns
        left={{ title: '施設別予定数量', content: <p>予定数量</p>, form: <form>数量入力</form> }}
        right={{ title: '卸提示', content: <p>提示価格</p>, form: <form>価格入力</form> }}
      />,
    )

    expect(screen.getByTestId('negotiation-input-columns')).toHaveClass('lg:grid-rows-[auto_auto_1fr]')
    expect(screen.getByTestId('negotiation-column-施設別予定数量')).toHaveClass('lg:grid-rows-subgrid')
    expect(screen.getByTestId('negotiation-column-卸提示')).toHaveClass('lg:grid-rows-subgrid')
  })
})
