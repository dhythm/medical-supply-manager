import { History, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/app-shell'
import { Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createDataGovernanceRepository } from '@/server/repositories/data-governance-repository'
import { createDataAssetAction, reviewDataAssetAction } from './actions'

export const dynamic = 'force-dynamic'
const categoryLabel = { MASTER: 'マスタ', PROCUREMENT: '購買', CUSTOMER_FEEDBACK: '顧客の声', EMR_AGGREGATE: 'カルテ集計' } as const
const classificationLabel = { INTERNAL: '内部', CONFIDENTIAL: '機密' } as const
const actionLabel: Record<string, string> = { CREATED: '登録', REVIEWED: 'レビュー' }

export default async function InsightsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const organization = await getCurrentOrganization()
  const result = await createDataGovernanceRepository(getDatabaseClient()).list(organization.id)
  const error = single(params.error)
  return <><PageHeader eyebrow="データ活用" title="データガバナンス" />
    <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
      {result.hasSampleData ? <div><Badge variant="outline">サンプルデータを表示中</Badge></div> : null}
      {error ? <p role="alert" className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-3"><StatCard label="データ資産" value={`${result.assetCount}件`} /><StatCard label="レビュー期限超過" value={`${result.overdueCount}件`} tone="warn" /><StatCard label="要対応" value={`${result.actionRequiredCount}件`} tone="warn" /></div>
      <Panel title="データ資産を登録">
        <form action={createDataAssetAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-1 text-xs">コード<Input name="code" required maxLength={40} /></label><label className="grid gap-1 text-xs">名称<Input name="name" required maxLength={120} /></label>
          <label className="grid gap-1 text-xs">分類<select name="category" className="border-input bg-background h-8 rounded-lg border px-2"><option value="MASTER">マスタ</option><option value="PROCUREMENT">購買</option><option value="CUSTOMER_FEEDBACK">顧客の声</option><option value="EMR_AGGREGATE">カルテ集計</option></select></label>
          <label className="grid gap-1 text-xs">機密区分<select name="classification" className="border-input bg-background h-8 rounded-lg border px-2"><option value="INTERNAL">内部</option><option value="CONFIDENTIAL">機密</option></select></label>
          <label className="grid gap-1 text-xs xl:col-span-2">利用目的<Input name="purpose" required maxLength={240} /></label><label className="grid gap-1 text-xs">保持日数<Input name="retentionDays" type="number" min={1} /></label><label className="grid gap-1 text-xs">レビュー間隔<Input name="reviewIntervalDays" type="number" min={1} defaultValue={365} required /></label><label className="grid gap-1 text-xs">次回レビュー<Input name="nextReviewAt" type="date" required /></label><div className="flex items-end"><Button type="submit">登録</Button></div>
        </form>
      </Panel>
      <Panel title="データ資産台帳">
        <div className="grid gap-3 lg:grid-cols-2">{result.items.map((asset) => <article key={asset.id} className="border-border rounded-xl border p-4">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-semibold">{asset.name}</h2><p className="text-muted-foreground mt-1 font-mono text-xs">{asset.code}</p></div><div className="flex gap-1"><Badge variant="secondary">{categoryLabel[asset.category]}</Badge><Badge variant={asset.isOverdue ? 'destructive' : 'outline'}>{asset.isOverdue ? '期限超過' : asset.nextReviewAt}</Badge></div></div>
          <p className="mt-3 text-sm">{asset.purpose}</p><p className="text-muted-foreground mt-2 text-xs">{classificationLabel[asset.classification]} ・ 保持 {asset.retentionDays ? `${asset.retentionDays}日` : '期限なし'}</p>
          <form action={reviewDataAssetAction} className="mt-4 grid grid-cols-2 gap-2"><input type="hidden" name="assetId" value={asset.id} /><label className="grid gap-1 text-xs">結果<select name="outcome" className="border-input bg-background h-8 rounded-lg border px-2"><option value="APPROVED">承認</option><option value="ACTION_REQUIRED">要対応</option></select></label><label className="grid gap-1 text-xs">次回レビュー<Input name="nextReviewAt" type="date" required /></label><label className="grid col-span-2 gap-1 text-xs">所見<Input name="note" maxLength={240} /></label><div className="col-span-2"><Button type="submit" variant="outline"><ShieldCheck className="size-4" />レビューを記録</Button></div></form>
        </article>)}{result.items.length === 0 ? <p className="text-muted-foreground text-sm">データ資産はありません。</p> : null}</div>
      </Panel>
      <Panel title="変更履歴"><ul className="divide-border divide-y">{result.auditEvents.map((event) => <li key={event.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"><History className="text-muted-foreground size-4" /><span className="flex-1 text-sm">{event.entityType}</span><Badge variant="outline">{actionLabel[event.action] ?? event.action}</Badge><span className="text-muted-foreground text-xs">{event.changedFields.join('、')}</span><span className="text-muted-foreground text-xs">{new Intl.DateTimeFormat('ja-JP', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Tokyo' }).format(new Date(event.occurredAt))}</span></li>)}{result.auditEvents.length === 0 ? <li className="text-muted-foreground text-sm">変更履歴はありません。</li> : null}</ul></Panel>
    </div></>
}
function single(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }
