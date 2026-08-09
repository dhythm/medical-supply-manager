import { ArrowRight, TriangleAlert } from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/app-shell'
import { MeterBar, Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { kpis, originShare, registrationQueue, workloadBreakdown } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Overview / 城南医療グループ"
        title="購買業務の工数は、商品登録に偏っている"
        description="用度課12名の作業時間を工程別に計測。商品登録・マスタ整備が全体の約半分を占め、その大部分がAIによる自動収集で置き換え可能です。"
        actions={
          <Button nativeButton={false} render={<Link href="/registration" />}>
            AI商品登録を試す
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        }
      />

      <div className="grid gap-4 px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <StatCard key={k.label} {...k} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Panel
            title="購買業務の工数内訳"
            hint="濃い部分 = AIで置き換え可能と推定される範囲"
            className="lg:col-span-3"
          >
            <ul className="flex flex-col gap-4">
              {workloadBreakdown.map((w) => (
                <li key={w.task}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm">{w.task}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {w.ratio}% <span className="opacity-60">/ 自動化余地 {w.aiReducible}%</span>
                    </p>
                  </div>
                  <div className="bg-secondary mt-2 h-3 w-full overflow-hidden rounded-sm">
                    <div
                      className="bg-secondary-foreground/25 relative h-full"
                      style={{ width: `${w.ratio * 2}%` }}
                    >
                      <div
                        className="bg-primary h-full"
                        style={{ width: `${w.aiReducible}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground border-border mt-5 border-t pt-4 text-xs leading-relaxed">
              商品登録の48%に自動化余地82%を適用すると、購買業務全体で約39%の工数削減に相当します。
            </p>
          </Panel>

          <Panel
            title="海外製比率"
            hint="供給リスクと代替品検討の起点"
            className="lg:col-span-2"
          >
            <ul className="flex flex-col gap-4">
              {originShare.map((o) => (
                <li key={o.category}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm">{o.category}</p>
                    <p className="font-mono text-xs">
                      海外 {o.overseas}%
                    </p>
                  </div>
                  <MeterBar value={o.overseas} tone="accent" className="mt-2" />
                </li>
              ))}
            </ul>
            <div className="border-accent/50 bg-accent/10 mt-5 flex gap-2 rounded-md border p-3">
              <TriangleAlert className="text-accent-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="text-accent-foreground text-xs leading-relaxed">
                医療材料の約7割が海外製。為替・輸送影響を受けやすく、代替品候補をマスタ側で常時保持する設計にしています。
              </p>
            </div>
          </Panel>
        </div>

        <Panel title="登録キュー" hint="AIが下書きした登録案の承認待ち">
          <ul className="divide-border divide-y">
            {registrationQueue.map((q) => (
              <li key={q.name} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                <p className="min-w-0 flex-1 text-sm">{q.name}</p>
                <p className="text-muted-foreground font-mono text-xs">{q.source}</p>
                <Badge variant={q.status === 'AI下書き完了' ? 'default' : 'outline'}>{q.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
