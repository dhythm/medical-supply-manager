'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createPriceNegotiationRepository } from '@/server/repositories/price-negotiation-repository'

export async function createNegotiationAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.create({
      organizationId,
      organizationProductId: requiredText(formData, 'organizationProductId'),
      title: requiredText(formData, 'title'),
      baselineUnitPriceYen: optionalPositiveInteger(formData, 'baselineUnitPriceYen'),
      targetUnitPriceYen: optionalPositiveInteger(formData, 'targetUnitPriceYen'),
      quoteDueDate: optionalDate(formData, 'quoteDueDate'),
    })
  })
  redirect(result)
}

export async function setDemandAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.setDemand({
      organizationId,
      negotiationId: requiredText(formData, 'negotiationId'),
      facilityId: requiredText(formData, 'facilityId'),
      quantity: positiveInteger(formData, 'quantity'),
    })
  })
  redirect(result)
}

export async function addQuoteAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.addQuote({
      organizationId,
      negotiationId: requiredText(formData, 'negotiationId'),
      distributorId: requiredText(formData, 'distributorId'),
      unitPriceYen: positiveInteger(formData, 'unitPriceYen'),
      minimumQuantity: optionalPositiveInteger(formData, 'minimumQuantity'),
    })
  })
  redirect(result)
}

export async function selectQuoteAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.selectQuote({
      organizationId,
      negotiationId: requiredText(formData, 'negotiationId'),
      quoteId: requiredText(formData, 'quoteId'),
    })
  })
  redirect(result)
}

export async function completeNegotiationAction(formData: FormData) {
  const result = await run(async (organizationId, repository) => {
    await repository.complete({
      organizationId,
      negotiationId: requiredText(formData, 'negotiationId'),
      validFrom: requiredDate(formData, 'validFrom'),
    })
  })
  redirect(result)
}

async function run(action: (organizationId: string, repository: ReturnType<typeof createPriceNegotiationRepository>) => Promise<void>) {
  try {
    const organization = await getCurrentOrganization()
    await action(organization.id, createPriceNegotiationRepository(getDatabaseClient()))
    revalidatePath('/group-buying')
    revalidatePath('/catalog')
    return '/group-buying?updated=1'
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新できませんでした'
    return `/group-buying?error=${encodeURIComponent(message)}`
  }
}

function requiredText(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? '').trim()
  if (!value) throw new Error('必須項目を入力してください')
  return value
}

function positiveInteger(formData: FormData, name: string) {
  const value = Number(requiredText(formData, name))
  if (!Number.isInteger(value) || value <= 0) throw new Error('数量・価格は1以上で入力してください')
  return value
}

function optionalPositiveInteger(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? '').trim()
  return raw ? positiveInteger(formData, name) : undefined
}

function optionalDate(formData: FormData, name: string) {
  const raw = String(formData.get(name) ?? '').trim()
  return raw ? parseDate(raw) : undefined
}

function requiredDate(formData: FormData, name: string) {
  return parseDate(requiredText(formData, name))
}

function parseDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) throw new Error('日付を確認してください')
  return date
}
