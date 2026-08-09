'use server'

import type { EmrConnectionStatus, EmrDeploymentType, EmrDirection, EmrTransport } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createEmrRepository } from '@/server/repositories/emr-repository'

export async function saveEmrConnectionAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.save({
      organizationId,
      facilityId: text(formData, 'facilityId'),
      vendorName: text(formData, 'vendorName'),
      systemName: text(formData, 'systemName'),
      deploymentType: text(formData, 'deploymentType') as EmrDeploymentType,
      transport: text(formData, 'transport') as EmrTransport,
      direction: text(formData, 'direction') as EmrDirection,
      endpointUrl: optionalText(formData, 'endpointUrl'),
      schedule: optionalText(formData, 'schedule'),
    })
  })
  redirect(result)
}

export async function changeEmrStatusAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.changeStatus({
      organizationId,
      connectionId: text(formData, 'connectionId'),
      status: text(formData, 'status') as EmrConnectionStatus,
    })
  })
  redirect(result)
}

async function run(action: (organizationId: string, repository: ReturnType<typeof createEmrRepository>) => Promise<void>) {
  try {
    const organization = await getCurrentOrganization()
    await action(organization.id, createEmrRepository(getDatabaseClient()))
    revalidatePath('/emr')
    return '/emr?updated=1'
  } catch (error) {
    return `/emr?error=${encodeURIComponent(error instanceof Error ? error.message : '更新できませんでした')}`
  }
}

function text(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? '').trim()
  if (!value) throw new Error('必須項目を入力してください')
  return value
}

function optionalText(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim() || undefined
}
