import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

export function createDatabaseClient(databaseUrl: string) {
  const adapter = new PrismaPg({ connectionString: databaseUrl })
  return new PrismaClient({ adapter })
}

const globalDatabase = globalThis as unknown as {
  database?: ReturnType<typeof createDatabaseClient>
}

export function getDatabaseClient() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (!globalDatabase.database) {
    globalDatabase.database = createDatabaseClient(databaseUrl)
  }

  return globalDatabase.database
}
