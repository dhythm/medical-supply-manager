'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { optionalFormText, productFieldsFromFormData } from '@/server/products/product-form'
import { createProductRepository } from '@/server/repositories/product-repository'

export async function registerManualProductAction(formData: FormData) {
  await register(formData, 'MANUAL')
}

export async function registerAiProductAction(formData: FormData) {
  await register(formData, 'AI_ASSISTED_DUMMY')
}

async function register(formData: FormData, registrationSource: 'MANUAL' | 'AI_ASSISTED_DUMMY') {
  const lookupQuery = optionalFormText(formData, 'lookupQuery')
  const mode = registrationSource === 'MANUAL' ? 'manual' : 'ai'
  let target: string
  try {
    if (registrationSource === 'AI_ASSISTED_DUMMY' && !lookupQuery)
      throw new Error('検索語を確認してください')
    const organization = await getCurrentOrganization()
    const result = await createProductRepository(getDatabaseClient()).register({
      organizationId: organization.id,
      registrationSource,
      ...productFieldsFromFormData(formData),
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
