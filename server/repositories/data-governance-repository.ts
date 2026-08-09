import type { DataAssetCategory, DataAssetReviewOutcome, DataClassification, PrismaClient } from '@prisma/client'

export function createDataGovernanceRepository(database: PrismaClient) {
  return {
    async list(organizationId: string, now = new Date()) {
      const [assets, auditEvents] = await Promise.all([
        database.dataAsset.findMany({ where: { organizationId, archivedAt: null }, include: { reviews: { orderBy: { reviewedAt: 'desc' }, take: 1 } }, orderBy: [{ nextReviewAt: 'asc' }, { code: 'asc' }] }),
        database.auditEvent.findMany({ where: { organizationId }, orderBy: { occurredAt: 'desc' }, take: 10 }),
      ])
      const items = assets.map((asset) => ({
        id: asset.id, code: asset.code, name: asset.name, category: asset.category,
        classification: asset.classification, purpose: asset.purpose, retentionDays: asset.retentionDays,
        nextReviewAt: asset.nextReviewAt.toISOString().slice(0, 10), isOverdue: asset.nextReviewAt < now,
        latestOutcome: asset.reviews[0]?.outcome ?? null, isSample: asset.isSample,
      }))
      return {
        items,
        auditEvents: auditEvents.map((event) => ({ id: event.id, entityType: event.entityType, action: event.action, changedFields: event.changedFields, occurredAt: event.occurredAt.toISOString() })),
        assetCount: items.length,
        overdueCount: items.filter((item) => item.isOverdue).length,
        actionRequiredCount: items.filter((item) => item.latestOutcome === 'ACTION_REQUIRED').length,
        hasSampleData: items.some((item) => item.isSample),
      }
    },
    async create(input: { organizationId: string; code: string; name: string; category: DataAssetCategory; classification: DataClassification; purpose: string; retentionDays?: number; reviewIntervalDays: number; nextReviewAt: Date }) {
      const code = input.code.trim().toUpperCase()
      const name = input.name.trim()
      const purpose = input.purpose.trim()
      if (!code || !name || !purpose) throw new Error('Required fields are missing')
      if (input.retentionDays !== undefined && input.retentionDays <= 0) throw new Error('Retention days must be positive')
      if (input.reviewIntervalDays <= 0) throw new Error('Review interval must be positive')
      return database.$transaction(async (transaction) => {
        const asset = await transaction.dataAsset.create({ data: { ...input, code, name, purpose } })
        await transaction.auditEvent.create({ data: { organizationId: input.organizationId, entityType: 'DATA_ASSET', entityId: asset.id, action: 'CREATED', changedFields: ['code', 'name', 'category', 'classification', 'purpose'] } })
        return asset
      })
    },
    async review(input: { organizationId: string; assetId: string; outcome: DataAssetReviewOutcome; note?: string; nextReviewAt: Date }) {
      return database.$transaction(async (transaction) => {
        const asset = await transaction.dataAsset.findFirst({ where: { id: input.assetId, organizationId: input.organizationId, archivedAt: null } })
        if (!asset) throw new Error('Data asset not found')
        await transaction.dataAssetReview.create({ data: { dataAssetId: asset.id, outcome: input.outcome, note: input.note?.trim() || null, nextReviewAt: input.nextReviewAt } })
        await transaction.dataAsset.update({ where: { id: asset.id }, data: { lastReviewedAt: new Date(), nextReviewAt: input.nextReviewAt, version: { increment: 1 } } })
        await transaction.auditEvent.create({ data: { organizationId: input.organizationId, entityType: 'DATA_ASSET', entityId: asset.id, action: 'REVIEWED', changedFields: ['lastReviewedAt', 'nextReviewAt'] } })
      })
    },
  }
}
