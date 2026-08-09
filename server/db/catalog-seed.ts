import type { PrismaClient } from '@prisma/client'

import { sampleCatalog } from '@/server/db/sample-catalog'

const distributorCode = new Map([
  ['メディセオ', 'MEDISEO'],
  ['スズケン', 'SUZUKEN'],
  ['アルフレッサ', 'ALFRESA'],
  ['ムトウ', 'MUTO'],
  ['ミスミ', 'MISUMI'],
])

export async function seedCatalogDatabase(database: PrismaClient) {
  const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })

  for (const item of sampleCatalog) {
    const manufacturer = await database.manufacturer.upsert({
      where: { name: item.manufacturerName },
      update: { countryName: item.manufacturerCountry },
      create: { name: item.manufacturerName, countryName: item.manufacturerCountry },
    })

    const product = await database.product.upsert({
      where: { gtin: item.gtin },
      update: {
        name: item.name,
        category: item.category,
        origin: item.origin,
        approvalNumber: item.approvalNumber,
        regulatoryCode: item.regulatoryCode,
        unit: item.unit,
        manufacturerId: manufacturer.id,
      },
      create: {
        gtin: item.gtin,
        name: item.name,
        category: item.category,
        origin: item.origin,
        approvalNumber: item.approvalNumber,
        regulatoryCode: item.regulatoryCode,
        unit: item.unit,
        manufacturerId: manufacturer.id,
      },
    })

    const organizationProduct = await database.organizationProduct.upsert({
      where: {
        organizationId_businessCode: {
          organizationId: organization.id,
          businessCode: item.businessCode,
        },
      },
      update: {
        productId: product.id,
        registrationSource: 'SAMPLE',
        completeness: item.completeness,
        usedInEmr: item.usedInEmr,
        isActive: true,
      },
      create: {
        organizationId: organization.id,
        productId: product.id,
        businessCode: item.businessCode,
        registrationSource: 'SAMPLE',
        completeness: item.completeness,
        usedInEmr: item.usedInEmr,
      },
    })

    const distributor = await database.distributor.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: distributorCode.get(item.distributorName) ?? item.distributorName,
        },
      },
      update: { name: item.distributorName },
      create: {
        organizationId: organization.id,
        code: distributorCode.get(item.distributorName) ?? item.distributorName,
        name: item.distributorName,
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
        listPriceYen: item.listPriceYen,
        contractPriceYen: item.contractPriceYen,
      },
      create: {
        organizationProductId: organizationProduct.id,
        distributorId: distributor.id,
        listPriceYen: item.listPriceYen,
        contractPriceYen: item.contractPriceYen,
        validFrom: new Date('2026-01-01T00:00:00.000Z'),
      },
    })
  }
}
