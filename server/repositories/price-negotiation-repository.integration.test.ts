import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { seedCatalogDatabase } from '@/server/db/catalog-seed'
import { createDatabaseClient } from '@/server/db/client'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'
import { createPriceNegotiationRepository } from '@/server/repositories/price-negotiation-repository'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test'

const database = createDatabaseClient(databaseUrl)
const repository = createPriceNegotiationRepository(database)

describe('price negotiation repository', () => {
  let organizationId = ''
  let organizationProductId = ''
  let facilityId = ''
  let distributorId = ''

  beforeAll(async () => {
    await resetDatabase(database)
    await seedDatabase(database)
    await seedCatalogDatabase(database)
    const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })
    organizationId = organization.id
    organizationProductId = (
      await database.organizationProduct.findFirstOrThrow({ where: { organizationId } })
    ).id
    facilityId = (await database.facility.findFirstOrThrow({ where: { organizationId } })).id
    distributorId = (await database.distributor.findFirstOrThrow({ where: { organizationId } })).id
  })

  afterAll(async () => database.$disconnect())

  it('creates and summarizes a negotiation from persisted demand and quotes', async () => {
    const negotiation = await repository.create({
      organizationId,
      organizationProductId,
      title: '価格交渉テスト',
      baselineUnitPriceYen: 1000,
      targetUnitPriceYen: 850,
    })
    await repository.setDemand({ organizationId, negotiationId: negotiation.id, facilityId, quantity: 100 })
    await repository.addQuote({
      organizationId,
      negotiationId: negotiation.id,
      distributorId,
      unitPriceYen: 900,
      minimumQuantity: 50,
    })

    const result = await repository.list(organizationId)
    const item = result.items.find((row) => row.id === negotiation.id)

    expect(item).toMatchObject({ totalQuantity: 100, bestQuoteYen: 900, estimatedSavingsYen: 10000 })
  })

  it('rejects resources owned by another organization', async () => {
    const other = await database.organization.create({ data: { code: 'OTHER', name: '他法人' } })
    const otherFacility = await database.facility.create({
      data: { organizationId: other.id, code: 'OTHER-1', name: '他施設' },
    })
    const negotiation = await repository.create({
      organizationId,
      organizationProductId,
      title: '組織境界テスト',
    })

    await expect(
      repository.setDemand({
        organizationId,
        negotiationId: negotiation.id,
        facilityId: otherFacility.id,
        quantity: 1,
      }),
    ).rejects.toThrow('Facility not found')
  })

  it('selects a quote and creates the effective contract price atomically', async () => {
    const negotiation = await repository.create({
      organizationId,
      organizationProductId,
      title: '契約反映テスト',
      baselineUnitPriceYen: 1000,
    })
    await repository.setDemand({ organizationId, negotiationId: negotiation.id, facilityId, quantity: 10 })
    const quote = await repository.addQuote({
      organizationId,
      negotiationId: negotiation.id,
      distributorId,
      unitPriceYen: 800,
    })
    await repository.selectQuote({ organizationId, negotiationId: negotiation.id, quoteId: quote.id })
    await repository.complete({
      organizationId,
      negotiationId: negotiation.id,
      validFrom: new Date('2027-01-01T00:00:00.000Z'),
    })

    await expect(
      database.contractPrice.count({
        where: { organizationProductId, distributorId, contractPriceYen: 800 },
      }),
    ).resolves.toBe(1)
    await expect(database.priceNegotiation.findUniqueOrThrow({ where: { id: negotiation.id } })).resolves.toMatchObject({
      status: 'COMPLETED',
    })
  })
})
