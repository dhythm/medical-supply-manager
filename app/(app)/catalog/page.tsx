import { PageHeader } from '@/components/app-shell'
import { CatalogTable } from '@/components/catalog-table'
import { StatCard } from '@/components/shared'
import { getDatabaseClient } from '@/server/db/client'
import { getCurrentOrganization } from '@/server/current-organization'
import { createProductRepository } from '@/server/repositories/product-repository'

type CatalogPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams
  const query = singleValue(params.q)
  const category = singleValue(params.category)
  const origin = singleValue(params.origin)
  const page = Math.max(1, Number(singleValue(params.page) ?? '1') || 1)
  const organization = await getCurrentOrganization()
  const repository = createProductRepository(getDatabaseClient())
  const [result, summary] = await Promise.all([
    repository.list({ organizationId: organization.id, query, category, origin, page, pageSize: 20 }),
    repository.summarize(organization.id),
  ])

  return (
    <>
      <PageHeader eyebrow="商品管理" title="商品マスタ" />
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="医薬品" value={String(summary.categoryCount['医薬品'] ?? 0)} />
          <StatCard label="医療材料" value={String(summary.categoryCount['医療材料'] ?? 0)} />
          <StatCard
            label="医療機器 / 消耗品"
            value={String(
              (summary.categoryCount['医療機器'] ?? 0) + (summary.categoryCount['一般消耗品'] ?? 0),
            )}
          />
          <StatCard label="登録メーカー" value={String(summary.manufacturerCount)} />
        </div>
        <CatalogTable
          items={result.items}
          totalCount={result.totalCount}
          query={query}
          category={category}
          origin={origin}
          page={result.page}
          totalPages={result.totalPages}
        />
      </div>
    </>
  )
}

function singleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
