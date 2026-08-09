import type { PrismaClient } from '@prisma/client'

export async function resetDatabase(database: PrismaClient) {
  await database.customerFeedbackStatusChange.deleteMany()
  await database.customerFeedback.deleteMany()
  await database.auditEvent.deleteMany()
  await database.dataAssetReview.deleteMany()
  await database.dataAsset.deleteMany()
  await database.emrSyncRun.deleteMany()
  await database.emrConnection.deleteMany()
  await database.negotiationQuote.deleteMany()
  await database.negotiationDemand.deleteMany()
  await database.priceNegotiation.deleteMany()
  await database.contractPrice.deleteMany()
  await database.productAlias.deleteMany()
  await database.organizationProduct.deleteMany()
  await database.distributor.deleteMany()
  await database.product.deleteMany()
  await database.manufacturer.deleteMany()
  await database.facility.deleteMany()
  await database.organization.deleteMany()
}
