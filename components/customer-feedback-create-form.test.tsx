import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CustomerFeedbackCreateForm } from '@/components/customer-feedback-create-form'

describe('CustomerFeedbackCreateForm', () => {
  it('groups the received date and registration action in a dedicated footer', () => {
    render(
      <CustomerFeedbackCreateForm
        action={() => undefined}
        sourceOptions={[{ label: '展示会', value: 'EXHIBITION' }]}
        departmentOptions={[{ label: '購買', value: 'PROCUREMENT' }]}
      />,
    )

    const actionGroup = screen.getByRole('group', { name: '受付情報' })

    expect(within(actionGroup).getByLabelText('受付日')).toBeRequired()
    expect(within(actionGroup).getByRole('button', { name: '顧客の声を登録' })).toBeVisible()
  })
})
