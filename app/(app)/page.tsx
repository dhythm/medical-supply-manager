import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  FileWarning,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/app-shell'
import { MeterBar, Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { originShare, registrationQueue, workloadBreakdown } from '@/lib/mock-data'

const actionItems = [
  {
    label: 'AI登録案の承認',
    count: 12,
    detail: '高一致度 9件',
    href: '/registration',
    icon: Sparkles,
    tone: 'primary',
  },
  {
    label: '情報不足の確認',
    count: 8,
    detail: '承認番号・包装単位',
    href: '/catalog',
    icon: FileWarning,
    tone: 'warn',
  },
  {
    label: '重複候補の解消',
    count: 3,
    detail: '既存マスタと類似',
    href: '/registration',
    icon: CircleAlert,
    tone: 'neutral',
  },
] as const

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="城南医療グループ / 8月9日"
        title="購買ダッシュボード"
        actions={
          <Button nativeButton={false} render={<Link href="/registration" />}>
            <Sparkles className="size-4" aria-hidden="true" />
            商品を登録
          </Button>
        }
      />

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        <section aria-labelledby="today-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="today-title" className="text-base font-semibold tracking-tight">
              今日の対応
            </h2>
            <span className="text-muted-foreground text-xs">23件</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {actionItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="border-border/80 bg-card group flex items-center gap-4 rounded-xl border p-4 shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                      item.tone === 'primary'
                        ? 'bg-primary/10 text-primary'
                        : item.tone === 'warn'
                          ? 'bg-accent/20 text-accent-foreground'
                          : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="text-muted-foreground mt-0.5 block text-xs">{item.detail}</span>
                  </span>
                  <span className="font-mono text-2xl font-semibold tracking-tight">{item.count}</span>
                  <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              )
            })}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="登録済み商品" value="48,219" delta="今月 +1,204" />
          <StatCard label="AI登録率" value="76.4%" delta="前月比 +11.2pt" tone="up" />
          <StatCard label="確認を含む登録時間" value="2.4分" delta="手入力比 −87%" tone="up" />
          <StatCard label="要確認マスタ" value="312件" delta="承認番号・単位" tone="warn" />
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          <Panel title="商品登録の削減余地" className="lg:col-span-3">
            <div className="mb-5 flex items-center gap-2">
              <Badge variant="outline">ヒアリング仮説</Badge>
              <span className="text-muted-foreground text-xs">業務時間に占める割合</span>
            </div>
            <ul className="flex flex-col gap-4">
              {workloadBreakdown.map((work) => (
                <li key={work.task}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[13px] font-medium">{work.task}</p>
                    <p className="text-muted-foreground font-mono text-xs">{work.ratio}%</p>
                  </div>
                  <div className="bg-secondary mt-2 h-2.5 w-full overflow-hidden rounded-full">
                    <div className="bg-primary/25 h-full" style={{ width: `${work.ratio * 2}%` }}>
                      <div className="bg-primary h-full" style={{ width: `${work.aiReducible}%` }} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-primary/15 bg-primary/5 mt-5 flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-sm font-medium">購買業務全体の削減試算</span>
              <span className="text-primary font-mono text-xl font-semibold">39%</span>
            </div>
          </Panel>

          <Panel title="供給リスク" hint="海外製比率" className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-2">
              <Badge variant="outline">ヒアリング仮説</Badge>
              <span className="text-muted-foreground text-xs">要実測</span>
            </div>
            <ul className="flex flex-col gap-4">
              {originShare.map((origin) => (
                <li key={origin.category}>
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-medium">{origin.category}</p>
                    <p className="font-mono text-xs">{origin.overseas}%</p>
                  </div>
                  <MeterBar value={origin.overseas} tone={origin.overseas >= 60 ? 'accent' : 'muted'} className="mt-2" />
                </li>
              ))}
            </ul>
            <div className="border-accent/50 bg-accent/10 mt-5 flex items-start gap-2.5 rounded-lg border p-3">
              <TriangleAlert className="text-accent-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="text-accent-foreground text-xs leading-relaxed">
                医療材料は海外製比率が高く、代替品の整備を優先します。
              </p>
            </div>
          </Panel>
        </div>

        <Panel title="最近の登録キュー" hint="4件">
          <ul className="divide-border divide-y">
            {registrationQueue.map((item) => (
              <li key={item.name} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                <CheckCircle2 className="text-muted-foreground/50 size-4 shrink-0" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-[13px] font-medium">{item.name}</p>
                <p className="text-muted-foreground text-xs">{item.source}</p>
                <Badge variant={item.status === 'AI下書き完了' ? 'default' : 'outline'}>{item.status}</Badge>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
