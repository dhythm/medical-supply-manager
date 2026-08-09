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
      registrationSource: 'AI_ASSISTED_DUMMY',
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

  it('registers a manually entered product without creating an AI lookup alias', async () => {
    const result = await repository.register({
      organizationId,
      registrationSource: 'MANUAL',
      businessCode: 'P-200010',
      name: '手動登録テスト商品',
      category: '一般消耗品',
      origin: '国内製',
      manufacturerName: '手動登録メーカー',
      manufacturerCountry: '日本',
      gtin: '4900000000018',
      approvalNumber: null,
      regulatoryCode: null,
      unit: '個',
      lookupQuery: null,
    })

    expect(result.businessCode).toBe('P-200010')
    await expect(
      database.organizationProduct.findUniqueOrThrow({
        where: { organizationId_businessCode: { organizationId, businessCode: 'P-200010' } },
        include: { aliases: true },
      }),
    ).resolves.toMatchObject({ registrationSource: 'MANUAL', aliases: [] })
    await expect(repository.list({ organizationId, query: 'P-200010' })).resolves.toMatchObject({
      items: [{ name: '手動登録テスト商品', registrationSource: '手動登録' }],
    })
  })

  it('updates an organization product with optimistic locking and an audit event', async () => {
    const created = await repository.register({
      organizationId,
      registrationSource: 'MANUAL',
      businessCode: 'P-200020',
      name: '更新前の商品',
      category: '一般消耗品',
      origin: '国内製',
      manufacturerName: '更新前メーカー',
      manufacturerCountry: '日本',
      gtin: '4900000000025',
      approvalNumber: null,
      regulatoryCode: null,
      unit: '個',
      lookupQuery: null,
    })

    const detail = await repository.getById({ organizationId, organizationProductId: created.id })
    expect(detail).toMatchObject({ businessCode: 'P-200020', version: 1, name: '更新前の商品' })

    const updated = await repository.update({
      organizationId,
      organizationProductId: created.id,
      version: detail!.version,
      businessCode: 'P-200021',
      name: '更新後の商品',
      category: '医療材料',
      origin: '海外製',
      manufacturerName: '更新後メーカー',
      manufacturerCountry: 'ドイツ',
      gtin: '4900000000032',
      approvalNumber: 'APPROVAL-1',
      regulatoryCode: 'REGULATORY-1',
      unit: '箱',
    })

    expect(updated.version).toBe(2)
    await expect(
      repository.getById({ organizationId, organizationProductId: created.id }),
    ).resolves.toMatchObject({
      businessCode: 'P-200021',
      name: '更新後の商品',
      manufacturerName: '更新後メーカー',
      manufacturerCountry: 'ドイツ',
      version: 2,
    })
    await expect(
      database.auditEvent.findFirstOrThrow({
        where: {
          organizationId,
          entityType: 'ORGANIZATION_PRODUCT',
          entityId: created.id,
          action: 'UPDATED',
        },
      }),
    ).resolves.toMatchObject({
      changedFields: expect.arrayContaining(['businessCode', 'name', 'manufacturerName']),
    })

    await expect(
      repository.update({
        organizationId,
        organizationProductId: created.id,
        version: 1,
        businessCode: 'P-200022',
        name: '競合更新',
        category: '医療材料',
        origin: '海外製',
        manufacturerName: '更新後メーカー',
        manufacturerCountry: 'ドイツ',
        gtin: '4900000000032',
        approvalNumber: 'APPROVAL-1',
        regulatoryCode: 'REGULATORY-1',
        unit: '箱',
      }),
    ).rejects.toThrow('商品は別の操作で更新されています')
  })

  it('soft deletes only the organization-scoped product and records the deletion', async () => {
    const created = await repository.register({
      organizationId,
      registrationSource: 'MANUAL',
      businessCode: 'P-200030',
      name: '削除対象の商品',
      category: '一般消耗品',
      origin: '国内製',
      manufacturerName: '削除対象メーカー',
      manufacturerCountry: '日本',
      gtin: '4900000000049',
      approvalNumber: null,
      regulatoryCode: null,
      unit: '個',
      lookupQuery: null,
    })

    await expect(
      repository.archive({
        organizationId: '00000000-0000-0000-0000-000000000001',
        organizationProductId: created.id,
        version: created.version,
      }),
    ).rejects.toThrow('商品が見つかりません')

    await repository.archive({ organizationId, organizationProductId: created.id, version: created.version })

    await expect(
      repository.getById({ organizationId, organizationProductId: created.id }),
    ).resolves.toBeNull()
    await expect(repository.list({ organizationId, query: 'P-200030' })).resolves.toMatchObject({ items: [] })
    await expect(database.product.findUnique({ where: { id: created.productId } })).resolves.not.toBeNull()
    await expect(
      database.auditEvent.findFirstOrThrow({
        where: {
          organizationId,
          entityType: 'ORGANIZATION_PRODUCT',
          entityId: created.id,
          action: 'DELETED',
        },
      }),
    ).resolves.toMatchObject({ changedFields: ['isActive'] })
  })

  it('rejects duplicate business codes and products already registered to the organization', async () => {
    const existing = await database.organizationProduct.findFirstOrThrow({
      where: { organizationId, product: { gtin: { not: null } } },
      include: { product: true },
    })
    const input = {
      organizationId,
      registrationSource: 'AI_ASSISTED_DUMMY' as const,
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
