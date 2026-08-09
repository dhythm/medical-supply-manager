import type { PrismaClient } from '@prisma/client'

export async function checkDatabaseConnection(database: PrismaClient) {
  await database.$queryRaw`SELECT 1`
  return true
}
