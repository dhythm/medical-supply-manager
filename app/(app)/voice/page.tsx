import { CalendarDays } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createCustomerFeedbackRepository } from '@/server/repositories/customer-feedback-repository'

import { createCustomerFeedbackAction, updateCustomerFeedbackStatusAction } from './actions'

export const dynamic = 'force-dynamic'

const sourceLabel = {
  EXHIBITION: '展示会',
  CUSTOMER_VISIT: '顧客訪問',
  INTERVIEW: 'インタビュー',
  SUPPORT: 'サポート',
  OTHER: 'その他',
} as const
const departmentLabel = {
  PROCUREMENT: '購買',
  PHARMACY: '薬剤',
  CLINICAL: '診療',
  MANAGEMENT: '経営',
  OTHER: 'その他',
} as const
const impactLabel = { LOW: '低', MEDIUM: '中', HIGH: '高' } as const
const statusLabel = {
  NEW: '新規',
  REVIEWING: '確認中',
  PLANNED: '対応予定',
  COMPLETED: '完了',
  DECLINED: '見送り',
} as const

export default async function VoicePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const organization = await getCurrentOrganization()
  const result = await createCustomerFeedbackRepository(getDatabaseClient()).list(organization.id)
  const error = single(params.error)

  return (
    <>
      <PageHeader eyebrow="顧客理解" title="顧客の声" />
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

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="新規" value={`${result.newCount}件`} />
          <StatCard label="確認中" value={`${result.reviewingCount}件`} />
          <StatCard label="重要度 高" value={`${result.highImpactCount}件`} tone="warn" />
        </div>

        <Panel title="顧客の声を登録">
          <form action={createCustomerFeedbackAction} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <label className="grid gap-1 text-xs md:col-span-2 xl:col-span-3">
              件名
              <Input name="title" required maxLength={120} />
            </label>
            <label className="grid gap-1 text-xs">
              受付経路
              <select name="source" className="border-input bg-background h-8 rounded-lg border px-2">
                {Object.entries(sourceLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs">
              部門
              <select name="department" className="border-input bg-background h-8 rounded-lg border px-2">
                {Object.entries(departmentLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs">
              重要度
              <select name="impact" className="border-input bg-background h-8 rounded-lg border px-2">
                <option value="LOW">低</option>
                <option value="MEDIUM">中</option>
                <option value="HIGH">高</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs md:col-span-2 xl:col-span-4">
              内容
              <textarea
                name="summary"
                required
                maxLength={1000}
                rows={3}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
              />
            </label>
            <label className="grid gap-1 text-xs">
              受付日
              <Input name="capturedAt" type="date" required />
            </label>
            <div className="flex items-end">
              <Button type="submit">登録</Button>
            </div>
          </form>
        </Panel>

        <Panel title="顧客の声一覧" hint={`${result.items.length}件`}>
          <div className="grid gap-3 lg:grid-cols-2">
            {result.items.map((item) => (
              <article key={item.id} className="border-border rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{item.title}</h2>
                      {item.isSample ? <Badge variant="outline">サンプル</Badge> : null}
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{item.summary}</p>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant={item.impact === 'HIGH' ? 'destructive' : 'secondary'}>
                      重要度 {impactLabel[item.impact]}
                    </Badge>
                    <Badge variant="outline">{statusLabel[item.status]}</Badge>
                  </div>
                </div>

                <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <span>{sourceLabel[item.source]}</span>
                  <span>{departmentLabel[item.department]}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" aria-hidden="true" />
                    {formatDate(item.capturedAt)}
                  </span>
                </div>

                <form action={updateCustomerFeedbackStatusAction} className="mt-4 grid gap-2 sm:grid-cols-3">
                  <input type="hidden" name="feedbackId" value={item.id} />
                  <input type="hidden" name="version" value={item.version} />
                  <label className="grid gap-1 text-xs">
                    状態
                    <select name="status" className="border-input bg-background h-8 rounded-lg border px-2">
                      {Object.entries(statusLabel)
                        .filter(([value]) => value !== item.status)
                        .map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-xs">
                    変更理由
                    <Input name="reason" maxLength={240} />
                  </label>
                  <div className="flex items-end">
                    <Button type="submit" variant="outline">
                      状態を更新
                    </Button>
                  </div>
                </form>
              </article>
            ))}
            {result.items.length === 0 ? (
              <p className="text-muted-foreground text-sm">顧客の声はありません。</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </>
  )
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}
