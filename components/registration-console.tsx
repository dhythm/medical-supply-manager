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
    <div className="grid gap-4 lg:grid-cols-5">
      {/* 入力 + 取得ログ ------------------------------------------------ */}
      <section className="border-border bg-card lg:col-span-2 rounded-md border">
        <div className="border-border border-b px-4 py-3">
          <h2 className="text-sm font-medium">1. 製品名を入力</h2>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            型番や仕様は不要です。院内での呼び名・略称でも照合します。
          </p>
        </div>

        <div className="flex flex-col gap-3 p-4">
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
            <Button onClick={start} disabled={phase === 'fetching'}>
              {phase === 'fetching' ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                'AI取得'
              )}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setQuery(p)}
                className="border-border text-muted-foreground hover:border-primary/60 hover:text-foreground rounded-full border px-2.5 py-1 text-xs transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="border-border bg-secondary/50 border-t px-4 py-3">
          <p className="text-muted-foreground font-mono text-[11px] uppercase tracking-[0.16em]">
            外部情報ソース
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
                  {done ? (
                    <span className="text-muted-foreground ml-auto shrink-0 font-mono text-[11px]">
                      {step.latencyMs}ms
                    </span>
                  ) : null}
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* 候補 + 登録 ---------------------------------------------------- */}
      <section className="border-border bg-card lg:col-span-3 rounded-md border">
        <div className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
          <div>
            <h2 className="text-sm font-medium">
              {phase === 'registered' ? '3. 登録完了' : '2. 候補の確認と承認'}
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              {phase === 'candidates' || phase === 'registered'
                ? `「${query}」に対する候補 ${candidates.length}件`
                : 'AI取得を実行すると候補が表示されます'}
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
            <p className="text-muted-foreground max-w-sm text-center text-sm leading-relaxed text-pretty">
              {phase === 'fetching'
                ? '公的認可情報・GS1・メーカーカタログを横断照合しています…'
                : '手入力では1件あたり平均18.6分。AI取得では候補の承認のみで完了します。'}
            </p>
          </div>
        ) : null}

        {phase === 'candidates' ? (
          <div className="flex flex-col gap-3 p-4">
            {candidates.map((c) => {
              const active = selected.name === c.name
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelected(c)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-md border p-4 text-left transition-colors',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 text-sm font-medium">{c.name}</p>
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
                  <dl className="text-muted-foreground mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-4">
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

            <div className="border-border mt-1 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <p className="text-muted-foreground text-xs leading-relaxed">
                承認すると商品マスタ・在庫・発注テンプレートに同時反映されます。
              </p>
              <Button onClick={() => setPhase('registered')}>
                <ShieldCheck className="size-4" aria-hidden="true" />
                この内容でマスタ登録
              </Button>
            </div>
          </div>
        ) : null}

        {phase === 'registered' ? (
          <div className="p-4">
            <div className="border-primary/40 bg-primary/5 flex items-start gap-3 rounded-md border p-4">
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
                <div key={label} className="grid grid-cols-3 items-baseline gap-3 py-2.5">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="col-span-1 font-mono text-xs">{value}</dd>
                  <dd className="text-muted-foreground text-right text-xs">{source}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </section>
    </div>
  )
}
