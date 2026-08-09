import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { seedCatalogDatabase } from '@/server/db/catalog-seed'
import { createDatabaseClient } from '@/server/db/client'
import { seedOperationalDatabase } from '@/server/db/operational-seed'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test'

const database = createDatabaseClient(databaseUrl)

describe('operational sample data', () => {
  beforeAll(async () => {
    await resetDatabase(database)
    await seedDatabase(database)
    await seedCatalogDatabase(database)
    await seedOperationalDatabase(database)
    await seedOperationalDatabase(database)
  })

  afterAll(async () => {
    await database.$disconnect()
  })

  it('seeds each operational feature idempotently', async () => {
    await expect(database.priceNegotiation.count({ where: { isSample: true } })).resolves.toBe(1)
    await expect(database.emrConnection.count({ where: { isSample: true } })).resolves.toBe(1)
    await expect(database.dataAsset.count({ where: { isSample: true } })).resolves.toBe(2)
    await expect(database.customerFeedback.count({ where: { isSample: true } })).resolves.toBe(1)
  })

  it('does not create fictitious EMR synchronization history', async () => {
    await expect(database.emrSyncRun.count()).resolves.toBe(0)
  })
})
