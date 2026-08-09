import { getDatabaseClient } from '@/server/db/client'

export async function getCurrentOrganization() {
  return getDatabaseClient().organization.findUniqueOrThrow({ where: { code: 'JONAN' } })
}
