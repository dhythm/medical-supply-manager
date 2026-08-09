import type {
  EmrConnectionStatus,
  EmrDeploymentType,
  EmrDirection,
  EmrSyncStatus,
  EmrTransport,
  PrismaClient,
} from '@prisma/client'

type SaveConnectionInput = {
  organizationId: string
  facilityId: string
  vendorName: string
  systemName: string
  deploymentType: EmrDeploymentType
  transport: EmrTransport
  direction: EmrDirection
  endpointUrl?: string
  schedule?: string
}

export function createEmrRepository(database: PrismaClient) {
  return {
    async list(organizationId: string) {
      const facilities = await database.facility.findMany({
        where: { organizationId },
        include: {
          emrConnection: {
            include: { syncRuns: { orderBy: { startedAt: 'desc' }, take: 5 } },
          },
        },
        orderBy: { code: 'asc' },
      })
      const rows = facilities.map((facility) => {
        const connection = facility.emrConnection?.archivedAt ? null : facility.emrConnection
        const latestRun = connection?.syncRuns[0]
        return {
          facilityId: facility.id,
          facilityName: facility.name,
          connectionId: connection?.id ?? null,
          vendorName: connection?.vendorName ?? null,
          systemName: connection?.systemName ?? null,
          deploymentType: connection?.deploymentType ?? null,
          transport: connection?.transport ?? null,
          direction: connection?.direction ?? null,
          endpointUrl: connection?.endpointUrl ?? null,
          schedule: connection?.schedule ?? null,
          status: connection?.status ?? null,
          isSample: connection?.isSample ?? false,
          latestRun: latestRun
            ? {
                status: latestRun.status,
                startedAt: latestRun.startedAt.toISOString(),
                receivedCount: latestRun.receivedCount,
                rejectedCount: latestRun.rejectedCount,
              }
            : null,
          syncRuns:
            connection?.syncRuns.map((run) => ({
              id: run.id,
              status: run.status,
              startedAt: run.startedAt.toISOString(),
              receivedCount: run.receivedCount,
              rejectedCount: run.rejectedCount,
            })) ?? [],
        }
      })
      const connected = rows.filter((row) => row.connectionId)
      const latestSuccess = connected
        .flatMap((row) => row.syncRuns.filter((run) => run.status === 'SUCCEEDED'))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
      return {
        facilities: rows,
        connectionCount: connected.length,
        readyCount: connected.filter((row) => row.status === 'READY').length,
        needsAttentionCount: connected.filter(
          (row) => row.status === 'DRAFT' || row.latestRun?.status === 'FAILED',
        ).length,
        latestSuccessAt: latestSuccess?.startedAt ?? null,
        hasSampleData: connected.some((row) => row.isSample),
      }
    },

    async save(input: SaveConnectionInput) {
      const vendorName = input.vendorName.trim()
      const systemName = input.systemName.trim()
      if (!vendorName || !systemName) throw new Error('Vendor and system are required')
      const facility = await database.facility.findFirst({
        where: { id: input.facilityId, organizationId: input.organizationId },
      })
      if (!facility) throw new Error('Facility not found')
      return database.emrConnection.upsert({
        where: { facilityId: facility.id },
        update: {
          vendorName,
          systemName,
          deploymentType: input.deploymentType,
          transport: input.transport,
          direction: input.direction,
          endpointUrl: clean(input.endpointUrl),
          schedule: clean(input.schedule),
          version: { increment: 1 },
        },
        create: {
          organizationId: input.organizationId,
          facilityId: facility.id,
          vendorName,
          systemName,
          deploymentType: input.deploymentType,
          transport: input.transport,
          direction: input.direction,
          endpointUrl: clean(input.endpointUrl),
          schedule: clean(input.schedule),
        },
      })
    },

    async changeStatus(input: {
      organizationId: string
      connectionId: string
      status: EmrConnectionStatus
    }) {
      const connection = await database.emrConnection.findFirst({
        where: { id: input.connectionId, organizationId: input.organizationId, archivedAt: null },
      })
      if (!connection) throw new Error('Connection not found')
      if (
        input.status === 'READY' &&
        ['REST_API', 'SFTP'].includes(connection.transport) &&
        !connection.endpointUrl
      ) {
        throw new Error('Endpoint is required')
      }
      return database.emrConnection.update({
        where: { id: connection.id },
        data: { status: input.status, version: { increment: 1 } },
      })
    },

    async appendSyncRun(input: {
      organizationId: string
      connectionId: string
      externalRunId?: string
      status: EmrSyncStatus
      startedAt: Date
      finishedAt?: Date
      receivedCount: number
      rejectedCount: number
      errorCode?: string
      errorMessage?: string
    }) {
      if (input.receivedCount < 0 || input.rejectedCount < 0) throw new Error('Counts cannot be negative')
      const connection = await database.emrConnection.findFirst({
        where: { id: input.connectionId, organizationId: input.organizationId },
      })
      if (!connection) throw new Error('Connection not found')
      const data = {
        status: input.status,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        receivedCount: input.receivedCount,
        rejectedCount: input.rejectedCount,
        errorCode: clean(input.errorCode),
        errorMessage: clean(input.errorMessage)?.replaceAll(/\s+/g, ' ').slice(0, 240),
      }
      if (input.externalRunId) {
        return database.emrSyncRun.upsert({
          where: {
            connectionId_externalRunId: {
              connectionId: connection.id,
              externalRunId: input.externalRunId,
            },
          },
          update: data,
          create: { ...data, connectionId: connection.id, externalRunId: input.externalRunId },
        })
      }
      return database.emrSyncRun.create({ data: { ...data, connectionId: connection.id } })
    },
  }
}

function clean(value?: string) {
  const normalized = value?.trim()
  return normalized || undefined
}
