import { createDatabaseClient } from '../server/db/client'
import { seedCatalogDatabase } from '../server/db/catalog-seed'
import { seedDatabase } from '../server/db/seed'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not configured')
}

const database = createDatabaseClient(databaseUrl)

try {
  await seedDatabase(database)
  await seedCatalogDatabase(database)
} finally {
  await database.$disconnect()
}
