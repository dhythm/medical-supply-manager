import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ProductRegistrationForm } from '@/components/product-registration-form'

afterEach(cleanup)

describe('ProductRegistrationForm', () => {
  it('renders a manual registration form without an AI lookup query', () => {
    const { container, getByLabelText, getByRole } = render(
      <ProductRegistrationForm action={() => undefined} submitLabel="商品を登録" />,
    )

    expect(getByLabelText('製品名')).toBeRequired()
    expect(getByLabelText('院内コード')).toBeRequired()
    expect(getByRole('button', { name: '商品を登録' })).toBeVisible()
    expect(container.querySelector('input[name="lookupQuery"]')).not.toBeInTheDocument()
  })

  it('preserves the lookup query when registering an AI candidate', () => {
    const { container, getByLabelText } = render(
      <ProductRegistrationForm
        action={() => undefined}
        submitLabel="商品マスタに登録"
        lookupQuery="ドレッシング"
        initialValue={{ name: '滅菌ドレッシング' }}
      />,
    )

    expect(getByLabelText('製品名')).toHaveValue('滅菌ドレッシング')
    expect(container.querySelector('input[name="lookupQuery"]')).toHaveValue('ドレッシング')
  })
})
