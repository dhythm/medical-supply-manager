import { Pencil, Search } from 'lucide-react'
import Link from 'next/link'

import { MeterBar } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ProductListItem } from '@/server/repositories/product-repository'

const categories = ['すべて', '医薬品', '医療材料', '医療機器', '一般消耗品']
const origins = ['すべて', '国内製', '海外製']

type CatalogTableProps = {
  items: ProductListItem[]
  totalCount: number
  query?: string
  category?: string
  origin?: string
  page: number
  totalPages: number
}

export function CatalogTable({
  items,
  totalCount,
  query,
  category,
  origin,
  page,
  totalPages,
}: CatalogTableProps) {
  return (
    <div className="border-border/80 bg-card overflow-hidden rounded-xl border shadow-[0_1px_2px_oklch(0.2_0.02_230/4%)]">
      <form className="border-border/70 flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-sm lg:flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={query}
            placeholder="商品名 / メーカー / JAN / 承認番号"
            aria-label="商品マスタ検索"
            className="pl-9"
          />
        </div>
        <select
          name="category"
          defaultValue={category ?? ''}
          aria-label="分類"
          className="border-input bg-background h-8 rounded-lg border px-3 text-xs"
        >
          {categories.map((item) => (
            <option key={item} value={item === 'すべて' ? '' : item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="origin"
          defaultValue={origin ?? ''}
          aria-label="原産区分"
          className="border-input bg-background h-8 rounded-lg border px-3 text-xs"
        >
          {origins.map((item) => (
            <option key={item} value={item === 'すべて' ? '' : item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-primary text-primary-foreground h-8 rounded-lg px-4 text-xs font-medium"
        >
          絞り込む
        </button>
        {query || category || origin ? (
          <Link href="/catalog" className="text-muted-foreground px-2 text-xs hover:text-foreground">
            クリア
          </Link>
        ) : null}
      </form>

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
              <TableHead className="w-24 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.businessCode}>
                <TableCell className="align-top">
                  <p className="text-sm font-semibold leading-snug">{item.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    <span className="font-mono">{item.businessCode}</span> ・ {item.manufacturerName}
                    {item.usedInEmr ? ' ・ カルテ実績あり' : ''}
                  </p>
                  <p className="text-muted-foreground/70 mt-1 font-mono text-[11px]">
                    JAN {item.gtin} ・ 承認 {item.approvalNumber}
                  </p>
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant="secondary">{item.category}</Badge>
                </TableCell>
                <TableCell className="align-top text-right font-mono text-xs">
                  <span className="font-semibold">¥{item.contractPriceYen.toLocaleString('ja-JP')}</span>
                  {item.listPriceYen > 0 ? (
                    <span className="text-muted-foreground block">
                      定価比 −{Math.round((1 - item.contractPriceYen / item.listPriceYen) * 100)}%
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="align-top text-xs">{item.distributorName}</TableCell>
                <TableCell className="align-top">
                  <Badge variant={item.origin === '海外製' ? 'outline' : 'secondary'}>
                    {item.origin === '海外製' ? '海外調達' : '国内調達'}
                  </Badge>
                  <span className="text-muted-foreground mt-1 block text-[11px]">
                    {item.manufacturerCountry}
                  </span>
                </TableCell>
                <TableCell className="align-top">
                  <MeterBar
                    value={item.completeness}
                    tone={item.completeness >= 95 ? 'primary' : item.completeness >= 80 ? 'accent' : 'muted'}
                  />
                  <span className="text-muted-foreground mt-1 block font-mono text-xs">
                    {item.completeness}%
                  </span>
                </TableCell>
                <TableCell className="align-top text-xs">{item.registrationSource}</TableCell>
                <TableCell className="align-top text-right">
                  <Button
                    nativeButton={false}
                    render={<Link href={`/catalog/${item.id}/edit`} aria-label={`${item.name}を編集`} />}
                    variant="ghost"
                    size="sm"
                  >
                    <Pencil aria-hidden="true" />
                    編集
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground h-32 text-center">
                  該当する商品はありません
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="border-border/70 text-muted-foreground flex items-center justify-between gap-3 border-t px-4 py-3 text-xs">
        <span>
          {items.length}件表示 / 全{totalCount}件
        </span>
        <div className="flex items-center gap-3">
          {page > 1 ? <Link href={pageHref({ query, category, origin, page: page - 1 })}>前へ</Link> : null}
          <span>
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref({ query, category, origin, page: page + 1 })}>次へ</Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function pageHref({
  query,
  category,
  origin,
  page,
}: {
  query?: string
  category?: string
  origin?: string
  page: number
}) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (category) params.set('category', category)
  if (origin) params.set('origin', origin)
  params.set('page', String(page))
  return `/catalog?${params.toString()}`
}
