import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProductDeleteControl } from '@/components/product-delete-control'

afterEach(cleanup)

describe('ProductDeleteControl', () => {
  it('requires an explicit confirmation before exposing the delete action', () => {
    render(<ProductDeleteControl action={vi.fn()} productName="滅菌ドレッシング" />)

    expect(screen.queryByRole('button', { name: '削除を確定' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '商品を削除' }))

    expect(screen.getByText('滅菌ドレッシングを商品マスタから削除します。')).toBeVisible()
    expect(screen.getByRole('button', { name: '削除を確定' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(screen.queryByRole('button', { name: '削除を確定' })).not.toBeInTheDocument()
  })
})
