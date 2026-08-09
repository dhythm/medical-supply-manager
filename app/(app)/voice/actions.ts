'use server'

import type { FeedbackDepartment, FeedbackImpact, FeedbackSource, FeedbackStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createCustomerFeedbackRepository } from '@/server/repositories/customer-feedback-repository'

const sources = ['EXHIBITION', 'CUSTOMER_VISIT', 'INTERVIEW', 'SUPPORT', 'OTHER'] as const
const departments = ['PROCUREMENT', 'PHARMACY', 'CLINICAL', 'MANAGEMENT', 'OTHER'] as const
const impacts = ['LOW', 'MEDIUM', 'HIGH'] as const
const statuses = ['NEW', 'REVIEWING', 'PLANNED', 'COMPLETED', 'DECLINED'] as const

export async function createCustomerFeedbackAction(formData: FormData) {
  const target = await run(async (organizationId, repository) =>
    repository.create({
      organizationId,
      title: text(formData, 'title'),
      summary: text(formData, 'summary'),
      source: enumValue(formData, 'source', sources) as FeedbackSource,
      department: enumValue(formData, 'department', departments) as FeedbackDepartment,
      impact: enumValue(formData, 'impact', impacts) as FeedbackImpact,
      capturedAt: date(formData, 'capturedAt'),
    }),
  )
  redirect(target)
}

export async function updateCustomerFeedbackStatusAction(formData: FormData) {
  const target = await run(async (organizationId, repository) =>
    repository.updateStatus({
      organizationId,
      feedbackId: text(formData, 'feedbackId'),
      version: positiveInteger(formData, 'version'),
      status: enumValue(formData, 'status', statuses) as FeedbackStatus,
      reason: optionalText(formData, 'reason'),
    }),
  )
  redirect(target)
}

async function run(
  action: (
    organizationId: string,
    repository: ReturnType<typeof createCustomerFeedbackRepository>,
  ) => Promise<unknown>,
) {
  try {
    const organization = await getCurrentOrganization()
    await action(organization.id, createCustomerFeedbackRepository(getDatabaseClient()))
    revalidatePath('/voice')
    return '/voice?updated=1'
  } catch (error) {
    return `/voice?error=${encodeURIComponent(error instanceof Error ? error.message : '更新できませんでした')}`
  }
}

function text(data: FormData, key: string) {
  const result = String(data.get(key) ?? '').trim()
  if (!result) throw new Error('必須項目を入力してください')
  return result
}

function optionalText(data: FormData, key: string) {
  return String(data.get(key) ?? '').trim() || undefined
}

function enumValue<const Value extends string>(data: FormData, key: string, values: readonly Value[]) {
  const result = text(data, key)
  if (!values.includes(result as Value)) throw new Error('選択項目を確認してください')
  return result as Value
}

function positiveInteger(data: FormData, key: string) {
  const result = Number(text(data, key))
  if (!Number.isInteger(result) || result < 1) throw new Error('更新情報を確認してください')
  return result
}

function date(data: FormData, key: string) {
  const result = new Date(`${text(data, key)}T00:00:00Z`)
  if (Number.isNaN(result.getTime())) throw new Error('日付を確認してください')
  return result
}
