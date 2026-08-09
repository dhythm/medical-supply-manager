import type { PrismaClient } from '@prisma/client'

type CreateNegotiationInput = {
  organizationId: string
  organizationProductId: string
  title: string
  baselineUnitPriceYen?: number
  targetUnitPriceYen?: number
  quoteDueDate?: Date
}

export function createPriceNegotiationRepository(database: PrismaClient) {
  return {
    async list(organizationId: string) {
      const rows = await database.priceNegotiation.findMany({
        where: { organizationId },
        include: {
          organizationProduct: { include: { product: true } },
          demands: { include: { facility: true }, orderBy: { facility: { code: 'asc' } } },
          quotes: { include: { distributor: true }, orderBy: [{ unitPriceYen: 'asc' }, { submittedAt: 'desc' }] },
        },
        orderBy: [{ updatedAt: 'desc' }, { title: 'asc' }],
      })

      const items = rows.map((row) => {
        const totalQuantity = row.demands.reduce((sum, demand) => sum + demand.quantity, 0)
        const eligibleQuotes = row.quotes.filter(
          (quote) => quote.minimumQuantity === null || quote.minimumQuantity <= totalQuantity,
        )
        const bestQuote = eligibleQuotes[0]
        const estimatedSavingsYen =
          row.baselineUnitPriceYen && bestQuote
            ? Math.max(0, row.baselineUnitPriceYen - bestQuote.unitPriceYen) * totalQuantity
            : 0

        return {
          id: row.id,
          title: row.title,
          status: row.status,
          businessCode: row.organizationProduct.businessCode,
          productName: row.organizationProduct.product.name,
          baselineUnitPriceYen: row.baselineUnitPriceYen,
          targetUnitPriceYen: row.targetUnitPriceYen,
          quoteDueDate: row.quoteDueDate?.toISOString().slice(0, 10) ?? null,
          contractValidFrom: row.contractValidFrom?.toISOString().slice(0, 10) ?? null,
          totalQuantity,
          facilityCount: row.demands.length,
          bestQuoteYen: bestQuote?.unitPriceYen ?? null,
          estimatedSavingsYen,
          isSample: row.isSample,
          version: row.version,
          demands: row.demands.map((demand) => ({
            facilityId: demand.facilityId,
            facilityName: demand.facility.name,
            quantity: demand.quantity,
          })),
          quotes: row.quotes.map((quote) => ({
            id: quote.id,
            distributorName: quote.distributor.name,
            unitPriceYen: quote.unitPriceYen,
            minimumQuantity: quote.minimumQuantity,
            isEligible: quote.minimumQuantity === null || quote.minimumQuantity <= totalQuantity,
            isSelected: quote.isSelected,
          })),
        }
      })

      return {
        items,
        activeCount: items.filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.status)).length,
        totalQuantity: items.reduce((sum, item) => sum + item.totalQuantity, 0),
        participatingFacilityCount: new Set(items.flatMap((item) => item.demands.map((demand) => demand.facilityId))).size,
        estimatedSavingsYen: items.reduce((sum, item) => sum + item.estimatedSavingsYen, 0),
        hasSampleData: items.some((item) => item.isSample),
      }
    },

    async getOptions(organizationId: string) {
      const [products, facilities, distributors] = await Promise.all([
        database.organizationProduct.findMany({
          where: { organizationId, isActive: true },
          select: { id: true, businessCode: true, product: { select: { name: true } }, contractPrices: { orderBy: { validFrom: 'desc' }, take: 1 } },
          orderBy: { businessCode: 'asc' },
        }),
        database.facility.findMany({ where: { organizationId }, orderBy: { code: 'asc' } }),
        database.distributor.findMany({ where: { organizationId }, orderBy: { name: 'asc' } }),
      ])
      return {
        products: products.map((row) => ({
          id: row.id,
          label: `${row.businessCode} ${row.product.name}`,
          contractPriceYen: row.contractPrices[0]?.contractPriceYen ?? null,
        })),
        facilities: facilities.map((row) => ({ id: row.id, name: row.name })),
        distributors: distributors.map((row) => ({ id: row.id, name: row.name })),
      }
    },

    async create(input: CreateNegotiationInput) {
      const title = input.title.trim()
      if (!title) throw new Error('Title is required')
      assertOptionalPositive(input.baselineUnitPriceYen, 'Baseline price')
      assertOptionalPositive(input.targetUnitPriceYen, 'Target price')
      const product = await database.organizationProduct.findFirst({
        where: { id: input.organizationProductId, organizationId: input.organizationId, isActive: true },
      })
      if (!product) throw new Error('Product not found')
      return database.priceNegotiation.create({
        data: {
          organizationId: input.organizationId,
          organizationProductId: product.id,
          title,
          baselineUnitPriceYen: input.baselineUnitPriceYen,
          targetUnitPriceYen: input.targetUnitPriceYen,
          quoteDueDate: input.quoteDueDate,
        },
      })
    },

    async setDemand(input: { organizationId: string; negotiationId: string; facilityId: string; quantity: number }) {
      assertPositive(input.quantity, 'Quantity')
      const [negotiation, facility] = await Promise.all([
        database.priceNegotiation.findFirst({ where: { id: input.negotiationId, organizationId: input.organizationId } }),
        database.facility.findFirst({ where: { id: input.facilityId, organizationId: input.organizationId } }),
      ])
      if (!negotiation) throw new Error('Negotiation not found')
      if (!facility) throw new Error('Facility not found')
      if (['COMPLETED', 'CANCELLED'].includes(negotiation.status)) throw new Error('Negotiation is closed')
      return database.negotiationDemand.upsert({
        where: { negotiationId_facilityId: { negotiationId: negotiation.id, facilityId: facility.id } },
        update: { quantity: input.quantity },
        create: { negotiationId: negotiation.id, facilityId: facility.id, quantity: input.quantity },
      })
    },

    async addQuote(input: { organizationId: string; negotiationId: string; distributorId: string; unitPriceYen: number; minimumQuantity?: number }) {
      assertPositive(input.unitPriceYen, 'Unit price')
      assertOptionalPositive(input.minimumQuantity, 'Minimum quantity')
      const [negotiation, distributor, latest] = await Promise.all([
        database.priceNegotiation.findFirst({ where: { id: input.negotiationId, organizationId: input.organizationId } }),
        database.distributor.findFirst({ where: { id: input.distributorId, organizationId: input.organizationId } }),
        database.negotiationQuote.findFirst({
          where: { negotiationId: input.negotiationId, distributorId: input.distributorId },
          orderBy: { roundNumber: 'desc' },
        }),
      ])
      if (!negotiation) throw new Error('Negotiation not found')
      if (!distributor) throw new Error('Distributor not found')
      if (['COMPLETED', 'CANCELLED'].includes(negotiation.status)) throw new Error('Negotiation is closed')
      const quote = await database.negotiationQuote.create({
        data: {
          negotiationId: negotiation.id,
          distributorId: distributor.id,
          roundNumber: (latest?.roundNumber ?? 0) + 1,
          unitPriceYen: input.unitPriceYen,
          minimumQuantity: input.minimumQuantity,
        },
      })
      if (negotiation.status === 'DRAFT') {
        await database.priceNegotiation.update({ where: { id: negotiation.id }, data: { status: 'COLLECTING_QUOTES', version: { increment: 1 } } })
      }
      return quote
    },

    async selectQuote(input: { organizationId: string; negotiationId: string; quoteId: string }) {
      return database.$transaction(async (transaction) => {
        const negotiation = await transaction.priceNegotiation.findFirst({
          where: { id: input.negotiationId, organizationId: input.organizationId },
          include: { demands: true },
        })
        if (!negotiation) throw new Error('Negotiation not found')
        const quote = await transaction.negotiationQuote.findFirst({
          where: { id: input.quoteId, negotiationId: negotiation.id },
        })
        if (!quote) throw new Error('Quote not found')
        const quantity = negotiation.demands.reduce((sum, demand) => sum + demand.quantity, 0)
        if (quote.minimumQuantity !== null && quote.minimumQuantity > quantity) throw new Error('Minimum quantity is not met')
        await transaction.negotiationQuote.updateMany({ where: { negotiationId: negotiation.id }, data: { isSelected: false } })
        await transaction.negotiationQuote.update({ where: { id: quote.id }, data: { isSelected: true } })
        await transaction.priceNegotiation.update({ where: { id: negotiation.id }, data: { status: 'NEGOTIATING', version: { increment: 1 } } })
      })
    },

    async complete(input: { organizationId: string; negotiationId: string; validFrom: Date }) {
      return database.$transaction(async (transaction) => {
        const negotiation = await transaction.priceNegotiation.findFirst({
          where: { id: input.negotiationId, organizationId: input.organizationId },
          include: { quotes: { where: { isSelected: true } } },
        })
        if (!negotiation) throw new Error('Negotiation not found')
        if (negotiation.status === 'COMPLETED') throw new Error('Negotiation is already completed')
        const quote = negotiation.quotes[0]
        if (!quote) throw new Error('Selected quote is required')

        const previous = await transaction.contractPrice.findFirst({
          where: {
            organizationProductId: negotiation.organizationProductId,
            distributorId: quote.distributorId,
            validFrom: { lt: input.validFrom },
            validTo: null,
          },
          orderBy: { validFrom: 'desc' },
        })
        if (previous) {
          const validTo = new Date(input.validFrom)
          validTo.setUTCDate(validTo.getUTCDate() - 1)
          await transaction.contractPrice.update({ where: { id: previous.id }, data: { validTo } })
        }
        await transaction.contractPrice.create({
          data: {
            organizationProductId: negotiation.organizationProductId,
            distributorId: quote.distributorId,
            contractPriceYen: quote.unitPriceYen,
            validFrom: input.validFrom,
          },
        })
        return transaction.priceNegotiation.update({
          where: { id: negotiation.id },
          data: { status: 'COMPLETED', completedAt: new Date(), contractValidFrom: input.validFrom, version: { increment: 1 } },
        })
      })
    },
  }
}

function assertPositive(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label} must be a positive integer`)
}

function assertOptionalPositive(value: number | undefined, label: string) {
  if (value !== undefined) assertPositive(value, label)
}
