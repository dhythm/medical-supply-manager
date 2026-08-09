'use client'

import {
  Boxes,
  Database,
  HeartHandshake,
  LayoutDashboard,
  MessagesSquare,
  Sparkles,
  Stethoscope,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const nav = [
  { href: '/', label: 'ダッシュボード', sub: '工数と充足率', icon: LayoutDashboard },
  { href: '/registration', label: 'AI商品登録', sub: '製品名から自動生成', icon: Sparkles },
  { href: '/catalog', label: '商品マスタ', sub: '医薬品・医材DB', icon: Boxes },
  { href: '/group-buying', label: '共同購入・価格', sub: '交渉と卸依存度', icon: HeartHandshake },
  { href: '/emr', label: '電子カルテ連携', sub: '使用実績の取り込み', icon: Stethoscope },
  { href: '/insights', label: 'データ提供基盤', sub: '匿名化と同意管理', icon: Database },
  { href: '/voice', label: '顧客の声・展示会', sub: '現場要望の一元化', icon: MessagesSquare },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-svh lg:w-72 lg:shrink-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="bg-sidebar-primary text-sidebar-primary-foreground grid size-9 place-items-center rounded-md font-mono text-sm font-medium">
            MB
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium tracking-wide">MEDIBASE</p>
            <p className="text-sidebar-foreground/55 text-xs">医療材料・医薬品マスタ統合基盤</p>
          </div>
        </div>

        <nav
          aria-label="主要メニュー"
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6"
        >
          {nav.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="flex flex-col leading-tight">
                  <span className="whitespace-nowrap font-medium">{item.label}</span>
                  <span className="hidden text-xs opacity-60 lg:inline">{item.sub}</span>
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="border-sidebar-border mx-5 hidden border-t pt-4 lg:block">
          <p className="text-sidebar-foreground/45 font-mono text-[11px] uppercase tracking-widest">
            接続中の施設
          </p>
          <p className="mt-2 text-sm">城南医療グループ</p>
          <p className="text-sidebar-foreground/55 text-xs">4施設 / 949床 / 用度課 12名</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string
  title: string
  description: string
  actions?: React.ReactNode
}) {
  return (
    <header className="border-border bg-card border-b px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.18em]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-balance md:text-3xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-pretty">
            {description}
          </p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
