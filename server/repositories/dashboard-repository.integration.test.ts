import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDatabaseClient } from '@/server/db/client'
import { seedCatalogDatabase } from '@/server/db/catalog-seed'
import { seedDatabase } from '@/server/db/seed'
import { createDashboardRepository } from '@/server/repositories/dashboard-repository'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test'

const database = createDatabaseClient(databaseUrl)
const repository = createDashboardRepository(database)

describe('dashboard repository', () => {
  let organizationId = ''

  beforeAll(async () => {
    await database.contractPrice.deleteMany()
    await database.productAlias.deleteMany()
    await database.organizationProduct.deleteMany()
    await database.distributor.deleteMany()
    await database.product.deleteMany()
    await database.manufacturer.deleteMany()
    await database.facility.deleteMany()
    await database.organization.deleteMany()

    await seedDatabase(database)
    await seedCatalogDatabase(database)
    const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })
    organizationId = organization.id
  })

  afterAll(async () => {
    await database.$disconnect()
  })

  it('summarizes only database records for the organization', async () => {
    const summary = await repository.getSummary(organizationId)

    expect(summary).toMatchObject({
      organizationName: '城南医療グループ',
      facilityCount: 4,
      bedCount: 949,
      totalProductCount: 8,
      reviewProductCount: 5,
      overseasProductCount: 5,
      overseasProductRate: 62.5,
      averageCompleteness: 87.9,
      hasSampleData: true,
    })
    expect(summary.recentProducts).toHaveLength(4)
  })

  it('excludes inactive and other organizations records', async () => {
    const inactive = await database.organizationProduct.findFirstOrThrow({ where: { organizationId } })
    await database.organizationProduct.update({
      where: { id: inactive.id },
      data: { isActive: false },
    })
    const otherOrganization = await database.organization.create({ data: { code: 'OTHER', name: '他法人' } })
    await database.facility.create({
      data: { organizationId: otherOrganization.id, code: 'OTHER-01', name: '他施設', bedCount: 999 },
    })

    const summary = await repository.getSummary(organizationId)

    expect(summary.totalProductCount).toBe(7)
    expect(summary.facilityCount).toBe(4)
    expect(summary.bedCount).toBe(949)

    await database.organizationProduct.update({ where: { id: inactive.id }, data: { isActive: true } })
  })
})
