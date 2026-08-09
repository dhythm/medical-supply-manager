'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createProductRepository } from '@/server/repositories/product-repository'

const categories = ['医薬品', '医療材料', '医療機器', '一般消耗品'] as const
const origins = ['国内製', '海外製'] as const

export async function registerProductAction(formData: FormData) {
  const query = String(formData.get('lookupQuery') ?? '').trim()
  let target: string
  try {
    if (!query) throw new Error('検索語を確認してください')
    const organization = await getCurrentOrganization()
    const result = await createProductRepository(getDatabaseClient()).register({
      organizationId: organization.id,
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
      lookupQuery: query,
    })
    revalidatePath('/')
    revalidatePath('/catalog')
    revalidatePath('/registration')
    target = `/catalog?q=${encodeURIComponent(result.businessCode)}&registered=1`
  } catch (error) {
    const message = error instanceof Error ? error.message : '登録できませんでした'
    target = `/registration?q=${encodeURIComponent(query)}&error=${encodeURIComponent(message)}`
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
