'use client'

import { Quote } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { voiceTickets, type VoiceTicket } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const sources: (VoiceTicket['source'] | 'すべて')[] = [
  'すべて',
  '展示会',
  '訪問ヒアリング',
  '導入院サポート',
  '電話・メール',
]

const statusVariant = {
  'リリース済み': 'default',
  '仕様化済み': 'secondary',
  '検討中': 'outline',
  '見送り': 'ghost',
} as const

export function VoiceBoard() {
  const [source, setSource] = useState<(typeof sources)[number]>('すべて')
  const rows = voiceTickets.filter((t) => source === 'すべて' || t.source === source)

  return (
    <div className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)]">
      <div className="border-border flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <h2 className="mr-auto text-sm font-medium">現場の要望チケット</h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="取得元フィルタ">
          {sources.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              aria-pressed={source === s}
              className={cn(
                'min-h-8 rounded-full border px-3 py-1 text-xs transition-colors',
                source === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-border divide-y">
        {rows.map((t) => (
          <li key={t.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  <span className="font-mono">{t.id}</span> ・ {t.facility}（{t.role}） ・ {t.date}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-1.5">
                <Badge variant="outline">{t.source}</Badge>
                <Badge variant={statusVariant[t.status]}>{t.status}</Badge>
                <Badge variant={t.impact === '高' ? 'default' : 'secondary'}>影響度 {t.impact}</Badge>
              </div>
            </div>

            <blockquote className="border-primary/40 text-muted-foreground mt-3 flex gap-2 border-l-2 pl-3 text-sm leading-relaxed">
              <Quote className="mt-1 size-3.5 shrink-0 opacity-60" aria-hidden="true" />
              <p className="text-pretty">{t.quote}</p>
            </blockquote>

            <p className="text-muted-foreground mt-2 text-xs">
              聞いた人: {t.heardBy}（{t.heardByRole}）
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
