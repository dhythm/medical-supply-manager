import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createDatabaseClient } from '@/server/db/client'
import { seedDatabase } from '@/server/db/seed'
import { resetDatabase } from '@/server/db/test-reset'
import { createEmrRepository } from '@/server/repositories/emr-repository'

const database = createDatabaseClient(
  process.env.TEST_DATABASE_URL ??
    'postgresql://medibase:medibase_dev@127.0.0.1:55432/medical_supply_manager_test',
)
const repository = createEmrRepository(database)

describe('EMR repository', () => {
  let organizationId = ''
  let facilityId = ''

  beforeAll(async () => {
    await resetDatabase(database)
    await seedDatabase(database)
    const organization = await database.organization.findUniqueOrThrow({ where: { code: 'JONAN' } })
    organizationId = organization.id
    facilityId = (await database.facility.findFirstOrThrow({ where: { organizationId } })).id
  })

  afterAll(async () => database.$disconnect())

  it('saves one scoped connection per facility', async () => {
    await repository.save({
      organizationId,
      facilityId,
      vendorName: 'Vendor',
      systemName: 'System',
      deploymentType: 'CLOUD',
      transport: 'REST_API',
      direction: 'INBOUND_ONLY',
      schedule: '毎日 02:00',
    })
    await repository.save({
      organizationId,
      facilityId,
      vendorName: 'Updated Vendor',
      systemName: 'System',
      deploymentType: 'CLOUD',
      transport: 'REST_API',
      direction: 'INBOUND_ONLY',
    })

    const result = await repository.list(organizationId)
    expect(result.connectionCount).toBe(1)
    expect(result.facilities.find((item) => item.facilityId === facilityId)?.vendorName).toBe(
      'Updated Vendor',
    )
  })

  it('does not mark a connection as ready without its required endpoint', async () => {
    const connection = await database.emrConnection.findUniqueOrThrow({ where: { facilityId } })
    await expect(
      repository.changeStatus({ organizationId, connectionId: connection.id, status: 'READY' }),
    ).rejects.toThrow('Endpoint is required')
  })

  it('stores sync history only when explicitly appended', async () => {
    const connection = await database.emrConnection.findUniqueOrThrow({ where: { facilityId } })
    await repository.appendSyncRun({
      organizationId,
      connectionId: connection.id,
      externalRunId: 'run-1',
      status: 'SUCCEEDED',
      startedAt: new Date('2026-08-09T01:00:00.000Z'),
      finishedAt: new Date('2026-08-09T01:02:00.000Z'),
      receivedCount: 12,
      rejectedCount: 1,
    })
    await repository.appendSyncRun({
      organizationId,
      connectionId: connection.id,
      externalRunId: 'run-1',
      status: 'SUCCEEDED',
      startedAt: new Date('2026-08-09T01:00:00.000Z'),
      receivedCount: 12,
      rejectedCount: 1,
    })

    await expect(database.emrSyncRun.count()).resolves.toBe(1)
  })
})
