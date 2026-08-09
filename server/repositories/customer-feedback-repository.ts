import type {
  FeedbackDepartment,
  FeedbackImpact,
  FeedbackSource,
  FeedbackStatus,
  PrismaClient,
} from '@prisma/client'

export function createCustomerFeedbackRepository(database: PrismaClient) {
  return {
    async list(organizationId: string) {
      const feedback = await database.customerFeedback.findMany({
        where: { organizationId, archivedAt: null },
        include: { statusChanges: { orderBy: { changedAt: 'desc' }, take: 1 } },
        orderBy: [{ capturedAt: 'desc' }, { updatedAt: 'desc' }],
      })
      const items = feedback.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        source: item.source,
        department: item.department,
        impact: item.impact,
        status: item.status,
        capturedAt: item.capturedAt.toISOString().slice(0, 10),
        version: item.version,
        isSample: item.isSample,
        latestReason: item.statusChanges[0]?.reason ?? null,
      }))
      return {
        items,
        newCount: items.filter((item) => item.status === 'NEW').length,
        reviewingCount: items.filter((item) => item.status === 'REVIEWING').length,
        highImpactCount: items.filter((item) => item.impact === 'HIGH').length,
        hasSampleData: items.some((item) => item.isSample),
      }
    },

    async create(input: {
      organizationId: string
      title: string
      summary: string
      source: FeedbackSource
      department: FeedbackDepartment
      impact: FeedbackImpact
      capturedAt: Date
    }) {
      const title = input.title.trim()
      const summary = input.summary.trim()
      if (!title || !summary) throw new Error('Required fields are missing')
      if (title.length > 120) throw new Error('Title is too long')
      if (summary.length > 1000) throw new Error('Summary is too long')

      return database.$transaction(async (transaction) => {
        const feedback = await transaction.customerFeedback.create({
          data: { ...input, title, summary },
        })
        await transaction.customerFeedbackStatusChange.create({
          data: { customerFeedbackId: feedback.id, fromStatus: null, toStatus: 'NEW' },
        })
        return feedback
      })
    },

    async updateStatus(input: {
      organizationId: string
      feedbackId: string
      version: number
      status: FeedbackStatus
      reason?: string
    }) {
      const reason = input.reason?.trim() || null
      if (reason && reason.length > 240) throw new Error('Reason is too long')

      return database.$transaction(async (transaction) => {
        const current = await transaction.customerFeedback.findFirst({
          where: {
            id: input.feedbackId,
            organizationId: input.organizationId,
            archivedAt: null,
          },
        })
        if (!current) throw new Error('Customer feedback not found')
        if (current.status === input.status) throw new Error('Status is unchanged')
        if (current.version !== input.version)
          throw new Error('Customer feedback was updated by another request')

        const updated = await transaction.customerFeedback.updateMany({
          where: { id: current.id, organizationId: input.organizationId, version: input.version },
          data: { status: input.status, version: { increment: 1 } },
        })
        if (updated.count !== 1) throw new Error('Customer feedback was updated by another request')

        await transaction.customerFeedbackStatusChange.create({
          data: {
            customerFeedbackId: current.id,
            fromStatus: current.status,
            toStatus: input.status,
            reason,
          },
        })
      })
    },
  }
}
