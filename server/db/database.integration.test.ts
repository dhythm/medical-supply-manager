import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDatabaseClient } from '@/server/db/client'
import { checkDatabaseConnection } from '@/server/db/health'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'

const databaseUrl =
  process.env.TEST_DATABASE_URL ??
  'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test'

const database = createDatabaseClient(databaseUrl)

describe('database foundation', () => {
  beforeAll(async () => {
    await resetDatabase(database)
  })

  afterAll(async () => {
    await database.$disconnect()
  })

  it('reports a healthy database connection', async () => {
    await expect(checkDatabaseConnection(database)).resolves.toBe(true)
  })

  it('seeds the initial organization idempotently', async () => {
    await seedDatabase(database)
    await seedDatabase(database)

    await expect(database.organization.count()).resolves.toBe(1)
    await expect(database.facility.count()).resolves.toBe(4)
  })
})
