import { CircleCheck, Landmark, Plus } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createPriceNegotiationRepository } from '@/server/repositories/price-negotiation-repository'

import {
  addQuoteAction,
  completeNegotiationAction,
  createNegotiationAction,
  selectQuoteAction,
  setDemandAction,
} from './actions'

export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> }

const statusLabel = {
  DRAFT: '下書き',
  COLLECTING_QUOTES: '見積収集中',
  NEGOTIATING: '交渉中',
  COMPLETED: '完了',
  CANCELLED: '取消',
} as const

export default async function GroupBuyingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const organization = await getCurrentOrganization()
  const repository = createPriceNegotiationRepository(getDatabaseClient())
  const [result, options] = await Promise.all([
    repository.list(organization.id),
    repository.getOptions(organization.id),
  ])
  const error = singleValue(params.error)

  return (
    <>
      <PageHeader eyebrow="調達分析" title="共同購入・価格交渉" />
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        {result.hasSampleData ? <div><Badge variant="outline">サンプルデータを表示中</Badge></div> : null}
        {error ? <p role="alert" className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">{error}</p> : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="進行中" value={`${result.activeCount}件`} />
          <StatCard label="参加施設" value={`${result.participatingFacilityCount}施設`} />
          <StatCard label="予定数量" value={result.totalQuantity.toLocaleString('ja-JP')} />
          <StatCard label="削減見込" value={`¥${result.estimatedSavingsYen.toLocaleString('ja-JP')}`} tone="up" />
        </div>

        <Panel title="交渉案件を作成">
          <form action={createNegotiationAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="grid gap-1 text-xs xl:col-span-2">商品
              <select name="organizationProductId" required className="border-input bg-background h-9 rounded-lg border px-3">
                <option value="">選択</option>
                {options.products.map((product) => <option key={product.id} value={product.id}>{product.label}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-xs xl:col-span-2">案件名<Input name="title" required maxLength={120} /></label>
            <label className="grid gap-1 text-xs">基準単価<Input name="baselineUnitPriceYen" type="number" min={1} /></label>
            <label className="grid gap-1 text-xs">目標単価<Input name="targetUnitPriceYen" type="number" min={1} /></label>
            <label className="grid gap-1 text-xs">見積期限<Input name="quoteDueDate" type="date" /></label>
            <div className="flex items-end xl:col-start-6"><Button type="submit"><Plus className="size-4" />作成</Button></div>
          </form>
        </Panel>

        <div className="grid gap-5">
          {result.items.map((item) => {
            const selectedQuote = item.quotes.find((quote) => quote.isSelected)
            const closed = item.status === 'COMPLETED' || item.status === 'CANCELLED'
            return (
              <article key={item.id} className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-sm">
                <header className="border-border/70 flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{item.title}</h2>
                      <Badge variant={item.status === 'COMPLETED' ? 'default' : 'secondary'}>{statusLabel[item.status]}</Badge>
                      {item.isSample ? <Badge variant="outline">サンプル</Badge> : null}
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">{item.businessCode} ・ {item.productName}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-right text-xs sm:grid-cols-4">
                    <div><dt className="text-muted-foreground">基準</dt><dd className="font-mono">{yen(item.baselineUnitPriceYen)}</dd></div>
                    <div><dt className="text-muted-foreground">最安提示</dt><dd className="font-mono">{yen(item.bestQuoteYen)}</dd></div>
                    <div><dt className="text-muted-foreground">予定数量</dt><dd className="font-mono">{item.totalQuantity.toLocaleString('ja-JP')}</dd></div>
                    <div><dt className="text-muted-foreground">削減見込</dt><dd className="text-primary font-mono">¥{item.estimatedSavingsYen.toLocaleString('ja-JP')}</dd></div>
                  </dl>
                </header>

                <div className="grid gap-5 p-5 lg:grid-cols-2">
                  <section>
                    <h3 className="text-sm font-semibold">施設別予定数量</h3>
                    <ul className="mt-3 space-y-2 text-sm">
                      {item.demands.map((demand) => <li key={demand.facilityId} className="flex justify-between gap-3"><span>{demand.facilityName}</span><span className="font-mono">{demand.quantity.toLocaleString('ja-JP')}</span></li>)}
                      {item.demands.length === 0 ? <li className="text-muted-foreground">予定数量は未登録です。</li> : null}
                    </ul>
                    {!closed ? (
                      <form action={setDemandAction} className="mt-4 flex flex-wrap items-end gap-2">
                        <input type="hidden" name="negotiationId" value={item.id} />
                        <label className="grid flex-1 gap-1 text-xs">施設<select name="facilityId" required className="border-input bg-background h-8 rounded-lg border px-2">{options.facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}</select></label>
                        <label className="grid w-28 gap-1 text-xs">数量<Input name="quantity" type="number" min={1} required /></label>
                        <Button type="submit" variant="outline">反映</Button>
                      </form>
                    ) : null}
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold">卸提示</h3>
                    <ul className="mt-3 space-y-2">
                      {item.quotes.map((quote) => (
                        <li key={quote.id} className="border-border flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                          <Landmark className="text-muted-foreground size-4" aria-hidden="true" />
                          <span className="flex-1">{quote.distributorName}</span>
                          <span className="font-mono">¥{quote.unitPriceYen.toLocaleString('ja-JP')}</span>
                          {quote.minimumQuantity ? <span className="text-muted-foreground text-xs">最低{quote.minimumQuantity}</span> : null}
                          {quote.isSelected ? <Badge><CircleCheck className="size-3" />採択</Badge> : quote.isEligible && !closed ? (
                            <form action={selectQuoteAction}><input type="hidden" name="negotiationId" value={item.id} /><input type="hidden" name="quoteId" value={quote.id} /><button className="text-primary text-xs font-medium">採択</button></form>
                          ) : <Badge variant="outline">数量未達</Badge>}
                        </li>
                      ))}
                      {item.quotes.length === 0 ? <li className="text-muted-foreground text-sm">提示価格は未登録です。</li> : null}
                    </ul>
                    {!closed ? (
                      <form action={addQuoteAction} className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <input type="hidden" name="negotiationId" value={item.id} />
                        <label className="grid gap-1 text-xs sm:col-span-2">卸<select name="distributorId" required className="border-input bg-background h-8 rounded-lg border px-2">{options.distributors.map((distributor) => <option key={distributor.id} value={distributor.id}>{distributor.name}</option>)}</select></label>
                        <label className="grid gap-1 text-xs">提示単価<Input name="unitPriceYen" type="number" min={1} required /></label>
                        <label className="grid gap-1 text-xs">最低数量<Input name="minimumQuantity" type="number" min={1} /></label>
                        <div className="sm:col-start-4"><Button type="submit" variant="outline">追加</Button></div>
                      </form>
                    ) : null}
                    {selectedQuote && !closed ? (
                      <form action={completeNegotiationAction} className="border-primary/20 bg-primary/5 mt-4 flex flex-wrap items-end gap-2 rounded-lg border p-3">
                        <input type="hidden" name="negotiationId" value={item.id} />
                        <label className="grid gap-1 text-xs">契約開始日<Input name="validFrom" type="date" required /></label>
                        <Button type="submit">契約へ反映</Button>
                      </form>
                    ) : null}
                  </section>
                </div>
              </article>
            )
          })}
          {result.items.length === 0 ? <Panel title="交渉案件"><p className="text-muted-foreground text-sm">交渉案件はありません。</p></Panel> : null}
        </div>
      </div>
    </>
  )
}

function singleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function yen(value: number | null) {
  return value === null ? '—' : `¥${value.toLocaleString('ja-JP')}`
}
