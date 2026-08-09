import { afterAll, beforeEach, describe, expect, it } from 'vitest'

import { createDatabaseClient } from '@/server/db/client'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'
import { createCustomerFeedbackRepository } from '@/server/repositories/customer-feedback-repository'

const database = createDatabaseClient(
  process.env.TEST_DATABASE_URL ??
    'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test',
)
const repository = createCustomerFeedbackRepository(database)

describe('customer feedback repository', () => {
  let organizationId = ''

  beforeEach(async () => {
    await resetDatabase(database)
    await seedDatabase(database)
    organizationId = (await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })).id
  })

  afterAll(async () => database.$disconnect())

  it('creates organization-scoped feedback and its initial status history', async () => {
    const feedback = await repository.create({
      organizationId,
      title: '  商品比較を簡単にしたい  ',
      summary: '  同じ用途の商品を価格と仕様で比較したい。  ',
      source: 'INTERVIEW',
      department: 'PROCUREMENT',
      impact: 'HIGH',
      capturedAt: new Date('2026-08-09T00:00:00Z'),
    })

    expect(feedback.title).toBe('商品比較を簡単にしたい')
    await expect(
      database.customerFeedbackStatusChange.findFirstOrThrow({
        where: { customerFeedbackId: feedback.id },
      }),
    ).resolves.toMatchObject({ fromStatus: null, toStatus: 'NEW' })
  })

  it('lists active feedback with aggregate counts', async () => {
    await repository.create({
      organizationId,
      title: '優先要望',
      summary: '購買判断に必要な情報を一覧で確認したい。',
      source: 'CUSTOMER_VISIT',
      department: 'MANAGEMENT',
      impact: 'HIGH',
      capturedAt: new Date('2026-08-09T00:00:00Z'),
    })

    const result = await repository.list(organizationId)

    expect(result.items).toHaveLength(1)
    expect(result.newCount).toBe(1)
    expect(result.highImpactCount).toBe(1)
    expect(result.hasSampleData).toBe(false)
  })

  it('updates status with optimistic locking and records the reason', async () => {
    const feedback = await repository.create({
      organizationId,
      title: '対応状況を確認したい',
      summary: '要望の検討状況を一覧で確認したい。',
      source: 'SUPPORT',
      department: 'CLINICAL',
      impact: 'MEDIUM',
      capturedAt: new Date('2026-08-09T00:00:00Z'),
    })

    await repository.updateStatus({
      organizationId,
      feedbackId: feedback.id,
      version: feedback.version,
      status: 'REVIEWING',
      reason: 'プロダクト会議で確認',
    })

    await expect(
      database.customerFeedback.findUniqueOrThrow({ where: { id: feedback.id } }),
    ).resolves.toMatchObject({
      status: 'REVIEWING',
      version: 2,
    })
    await expect(
      database.customerFeedbackStatusChange.findFirstOrThrow({
        where: { customerFeedbackId: feedback.id, toStatus: 'REVIEWING' },
      }),
    ).resolves.toMatchObject({ fromStatus: 'NEW', reason: 'プロダクト会議で確認' })

    await expect(
      repository.updateStatus({
        organizationId,
        feedbackId: feedback.id,
        version: feedback.version,
        status: 'PLANNED',
      }),
    ).rejects.toThrow('Customer feedback was updated by another request')
  })

  it('does not update feedback outside the organization or add duplicate status history', async () => {
    const feedback = await repository.create({
      organizationId,
      title: '組織内の要望',
      summary: '組織をまたいで更新されないことを確認する。',
      source: 'OTHER',
      department: 'OTHER',
      impact: 'LOW',
      capturedAt: new Date('2026-08-09T00:00:00Z'),
    })
    const otherOrganization = await database.organization.create({ data: { code: 'OTHER', name: '別組織' } })

    await expect(
      repository.updateStatus({
        organizationId: otherOrganization.id,
        feedbackId: feedback.id,
        version: feedback.version,
        status: 'REVIEWING',
      }),
    ).rejects.toThrow('Customer feedback not found')
    await expect(
      repository.updateStatus({
        organizationId,
        feedbackId: feedback.id,
        version: feedback.version,
        status: 'NEW',
      }),
    ).rejects.toThrow('Status is unchanged')
    await expect(
      database.customerFeedbackStatusChange.count({ where: { customerFeedbackId: feedback.id } }),
    ).resolves.toBe(1)
  })
})
