'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createProductRepository } from '@/server/repositories/product-repository'

const categories = ['医薬品', '医療材料', '医療機器', '一般消耗品'] as const
const origins = ['国内製', '海外製'] as const

export async function registerManualProductAction(formData: FormData) {
  await register(formData, 'MANUAL')
}

export async function registerAiProductAction(formData: FormData) {
  await register(formData, 'AI_ASSISTED_DUMMY')
}

async function register(formData: FormData, registrationSource: 'MANUAL' | 'AI_ASSISTED_DUMMY') {
  const lookupQuery = optionalText(formData, 'lookupQuery')
  const mode = registrationSource === 'MANUAL' ? 'manual' : 'ai'
  let target: string
  try {
    if (registrationSource === 'AI_ASSISTED_DUMMY' && !lookupQuery)
      throw new Error('検索語を確認してください')
    const organization = await getCurrentOrganization()
    const result = await createProductRepository(getDatabaseClient()).register({
      organizationId: organization.id,
      registrationSource,
      businessCode: text(formData, 'businessCode'),
      name: text(formData, 'name'),
      category: allowed(formData, 'category', categories),
      origin: allowed(formData, 'origin', origins),
      manufacturerName: text(formData, 'manufacturerName'),
      manufacturerCountry: text(formData, 'manufacturerCountry'),
      gtin: optionalText(formData, 'gtin'),
      approvalNumber: optionalText(formData, 'approvalNumber'),
      regulatoryCode: optionalText(formData, 'regulatoryCode'),
      unit: text(formData, 'unit'),
      lookupQuery,
    })
    revalidatePath('/')
    revalidatePath('/catalog')
    target = `/catalog?q=${encodeURIComponent(result.businessCode)}&registered=1`
  } catch (error) {
    const message = error instanceof Error ? error.message : '登録できませんでした'
    const params = new URLSearchParams({ mode, error: message })
    if (lookupQuery) params.set('q', lookupQuery)
    target = `/catalog/new?${params.toString()}`
  }
  redirect(target)
}

function text(data: FormData, key: string) {
  const result = String(data.get(key) ?? '').trim()
  if (!result) throw new Error('必須項目を入力してください')
  return result
}

function optionalText(data: FormData, key: string) {
  return String(data.get(key) ?? '').trim() || null
}

function allowed<const Value extends string>(data: FormData, key: string, values: readonly Value[]) {
  const result = text(data, key)
  if (!values.includes(result as Value)) throw new Error('選択項目を確認してください')
  return result
}
