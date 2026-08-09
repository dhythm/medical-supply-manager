import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/app-shell'
import { Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createDashboardRepository } from '@/server/repositories/dashboard-repository'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const organization = await getCurrentOrganization()
  const summary = await createDashboardRepository(getDatabaseClient()).getSummary(organization.id)

  return (
    <>
      <PageHeader
        eyebrow={summary.organizationName}
        title="購買ダッシュボード"
        actions={
          <Button nativeButton={false} render={<Link href="/catalog" />}>
            商品マスタを見る
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        {summary.hasSampleData ? (
          <div>
            <Badge variant="outline">サンプルデータを表示中</Badge>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="登録商品" value={summary.totalProductCount.toLocaleString('ja-JP')} />
          <StatCard
            label="要確認"
            value={`${summary.reviewProductCount.toLocaleString('ja-JP')}件`}
            delta="充足率100%未満"
            tone="warn"
          />
          <StatCard
            label="海外調達"
            value={`${summary.overseasProductCount.toLocaleString('ja-JP')}件`}
            delta={`${summary.overseasProductRate}%`}
          />
          <StatCard label="平均充足率" value={`${summary.averageCompleteness}%`} />
        </div>

        <Panel title="最近更新された商品" hint={`${summary.recentProducts.length}件`}>
          {summary.recentProducts.length > 0 ? (
            <ul className="divide-border divide-y">
              {summary.recentProducts.map((product) => (
                <li
                  key={product.businessCode}
                  className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <CheckCircle2 className="text-muted-foreground/50 size-4 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium">{product.name}</p>
                    <p className="text-muted-foreground mt-0.5 font-mono text-xs">{product.businessCode}</p>
                  </div>
                  <p className="text-muted-foreground font-mono text-xs">{product.updatedAt}</p>
                  <Badge variant={product.completeness < 100 ? 'secondary' : 'outline'}>
                    {product.completeness}%
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">登録商品はありません。</p>
          )}
        </Panel>
      </div>
    </>
  )
}
