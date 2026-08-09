import { Lock, ShieldCheck } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { Panel } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { guardrails, insightPanels } from '@/lib/mock-data'

export default function InsightsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Data Products / Governance"
        title="価値の高いデータほど、扱いは慎重に設計する"
        description="どの施設のどの診療科でどの製品が使われているかは、製薬企業や医材メーカーにとって価値の高い情報です。一方でレセプトや健診データは要配慮個人情報にあたるため、同意・匿名化・提供記録を仕組みとして先に用意します。"
        actions={
          <Badge variant="outline">
            <ShieldCheck className="size-3" aria-hidden="true" />
            個人情報保護方針 v3.2 適用中
          </Badge>
        }
      />

      <div className="grid gap-4 px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-3 md:grid-cols-2">
          {insightPanels.map((p) => (
            <article key={p.title} className="border-border bg-card rounded-md border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium">{p.title}</h2>
                  <p className="text-muted-foreground mt-1 text-xs">提供先: {p.consumer}</p>
                </div>
                <Badge variant={p.risk === '高' ? 'destructive' : 'secondary'}>
                  リスク {p.risk}
                </Badge>
              </div>

              <dl className="text-muted-foreground mt-3 flex flex-col gap-1.5 text-xs">
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 opacity-70">粒度</dt>
                  <dd className="text-foreground font-mono">{p.granularity}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 opacity-70">データ源</dt>
                  <dd className="text-foreground">{p.dataset}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 shrink-0 opacity-70">同意</dt>
                  <dd className="text-foreground">{p.consent}</dd>
                </div>
              </dl>

              <p className="text-muted-foreground border-border mt-3 border-t pt-3 text-xs leading-relaxed">
                {p.note}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Panel
            title="ガードレール"
            hint="提供前に自動判定される制約"
            className="lg:col-span-3"
          >
            <ul className="flex flex-col gap-2.5">
              {guardrails.map((g) => (
                <li key={g} className="flex gap-2.5 text-sm leading-relaxed">
                  <Lock className="text-primary mt-1 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="MRが持ち帰れる情報の範囲" className="lg:col-span-2">
            <ul className="divide-border divide-y text-sm">
              <li className="flex items-center justify-between gap-3 pb-2.5">
                <span>施設グループ単位の採用製品</span>
                <Badge>提供可</Badge>
              </li>
              <li className="flex items-center justify-between gap-3 py-2.5">
                <span>診療科単位の処方傾向（k=8）</span>
                <Badge>提供可</Badge>
              </li>
              <li className="flex items-center justify-between gap-3 py-2.5">
                <span>医師個人の処方明細</span>
                <Badge variant="destructive">不可</Badge>
              </li>
              <li className="flex items-center justify-between gap-3 pt-2.5">
                <span>卸会社から取得した取引情報</span>
                <Badge variant="destructive">再提供不可</Badge>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  )
}
