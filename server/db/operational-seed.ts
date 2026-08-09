import type { PrismaClient } from '@prisma/client'

const sampleIds = {
  negotiation: '10000000-0000-4000-8000-000000000001',
  demandGeneral: '10000000-0000-4000-8000-000000000002',
  demandEast: '10000000-0000-4000-8000-000000000003',
  quote: '10000000-0000-4000-8000-000000000004',
  emrConnection: '20000000-0000-4000-8000-000000000001',
  feedback: '30000000-0000-4000-8000-000000000001',
} as const

export async function seedOperationalDatabase(database: PrismaClient) {
  const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })
  const organizationProduct = await database.organizationProduct.findUniqueOrThrow({
    where: {
      organizationId_businessCode: {
        organizationId: organization.id,
        businessCode: 'P-100244',
      },
    },
  })
  const generalFacility = await database.facility.findUniqueOrThrow({
    where: { organizationId_code: { organizationId: organization.id, code: 'JONAN-GENERAL' } },
  })
  const eastFacility = await database.facility.findUniqueOrThrow({
    where: { organizationId_code: { organizationId: organization.id, code: 'JONAN-EAST' } },
  })
  const distributor = await database.distributor.findUniqueOrThrow({
    where: { organizationId_code: { organizationId: organization.id, code: 'MUTO' } },
  })

  const negotiation = await database.priceNegotiation.upsert({
    where: { id: sampleIds.negotiation },
    update: {
      title: '中心静脈カテーテル価格交渉',
      baselineUnitPriceYen: 7310,
      targetUnitPriceYen: 6800,
      status: 'COLLECTING_QUOTES',
      quoteDueDate: new Date('2026-09-30T00:00:00.000Z'),
      isSample: true,
    },
    create: {
      id: sampleIds.negotiation,
      organizationId: organization.id,
      organizationProductId: organizationProduct.id,
      title: '中心静脈カテーテル価格交渉',
      baselineUnitPriceYen: 7310,
      targetUnitPriceYen: 6800,
      status: 'COLLECTING_QUOTES',
      quoteDueDate: new Date('2026-09-30T00:00:00.000Z'),
      isSample: true,
    },
  })

  for (const demand of [
    { id: sampleIds.demandGeneral, facilityId: generalFacility.id, quantity: 240 },
    { id: sampleIds.demandEast, facilityId: eastFacility.id, quantity: 120 },
  ]) {
    await database.negotiationDemand.upsert({
      where: { id: demand.id },
      update: { facilityId: demand.facilityId, quantity: demand.quantity },
      create: { ...demand, negotiationId: negotiation.id },
    })
  }

  await database.negotiationQuote.upsert({
    where: { id: sampleIds.quote },
    update: { unitPriceYen: 6920, minimumQuantity: 300 },
    create: {
      id: sampleIds.quote,
      negotiationId: negotiation.id,
      distributorId: distributor.id,
      unitPriceYen: 6920,
      minimumQuantity: 300,
    },
  })

  await database.emrConnection.upsert({
    where: { facilityId: generalFacility.id },
    update: {
      vendorName: 'サンプルベンダー',
      systemName: 'サンプル電子カルテ',
      deploymentType: 'CLOUD',
      transport: 'REST_API',
      direction: 'INBOUND_ONLY',
      endpointUrl: null,
      schedule: '毎日 02:00',
      status: 'DRAFT',
      archivedAt: null,
      isSample: true,
    },
    create: {
      id: sampleIds.emrConnection,
      organizationId: organization.id,
      facilityId: generalFacility.id,
      vendorName: 'サンプルベンダー',
      systemName: 'サンプル電子カルテ',
      deploymentType: 'CLOUD',
      transport: 'REST_API',
      schedule: '毎日 02:00',
      isSample: true,
    },
  })

  const assets = [
    {
      code: 'PRODUCT_MASTER',
      name: '商品マスタ',
      category: 'MASTER' as const,
      classification: 'INTERNAL' as const,
      purpose: '購買商品と認可情報の管理',
      retentionDays: null,
      nextReviewAt: new Date('2027-04-01T00:00:00.000Z'),
    },
    {
      code: 'CONTRACT_PRICE',
      name: '契約価格',
      category: 'PROCUREMENT' as const,
      classification: 'CONFIDENTIAL' as const,
      purpose: '仕入価格と契約期間の管理',
      retentionDays: 2555,
      nextReviewAt: new Date('2027-04-01T00:00:00.000Z'),
    },
  ]
  for (const asset of assets) {
    await database.dataAsset.upsert({
      where: { organizationId_code: { organizationId: organization.id, code: asset.code } },
      update: { ...asset, archivedAt: null, isSample: true },
      create: { ...asset, organizationId: organization.id, isSample: true },
    })
  }

  await database.customerFeedback.upsert({
    where: { id: sampleIds.feedback },
    update: {
      title: '商品情報の更新箇所を一覧で確認したい',
      summary: '商品マスタ更新時に、変更された項目だけを確認できるようにしてほしい。',
      source: 'CUSTOMER_VISIT',
      department: 'PROCUREMENT',
      impact: 'MEDIUM',
      status: 'NEW',
      capturedAt: new Date('2026-08-08T00:00:00.000Z'),
      archivedAt: null,
      isSample: true,
    },
    create: {
      id: sampleIds.feedback,
      organizationId: organization.id,
      title: '商品情報の更新箇所を一覧で確認したい',
      summary: '商品マスタ更新時に、変更された項目だけを確認できるようにしてほしい。',
      source: 'CUSTOMER_VISIT',
      department: 'PROCUREMENT',
      impact: 'MEDIUM',
      capturedAt: new Date('2026-08-08T00:00:00.000Z'),
      isSample: true,
    },
  })
}
