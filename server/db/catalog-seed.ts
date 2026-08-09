import type { PrismaClient } from '@prisma/client'

import { products } from '@/lib/mock-data'

const distributorCode = new Map([
  ['メディセオ', 'MEDISEO'],
  ['スズケン', 'SUZUKEN'],
  ['アルフレッサ', 'ALFRESA'],
  ['ムトウ', 'MUTO'],
  ['ミスミ', 'MISUMI'],
])

export async function seedCatalogDatabase(database: PrismaClient) {
  const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })

  for (const item of products) {
    const manufacturer = await database.manufacturer.upsert({
      where: { name: item.maker },
      update: { countryName: item.makerCountry },
      create: { name: item.maker, countryName: item.makerCountry },
    })

    const product = await database.product.upsert({
      where: { gtin: item.jan },
      update: {
        name: item.name,
        category: item.category,
        origin: item.origin,
        approvalNumber: item.approvalNo === '—' ? null : item.approvalNo,
        regulatoryCode: item.regulatoryCode === '—' ? null : item.regulatoryCode,
        unit: item.unit,
        manufacturerId: manufacturer.id,
      },
      create: {
        gtin: item.jan,
        name: item.name,
        category: item.category,
        origin: item.origin,
        approvalNumber: item.approvalNo === '—' ? null : item.approvalNo,
        regulatoryCode: item.regulatoryCode === '—' ? null : item.regulatoryCode,
        unit: item.unit,
        manufacturerId: manufacturer.id,
      },
    })

    const organizationProduct = await database.organizationProduct.upsert({
      where: {
        organizationId_businessCode: {
          organizationId: organization.id,
          businessCode: item.id,
        },
      },
      update: {
        productId: product.id,
        registrationSource: 'DEMO',
        completeness: item.completeness,
        usedInEmr: item.usedInEmr,
        isActive: true,
      },
      create: {
        organizationId: organization.id,
        productId: product.id,
        businessCode: item.id,
        registrationSource: 'DEMO',
        completeness: item.completeness,
        usedInEmr: item.usedInEmr,
      },
    })

    const distributor = await database.distributor.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: distributorCode.get(item.distributor) ?? item.distributor,
        },
      },
      update: { name: item.distributor },
      create: {
        organizationId: organization.id,
        code: distributorCode.get(item.distributor) ?? item.distributor,
        name: item.distributor,
      },
    })

    await database.contractPrice.upsert({
      where: {
        organizationProductId_distributorId_validFrom: {
          organizationProductId: organizationProduct.id,
          distributorId: distributor.id,
          validFrom: new Date('2026-01-01T00:00:00.000Z'),
        },
      },
      update: {
        listPriceYen: item.listPrice,
        contractPriceYen: item.contractPrice,
      },
      create: {
        organizationProductId: organizationProduct.id,
        distributorId: distributor.id,
        listPriceYen: item.listPrice,
        contractPriceYen: item.contractPrice,
        validFrom: new Date('2026-01-01T00:00:00.000Z'),
      },
    })
  }
}
