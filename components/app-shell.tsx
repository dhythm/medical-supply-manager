'use client'

import {
  Boxes,
  Building2,
  Database,
  HeartHandshake,
  LayoutDashboard,
  MessagesSquare,
  Stethoscope,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: '購買業務',
    items: [
      { href: '/', label: 'ダッシュボード', icon: LayoutDashboard, ready: true },
      { href: '/catalog', label: '商品マスタ', icon: Boxes, ready: true },
      { href: '/group-buying', label: '共同購入・価格', icon: HeartHandshake, ready: true },
    ],
  },
  {
    label: '連携・活用',
    items: [
      { href: '/emr', label: '電子カルテ連携', icon: Stethoscope, ready: true },
      { href: '/insights', label: 'データガバナンス', icon: Database, ready: false },
      { href: '/voice', label: '顧客の声', icon: MessagesSquare, ready: false },
    ],
  },
]

export function AppShell({
  children,
  organization,
}: {
  children: React.ReactNode
  organization: { name: string; facilityCount: number; bedCount: number }
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground lg:sticky lg:top-0 lg:h-svh lg:w-64 lg:shrink-0">
        <div className="flex items-center gap-3 px-5 py-5 lg:py-6">
          <span className="bg-sidebar-primary text-sidebar grid size-10 place-items-center rounded-xl font-mono text-sm font-bold shadow-sm">
            M
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-[0.12em]">MEDIBASE</p>
            <p className="text-sidebar-foreground/50 mt-1 text-[11px]">医療購買マネジメント</p>
          </div>
        </div>

        <nav
          aria-label="主要メニュー"
          className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:overflow-visible lg:pb-6"
        >
          {navGroups.map((group) => (
            <div key={group.label} className="contents lg:block lg:not-first:mt-7">
              <p className="text-sidebar-foreground/35 mb-2 hidden px-3 text-[10px] font-semibold tracking-[0.16em] lg:block">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors lg:mb-1',
                      active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                        : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                    )}
                  >
                    {active ? <span className="bg-sidebar-primary absolute inset-y-2 left-0 w-0.5 rounded-full" /> : null}
                    <Icon className={cn('size-4 shrink-0', active && 'text-sidebar-primary')} aria-hidden="true" />
                    <span className="whitespace-nowrap font-medium">{item.label}</span>
                    {!item.ready ? (
                      <span className="text-sidebar-foreground/40 ml-auto hidden text-[10px] lg:inline">準備中</span>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="border-sidebar-border mx-4 mt-auto hidden border-t pt-4 lg:block">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
            <span className="bg-sidebar-accent grid size-8 place-items-center rounded-lg">
              <Building2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium">{organization.name}</p>
              <p className="text-sidebar-foreground/45 mt-0.5 text-[11px]">
                {organization.facilityCount}施設 ・ {organization.bedCount.toLocaleString('ja-JP')}床
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:max-w-[calc(100vw-16rem)]">{children}</main>
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
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="border-border/70 bg-card/85 border-b px-5 py-6 backdrop-blur md:px-8 md:py-7">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-primary text-[10px] font-bold uppercase tracking-[0.18em]">
            {eyebrow}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] text-balance md:text-[1.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="text-muted-foreground mt-2 max-w-xl text-[13px] leading-relaxed text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  )
}
