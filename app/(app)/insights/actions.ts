'use server'
import type { DataAssetCategory, DataAssetReviewOutcome, DataClassification } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createDataGovernanceRepository } from '@/server/repositories/data-governance-repository'

export async function createDataAssetAction(formData: FormData) {
  const target = await run(async (organizationId, repository) => repository.create({
    organizationId, code: text(formData, 'code'), name: text(formData, 'name'),
    category: text(formData, 'category') as DataAssetCategory,
    classification: text(formData, 'classification') as DataClassification,
    purpose: text(formData, 'purpose'), retentionDays: optionalNumber(formData, 'retentionDays'),
    reviewIntervalDays: number(formData, 'reviewIntervalDays'), nextReviewAt: date(formData, 'nextReviewAt'),
  }))
  redirect(target)
}

export async function reviewDataAssetAction(formData: FormData) {
  const target = await run(async (organizationId, repository) => repository.review({
    organizationId, assetId: text(formData, 'assetId'), outcome: text(formData, 'outcome') as DataAssetReviewOutcome,
    note: optionalText(formData, 'note'), nextReviewAt: date(formData, 'nextReviewAt'),
  }))
  redirect(target)
}

async function run(action: (organizationId: string, repository: ReturnType<typeof createDataGovernanceRepository>) => Promise<unknown>) {
  try { const organization = await getCurrentOrganization(); await action(organization.id, createDataGovernanceRepository(getDatabaseClient())); revalidatePath('/insights'); return '/insights?updated=1' }
  catch (error) { return `/insights?error=${encodeURIComponent(error instanceof Error ? error.message : '更新できませんでした')}` }
}
function text(data: FormData, key: string) { const result = String(data.get(key) ?? '').trim(); if (!result) throw new Error('必須項目を入力してください'); return result }
function optionalText(data: FormData, key: string) { return String(data.get(key) ?? '').trim() || undefined }
function number(data: FormData, key: string) { const result = Number(text(data, key)); if (!Number.isInteger(result) || result <= 0) throw new Error('日数は1以上で入力してください'); return result }
function optionalNumber(data: FormData, key: string) { return optionalText(data, key) ? number(data, key) : undefined }
function date(data: FormData, key: string) { const result = new Date(`${text(data, key)}T00:00:00Z`); if (Number.isNaN(result.getTime())) throw new Error('日付を確認してください'); return result }
