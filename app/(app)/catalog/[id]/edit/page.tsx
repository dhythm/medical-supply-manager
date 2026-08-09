import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PageHeader } from '@/components/app-shell'
import { ProductDeleteControl } from '@/components/product-delete-control'
import { ProductRegistrationForm } from '@/components/product-registration-form'
import { Panel } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createProductRepository } from '@/server/repositories/product-repository'

import { deleteProductAction, updateProductAction } from './actions'

type ProductEditPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductEditPage({ params, searchParams }: ProductEditPageProps) {
  const { id } = await params
  const query = await searchParams
  const organization = await getCurrentOrganization()
  const product = await createProductRepository(getDatabaseClient()).getById({
    organizationId: organization.id,
    organizationProductId: id,
  })
  if (!product) notFound()

  const error = single(query.error)
  const saved = single(query.saved) === '1'
  const updateAction = updateProductAction.bind(null, product.id, product.version)
  const deleteAction = deleteProductAction.bind(null, product.id, product.version)

  return (
    <>
      <PageHeader
        eyebrow="商品マスタ"
        title="商品を編集"
        actions={
          <Button nativeButton={false} variant="outline" render={<Link href="/catalog" />}>
            <ArrowLeft aria-hidden="true" />
            商品マスタへ戻る
          </Button>
        }
      />
      <div className="mx-auto grid max-w-[1200px] gap-5 px-5 py-6 md:px-8 md:py-8">
        {saved ? (
          <p className="border-primary/30 bg-primary/5 text-primary rounded-lg border px-4 py-3 text-sm">
            商品を更新しました
          </p>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {error}
          </p>
        ) : null}

        <Panel title="商品情報" hint={product.registrationSource}>
          <ProductRegistrationForm
            action={updateAction}
            submitLabel="変更を保存"
            initialValue={product}
            disableUntilChanged
          />
        </Panel>

        <Panel title="商品を削除">
          <ProductDeleteControl action={deleteAction} productName={product.name} />
        </Panel>
      </div>
    </>
  )
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
