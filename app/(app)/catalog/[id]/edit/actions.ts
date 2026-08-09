'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { productFieldsFromFormData } from '@/server/products/product-form'
import { createProductRepository } from '@/server/repositories/product-repository'

export async function updateProductAction(
  organizationProductId: string,
  version: number,
  formData: FormData,
) {
  let target: string
  try {
    const organization = await getCurrentOrganization()
    await createProductRepository(getDatabaseClient()).update({
      organizationId: organization.id,
      organizationProductId,
      version,
      ...productFieldsFromFormData(formData),
    })
    revalidateProductPaths(organizationProductId)
    target = `/catalog/${organizationProductId}/edit?saved=1`
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新できませんでした'
    target = `/catalog/${organizationProductId}/edit?error=${encodeURIComponent(message)}`
  }
  redirect(target)
}

export async function deleteProductAction(organizationProductId: string, version: number) {
  let target: string
  try {
    const organization = await getCurrentOrganization()
    await createProductRepository(getDatabaseClient()).archive({
      organizationId: organization.id,
      organizationProductId,
      version,
    })
    revalidateProductPaths(organizationProductId)
    target = '/catalog?deleted=1'
  } catch (error) {
    const message = error instanceof Error ? error.message : '削除できませんでした'
    target = `/catalog/${organizationProductId}/edit?error=${encodeURIComponent(message)}`
  }
  redirect(target)
}

function revalidateProductPaths(organizationProductId: string) {
  revalidatePath('/')
  revalidatePath('/catalog')
  revalidatePath(`/catalog/${organizationProductId}/edit`)
  revalidatePath('/group-buying')
}
