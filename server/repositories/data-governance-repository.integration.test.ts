import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDatabaseClient } from '@/server/db/client'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'
import { createDataGovernanceRepository } from '@/server/repositories/data-governance-repository'

const database = createDatabaseClient(
  process.env.TEST_DATABASE_URL ??
    'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test',
)
const repository = createDataGovernanceRepository(database)

describe('data governance repository', () => {
  let organizationId = ''
  beforeAll(async () => {
    await resetDatabase(database)
    await seedDatabase(database)
    organizationId = (await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })).id
  })
  afterAll(async () => database.$disconnect())

  it('creates organization-scoped assets and audit events', async () => {
    await repository.create({
      organizationId,
      code: 'TEST',
      name: 'テスト資産',
      category: 'MASTER',
      classification: 'INTERNAL',
      purpose: 'テスト',
      reviewIntervalDays: 365,
      nextReviewAt: new Date('2026-08-01T00:00:00Z'),
    })
    const result = await repository.list(organizationId, new Date('2026-08-09T00:00:00Z'))
    expect(result.assetCount).toBe(1)
    expect(result.overdueCount).toBe(1)
    await expect(database.auditEvent.count({ where: { organizationId, action: 'CREATED' } })).resolves.toBe(1)
  })

  it('records a review and updates the next review atomically', async () => {
    const asset = await database.dataAsset.findFirstOrThrow({ where: { organizationId } })
    await repository.review({
      organizationId,
      assetId: asset.id,
      outcome: 'ACTION_REQUIRED',
      note: '保持期間を確認',
      nextReviewAt: new Date('2026-09-01T00:00:00Z'),
    })
    await expect(database.dataAssetReview.count({ where: { dataAssetId: asset.id } })).resolves.toBe(1)
    await expect(database.auditEvent.count({ where: { organizationId, action: 'REVIEWED' } })).resolves.toBe(
      1,
    )
  })
})
