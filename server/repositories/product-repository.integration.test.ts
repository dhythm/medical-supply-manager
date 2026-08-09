import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDatabaseClient } from '@/server/db/client'
import { seedCatalogDatabase } from '@/server/db/catalog-seed'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'
import { createProductRepository } from '@/server/repositories/product-repository'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test'

const database = createDatabaseClient(databaseUrl)
const repository = createProductRepository(database)

describe('product repository', () => {
  let organizationId = ''

  beforeAll(async () => {
    await resetDatabase(database)

    await seedDatabase(database)
    await seedCatalogDatabase(database)
    await seedCatalogDatabase(database)

    const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })
    organizationId = organization.id
  })

  afterAll(async () => {
    await database.$disconnect()
  })

  it('seeds the sample catalog idempotently', async () => {
    await expect(database.organizationProduct.count({ where: { organizationId } })).resolves.toBe(8)
    await expect(
      database.organizationProduct.count({ where: { organizationId, registrationSource: 'SAMPLE' } }),
    ).resolves.toBe(8)
  })

  it('searches by name, GTIN, approval number, and business code', async () => {
    for (const query of ['ロキソプロフェン', '4987080114458', '22400AMX00891000', 'P-100243']) {
      const result = await repository.list({ organizationId, query })
      expect(result.items).toHaveLength(1)
      expect(result.items[0].businessCode).toBe('P-100243')
    }
  })

  it('combines category and origin filters', async () => {
    const result = await repository.list({
      organizationId,
      category: '医療材料',
      origin: '海外製',
    })

    expect(result.items).toHaveLength(3)
    expect(result.items.every((item) => item.category === '医療材料')).toBe(true)
    expect(result.items.every((item) => item.origin === '海外製')).toBe(true)
  })

  it('paginates within an organization scope', async () => {
    const result = await repository.list({ organizationId, page: 2, pageSize: 3 })

    expect(result.items).toHaveLength(3)
    expect(result.totalCount).toBe(8)
    expect(result.totalPages).toBe(3)
  })

  it('registers an editable AI candidate in the organization catalog', async () => {
    const result = await repository.register({
      organizationId,
      businessCode: 'P-200001',
      name: 'サージカルマスク',
      category: '医療材料',
      origin: '国内製',
      manufacturerName: 'テストメディカル',
      manufacturerCountry: '日本',
      gtin: '4900000000001',
      approvalNumber: null,
      regulatoryCode: null,
      unit: '箱',
      lookupQuery: 'マスク',
    })

    expect(result.businessCode).toBe('P-200001')
    await expect(
      database.organizationProduct.findUniqueOrThrow({
        where: { organizationId_businessCode: { organizationId, businessCode: 'P-200001' } },
        include: { product: { include: { manufacturer: true } }, aliases: true },
      }),
    ).resolves.toMatchObject({
      registrationSource: 'AI_ASSISTED_DUMMY',
      product: { name: 'サージカルマスク', manufacturer: { name: 'テストメディカル' } },
      aliases: [{ name: 'マスク', normalizedName: 'マスク' }],
    })
    await expect(repository.list({ organizationId, query: 'P-200001' })).resolves.toMatchObject({
      items: [{ name: 'サージカルマスク', registrationSource: 'AI補完（ダミー応答）' }],
    })
  })

  it('rejects duplicate business codes and products already registered to the organization', async () => {
    const existing = await database.organizationProduct.findFirstOrThrow({
      where: { organizationId, product: { gtin: { not: null } } },
      include: { product: true },
    })
    const input = {
      organizationId,
      businessCode: existing.businessCode,
      name: '重複商品',
      category: '医療材料',
      origin: '国内製',
      manufacturerName: '重複メーカー',
      manufacturerCountry: '日本',
      gtin: '4900000000999',
      approvalNumber: null,
      regulatoryCode: null,
      unit: '箱',
      lookupQuery: '重複商品',
    }

    await expect(repository.register(input)).rejects.toThrow('この院内コードは登録済みです')
    await expect(
      repository.register({ ...input, businessCode: 'P-200002', gtin: existing.product.gtin }),
    ).rejects.toThrow('この商品は商品マスタに登録済みです')
  })
})
