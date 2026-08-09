'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { MeterBar } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { products, type Category, type Origin } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const categories: (Category | 'すべて')[] = [
  'すべて',
  '医薬品',
  '医療材料',
  '医療機器',
  '一般消耗品',
]
const origins: (Origin | 'すべて')[] = ['すべて', '国内製', '海外製']

export function CatalogTable() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<Category | 'すべて'>('すべて')
  const [origin, setOrigin] = useState<Origin | 'すべて'>('すべて')

  const rows = useMemo(
    () =>
      products.filter((p) => {
        const hit =
          q === '' ||
          [p.name, p.maker, p.jan, p.regulatoryCode, p.approvalNo, p.id].some((v) =>
            v.toLowerCase().includes(q.toLowerCase()),
          )
        return (
          hit &&
          (category === 'すべて' || p.category === category) &&
          (origin === 'すべて' || p.origin === origin)
        )
      }),
    [q, category, origin],
  )

  return (
    <div className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)]">
      <div className="border-border/70 flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="商品名 / メーカー / JAN / 承認番号"
            aria-label="商品マスタ検索"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="分類フィルタ">
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 lg:ml-auto" role="group" aria-label="原産フィルタ">
          {origins.map((o) => (
            <FilterChip key={o} active={origin === o} onClick={() => setOrigin(o)}>
              {o}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-80">商品</TableHead>
              <TableHead>分類</TableHead>
              <TableHead className="text-right">調達価格</TableHead>
              <TableHead>主要卸</TableHead>
              <TableHead>供給</TableHead>
              <TableHead className="min-w-32">マスタ充足</TableHead>
              <TableHead>登録経路</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="align-top">
                  <p className="text-sm font-semibold leading-snug">{p.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    <span className="font-mono">{p.id}</span> ・ {p.maker}
                    {p.usedInEmr ? ' ・ カルテ実績あり' : ''}
                  </p>
                  <p className="text-muted-foreground/70 mt-1 font-mono text-[11px]">
                    JAN {p.jan} ・ 承認 {p.approvalNo}
                  </p>
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant="secondary">{p.category}</Badge>
                    <Badge variant={p.origin === '海外製' ? 'outline' : 'ghost'}>{p.origin}</Badge>
                  </div>
                </TableCell>
                <TableCell className="align-top text-right font-mono text-xs">
                  <span className="font-semibold">¥{p.contractPrice.toLocaleString('ja-JP')}</span>
                  <span className="text-muted-foreground block">
                    定価比 −{Math.round((1 - p.contractPrice / p.listPrice) * 100)}%
                  </span>
                </TableCell>
                <TableCell className="align-top text-xs">{p.distributor}</TableCell>
                <TableCell className="align-top">
                  <Badge variant={p.origin === '海外製' ? 'outline' : 'secondary'}>
                    {p.origin === '海外製' ? '海外調達' : '国内調達'}
                  </Badge>
                  <span className="text-muted-foreground mt-1 block text-[11px]">{p.makerCountry}</span>
                </TableCell>
                <TableCell className="align-top">
                  <MeterBar
                    value={p.completeness}
                    tone={p.completeness >= 95 ? 'primary' : p.completeness >= 80 ? 'accent' : 'muted'}
                  />
                  <span className="text-muted-foreground mt-1 block font-mono text-xs">
                    {p.completeness}%
                  </span>
                </TableCell>
                <TableCell className="align-top text-xs">{p.source}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border-border/70 text-muted-foreground border-t px-4 py-3 text-xs">
        {rows.length} 件表示 / 全 48,219 件（デモデータ）
      </div>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'min-h-8 rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
