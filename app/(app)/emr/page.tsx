import { Cloud, History, Server } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createEmrRepository } from '@/server/repositories/emr-repository'

import { changeEmrStatusAction, saveEmrConnectionAction } from './actions'

export const dynamic = 'force-dynamic'

const statusLabel = { DRAFT: '下書き', READY: '設定完了', PAUSED: '停止中' } as const
const transportLabel = { REST_API: 'REST API', SS_MIX2: 'SS-MIX2', SFTP: 'SFTP', CSV_BATCH: 'CSV' } as const
const syncLabel = {
  PENDING: '待機',
  RUNNING: '実行中',
  SUCCEEDED: '成功',
  FAILED: '失敗',
  CANCELLED: '取消',
} as const

export default async function EmrPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const organization = await getCurrentOrganization()
  const result = await createEmrRepository(getDatabaseClient()).list(organization.id)
  const error = value(params.error)

  return (
    <>
      <PageHeader eyebrow="システム連携" title="電子カルテ連携" />
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        {result.hasSampleData ? (
          <div>
            <Badge variant="outline">サンプルデータを表示中</Badge>
          </div>
        ) : null}
        {error ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="接続設定" value={`${result.connectionCount}施設`} />
          <StatCard label="設定完了" value={`${result.readyCount}施設`} />
          <StatCard label="要確認" value={`${result.needsAttentionCount}件`} tone="warn" />
          <StatCard
            label="最終成功同期"
            value={result.latestSuccessAt ? formatDateTime(result.latestSuccessAt) : '履歴なし'}
          />
        </div>

        <Panel title="接続設定">
          <div className="grid gap-4 lg:grid-cols-2">
            {result.facilities.map((facility) => (
              <article key={facility.facilityId} className="border-border rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{facility.facilityName}</h2>
                    {facility.connectionId ? (
                      <p className="text-muted-foreground mt-1 text-xs">
                        {facility.vendorName} ・ {facility.systemName}
                      </p>
                    ) : null}
                  </div>
                  {facility.status ? (
                    <Badge variant={facility.status === 'READY' ? 'default' : 'secondary'}>
                      {statusLabel[facility.status]}
                    </Badge>
                  ) : (
                    <Badge variant="outline">未設定</Badge>
                  )}
                </div>
                {facility.connectionId ? (
                  <>
                    <div className="text-muted-foreground mt-4 flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        {facility.deploymentType === 'CLOUD' ? (
                          <Cloud className="size-3.5" />
                        ) : (
                          <Server className="size-3.5" />
                        )}
                        {facility.deploymentType === 'CLOUD' ? 'クラウド' : '院内設置'}
                      </span>
                      <span>{facility.transport ? transportLabel[facility.transport] : '—'}</span>
                      <span>{facility.direction === 'BIDIRECTIONAL' ? '双方向' : '受信のみ'}</span>
                      <span>{facility.schedule ?? '予定なし'}</span>
                    </div>
                    <form action={changeEmrStatusAction} className="mt-4 flex gap-2">
                      <input type="hidden" name="connectionId" value={facility.connectionId} />
                      <select
                        name="status"
                        defaultValue={facility.status ?? 'DRAFT'}
                        className="border-input bg-background h-8 rounded-lg border px-2 text-xs"
                      >
                        <option value="DRAFT">下書き</option>
                        <option value="READY">設定完了</option>
                        <option value="PAUSED">停止中</option>
                      </select>
                      <Button type="submit" variant="outline">
                        状態を更新
                      </Button>
                    </form>
                  </>
                ) : null}
                <details className="mt-4">
                  <summary className="text-primary cursor-pointer text-xs font-medium">
                    {facility.connectionId ? '設定を編集' : '設定を追加'}
                  </summary>
                  <form action={saveEmrConnectionAction} className="mt-3 grid grid-cols-2 gap-2">
                    <input type="hidden" name="facilityId" value={facility.facilityId} />
                    <label className="grid gap-1 text-xs">
                      ベンダー
                      <Input name="vendorName" defaultValue={facility.vendorName ?? ''} required />
                    </label>
                    <label className="grid gap-1 text-xs">
                      システム名
                      <Input name="systemName" defaultValue={facility.systemName ?? ''} required />
                    </label>
                    <label className="grid gap-1 text-xs">
                      配置
                      <select
                        name="deploymentType"
                        defaultValue={facility.deploymentType ?? 'CLOUD'}
                        className="border-input bg-background h-8 rounded-lg border px-2"
                      >
                        <option value="CLOUD">クラウド</option>
                        <option value="ON_PREMISES">院内設置</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs">
                      転送方式
                      <select
                        name="transport"
                        defaultValue={facility.transport ?? 'REST_API'}
                        className="border-input bg-background h-8 rounded-lg border px-2"
                      >
                        <option value="REST_API">REST API</option>
                        <option value="SS_MIX2">SS-MIX2</option>
                        <option value="SFTP">SFTP</option>
                        <option value="CSV_BATCH">CSV</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs">
                      方向
                      <select
                        name="direction"
                        defaultValue={facility.direction ?? 'INBOUND_ONLY'}
                        className="border-input bg-background h-8 rounded-lg border px-2"
                      >
                        <option value="INBOUND_ONLY">受信のみ</option>
                        <option value="BIDIRECTIONAL">双方向</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-xs">
                      同期予定
                      <Input name="schedule" defaultValue={facility.schedule ?? ''} />
                    </label>
                    <label className="grid col-span-2 gap-1 text-xs">
                      接続先URL
                      <Input name="endpointUrl" type="url" defaultValue={facility.endpointUrl ?? ''} />
                    </label>
                    <div className="col-span-2">
                      <Button type="submit">保存</Button>
                    </div>
                  </form>
                </details>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="同期履歴">
          <ul className="divide-border divide-y">
            {result.facilities
              .flatMap((facility) =>
                facility.syncRuns.map((run) => ({ ...run, facilityName: facility.facilityName })),
              )
              .map((run) => (
                <li key={run.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <History className="text-muted-foreground size-4" />
                  <span className="flex-1 text-sm">{run.facilityName}</span>
                  <span className="text-muted-foreground text-xs">{formatDateTime(run.startedAt)}</span>
                  <span className="font-mono text-xs">
                    受信 {run.receivedCount} / 除外 {run.rejectedCount}
                  </span>
                  <Badge variant={run.status === 'SUCCEEDED' ? 'default' : 'outline'}>
                    {syncLabel[run.status]}
                  </Badge>
                </li>
              ))}
            {result.facilities.every((facility) => facility.syncRuns.length === 0) ? (
              <li className="text-muted-foreground text-sm">同期履歴はありません。</li>
            ) : null}
          </ul>
        </Panel>
      </div>
    </>
  )
}

function value(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item
}
function formatDateTime(item: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Tokyo',
  }).format(new Date(item))
}
