import { describe, expect, it } from 'vitest'

import { createDummyProductLookup } from '@/server/ai/product-lookup'

describe('dummy product lookup', () => {
  const lookup = createDummyProductLookup()

  it('returns an editable candidate marked as a dummy response', async () => {
    const result = await lookup.findCandidate(' サージカルマスク ')

    expect(result).toMatchObject({
      query: 'サージカルマスク',
      responseKind: 'DUMMY',
      candidate: {
        name: 'サージカルマスク',
        category: '医療材料',
      },
    })
  })

  it('rejects an empty product name', async () => {
    await expect(lookup.findCandidate('  ')).rejects.toThrow('製品名を入力してください')
  })
})
