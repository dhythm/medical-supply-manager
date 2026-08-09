import { ArrowDownRight, ArrowUpRight, Cloud, Server } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { MeterBar, Panel } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { consumptionSignals, emrConnections } from '@/lib/mock-data'

const statusVariant = {
  連携中: 'default',
  検証中: 'secondary',
  申請待ち: 'outline',
} as const

export default function EmrPage() {
  return (
    <>
      <PageHeader
        eyebrow="システム連携"
        title="電子カルテ連携"
      />

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        <Panel title="連携状況" hint="接続方式は電子カルテのベンダー仕様に合わせて選択">
          <ul className="grid gap-3 md:grid-cols-2">
            {emrConnections.map((c) => (
              <li key={c.hospital} className="border-border rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.hospital}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {c.vendor}
                      {c.beds > 0 ? ` ・ ${c.beds}床` : ' ・ 無床'}
                    </p>
                  </div>
                  <Badge variant={statusVariant[c.status as keyof typeof statusVariant]}>
                    {c.status}
                  </Badge>
                </div>
                <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                  {c.type === 'クラウド' ? (
                    <Cloud className="size-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <Server className="size-4 shrink-0" aria-hidden="true" />
                  )}
                  <span className="font-mono">{c.method}</span>
                </div>
                <p className="text-muted-foreground mt-2 font-mono text-[11px]">
                  最終同期 {c.lastSync}
                </p>
              </li>
            ))}
          </ul>
          <p className="text-muted-foreground border-border mt-4 border-t pt-4 text-xs leading-relaxed">
            クラウド型電子カルテは単方向（実績受信のみ）から開始し、書き戻しは在庫引当が安定してから有効化する運用を想定しています。
          </p>
        </Panel>

        <Panel title="オーダー実績から算出した在庫消費" hint="直近30日 / 診療科別">
          <ul className="flex flex-col gap-4">
            {consumptionSignals.map((s) => (
              <li key={s.product} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="min-w-56 flex-1">
                  <p className="text-sm">{s.product}</p>
                  <p className="text-muted-foreground text-xs">{s.dept}</p>
                </div>
                <p className="font-mono text-xs">{s.orders.toLocaleString('ja-JP')}件</p>
                <p
                  className={`flex items-center gap-1 font-mono text-xs ${
                    s.trend >= 0 ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {s.trend >= 0 ? (
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  ) : (
                    <ArrowDownRight className="size-3.5" aria-hidden="true" />
                  )}
                  {s.trend > 0 ? `+${s.trend}` : s.trend}%
                </p>
                <div className="w-full sm:w-40">
                  <MeterBar
                    value={(s.stockDays / 45) * 100}
                    tone={s.stockDays <= 10 ? 'accent' : 'primary'}
                  />
                  <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                    在庫日数 {s.stockDays}日
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="border-accent/50 bg-accent/10 mt-5 rounded-md border p-3">
            <p className="text-accent-foreground text-xs leading-relaxed">
              ICUの中心静脈カテーテルは使用が前月比+21%、在庫日数7日。海外製のためリードタイム18日を考慮し、発注点の引き上げを提案しています。
            </p>
          </div>
        </Panel>
      </div>
    </>
  )
}
