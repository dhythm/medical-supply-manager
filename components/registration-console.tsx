'use client'

import { Check, CircleDot, Copy, Loader2, RotateCcw, Search, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { candidates, fetchSteps, type Candidate } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Phase = 'idle' | 'fetching' | 'candidates' | 'registered'

const presets = ['静脈留置針 24G セーフティ', 'ロキソプロフェン 60mg 錠', '弾性包帯 75mm', 'アルコール綿 単包']

export function RegistrationConsole() {
  const [query, setQuery] = useState('静脈留置針 24G セーフティ')
  const [phase, setPhase] = useState<Phase>('idle')
  const [doneSteps, setDoneSteps] = useState(0)
  const [selected, setSelected] = useState<Candidate>(candidates[0])
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    return () => timers.current.forEach(clearTimeout)
  }, [])

  function start() {
    if (!query.trim()) return
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('fetching')
    setDoneSteps(0)

    let elapsed = 0
    fetchSteps.forEach((step, i) => {
      elapsed += step.latencyMs
      timers.current.push(setTimeout(() => setDoneSteps(i + 1), elapsed))
    })
    timers.current.push(
      setTimeout(() => {
        setSelected(candidates[0])
        setPhase('candidates')
      }, elapsed + 400),
    )
  }

  function reset() {
    timers.current.forEach(clearTimeout)
    setPhase('idle')
    setDoneSteps(0)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-5">
      {/* 入力 + 取得ログ ------------------------------------------------ */}
      <section className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)] lg:col-span-2">
        <div className="border-border/70 border-b px-5 py-4">
          <h2 className="text-[15px] font-semibold">製品を検索</h2>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) start()
                }}
                placeholder="例: 滅菌注射針 23G"
                aria-label="製品名"
                className="pl-9"
              />
            </div>
            <Button
              onClick={start}
              disabled={phase === 'fetching'}
              aria-label={phase === 'fetching' ? '製品情報を取得中' : '製品情報を検索'}
            >
              {phase === 'fetching' ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  <span className="sr-only">製品情報を取得中</span>
                </>
              ) : (
                '検索'
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuery(p)}
                className="border-border text-muted-foreground hover:border-primary/60 hover:text-foreground min-h-8 rounded-full border px-3 py-1 text-xs transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="border-border/70 bg-secondary/35 border-t px-5 py-4">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.1em]">
            照合先
          </p>
          <ol className="mt-3 flex flex-col gap-2.5">
            {fetchSteps.map((step, i) => {
              const done = doneSteps > i
              const running = phase === 'fetching' && doneSteps === i
              return (
                <li key={step.source} className="flex gap-2.5">
                  <span className="mt-0.5 shrink-0">
                    {done ? (
                      <Check className="text-primary size-4" aria-hidden="true" />
                    ) : running ? (
                      <Loader2 className="text-primary size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <CircleDot className="text-muted-foreground/40 size-4" aria-hidden="true" />
                    )}
                  </span>
                  <div className={cn('min-w-0', !done && !running && 'opacity-45')}>
                    <p className="font-mono text-xs">{step.source}</p>
                    <p className="text-muted-foreground text-xs leading-relaxed">{step.detail}</p>
                  </div>
                  {done ? <span className="text-primary ml-auto shrink-0 text-[11px]">確認済み</span> : null}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* 候補 + 登録 ---------------------------------------------------- */}
      <section className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)] lg:col-span-3">
        <div className="border-border/70 flex min-h-16 items-center justify-between gap-3 border-b px-5 py-3.5">
          <div>
            <h2 className="text-sm font-medium">
              {phase === 'registered' ? '登録完了' : '候補を確認'}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {phase === 'candidates' || phase === 'registered' ? `${candidates.length}件の候補` : '未検索'}
            </p>
          </div>
          {phase !== 'idle' ? (
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden="true" />
              やり直す
            </Button>
          ) : null}
        </div>

        {phase === 'idle' || phase === 'fetching' ? (
          <div className="grid min-h-80 place-items-center p-8">
            <p
              role={phase === 'fetching' ? 'status' : undefined}
              className="text-muted-foreground max-w-sm text-center text-sm leading-relaxed text-pretty"
            >
              {phase === 'fetching'
                ? '公的情報を照合しています…'
                : '製品名を検索すると候補が表示されます'}
            </p>
          </div>
        ) : null}

        {phase === 'candidates' ? (
          <div className="flex flex-col gap-3 p-5">
            {candidates.map((c, index) => {
              const active = selected.name === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelected(c)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-xl border p-4 text-left transition-colors',
                    active ? 'border-primary bg-primary/[0.045] ring-primary/10 ring-2' : 'border-border hover:border-primary/50',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      {index === 0 ? <Badge>推奨</Badge> : null}
                      <p className="min-w-0 text-sm font-semibold">{c.name}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 font-mono text-xs',
                        c.confidence >= 90
                          ? 'text-primary'
                          : c.confidence >= 70
                            ? 'text-accent-foreground'
                            : 'text-muted-foreground',
                      )}
                    >
                      一致度 {c.confidence}%
                    </span>
                  </div>
                  <dl className="text-muted-foreground mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="opacity-70">メーカー</dt>
                      <dd className="text-foreground">{c.maker}</dd>
                    </div>
                    <div>
                      <dt className="opacity-70">承認番号</dt>
                      <dd className="text-foreground font-mono">{c.approvalNo}</dd>
                    </div>
                    <div>
                      <dt className="opacity-70">材料区分</dt>
                      <dd className="text-foreground font-mono">{c.regulatoryCode}</dd>
                    </div>
                    <div>
                      <dt className="opacity-70">償還価格</dt>
                      <dd className="text-foreground font-mono">
                        ¥{c.reimbursement.toLocaleString('ja-JP')}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline">{c.origin}</Badge>
                    {c.citations.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                    {c.duplicate ? (
                      <Badge variant="destructive">
                        <Copy className="size-3" aria-hidden="true" />
                        {c.duplicate}
                      </Badge>
                    ) : null}
                  </div>
                </button>
              )
            })}

            <div className="border-border mt-1 flex flex-wrap items-center justify-end gap-3 border-t pt-4">
              <Button onClick={() => setPhase('registered')}>
                <ShieldCheck className="size-4" aria-hidden="true" />
                この内容でマスタ登録
              </Button>
            </div>
          </div>
        ) : null}

        {phase === 'registered' ? (
          <div className="p-5">
            <div role="status" className="border-primary/30 bg-primary/5 flex items-start gap-3 rounded-xl border p-4">
              <Check className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">
                  P-100249 として登録しました（所要 12秒 / 手入力比 −98%）
                </p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  取得元と取得日時は監査ログに記録され、認可情報の改定時は自動で差分通知されます。
                </p>
              </div>
            </div>

            <dl className="divide-border mt-4 divide-y text-sm">
              {(
                [
                  ['商品名', selected.name, 'メーカーカタログ'],
                  ['メーカー', selected.maker, 'PMDA'],
                  ['分類', selected.category, '厚労省 材料区分'],
                  ['原産', selected.origin, 'メーカーカタログ'],
                  ['JAN / GTIN', selected.jan, 'GS1'],
                  ['承認番号', selected.approvalNo, 'PMDA'],
                  ['機能区分コード', selected.regulatoryCode, '厚労省 材料区分'],
                  ['包装単位', selected.packSize, 'GS1'],
                  ['定価', `¥${selected.listPrice.toLocaleString('ja-JP')}`, 'メーカーカタログ'],
                  ['償還価格', `¥${selected.reimbursement.toLocaleString('ja-JP')}`, '厚労省'],
                ] as const
              ).map(([label, value, source]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-3 sm:items-baseline sm:gap-3">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="font-mono text-xs">{value}</dd>
                  <dd className="text-muted-foreground text-xs sm:text-right">{source}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>
    </div>
  )
}
