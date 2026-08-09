import { PageHeader } from '@/components/app-shell'
import { MeterBar, Panel, StatCard } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { distributorDependency, groupBuying } from '@/lib/mock-data'

const statusVariant = {
  合意: 'default',
  交渉中: 'secondary',
  見送り: 'outline',
} as const

export default function GroupBuyingPage() {
  return (
    <>
      <PageHeader
        eyebrow="調達分析"
        title="共同購入・価格交渉"
      />

      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="参加施設" value="24" delta="城南医療グループ 他8法人" />
          <StatCard label="対象品目" value="1,208" delta="年間取引額 18.4億円" />
          <StatCard label="交渉による削減見込" value="¥62.4M" delta="年換算 / 合意分のみ" tone="up" />
          <StatCard label="ベンチマーク超過品目" value="146件" delta="平均 +4.8% 割高" tone="warn" />
        </div>

        <Panel title="交渉中の品目" hint="ベンチマークは参加施設の契約単価中央値">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-56">品目</TableHead>
                  <TableHead className="text-right">参加</TableHead>
                  <TableHead>集約数量</TableHead>
                  <TableHead className="text-right">現行単価</TableHead>
                  <TableHead className="text-right">ベンチマーク</TableHead>
                  <TableHead className="text-right">提示単価</TableHead>
                  <TableHead className="text-right">削減率</TableHead>
                  <TableHead>状態</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupBuying.map((g) => (
                  <TableRow key={g.item}>
                    <TableCell className="text-sm font-medium">{g.item}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{g.participants}施設</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {g.volume}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ¥{g.current.toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right font-mono text-xs">
                      ¥{g.benchmark.toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      ¥{g.proposed.toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-primary text-right font-mono text-xs">
                      −{Math.round((1 - g.proposed / g.current) * 100)}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[g.status as keyof typeof statusVariant]}>
                        {g.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="卸会社別の依存度" hint="価格指数100 = ベンチマーク相当">
            <ul className="flex flex-col gap-4">
              {distributorDependency.map((d) => (
                <li key={d.name}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm">{d.name}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {d.share}% ・ {d.items.toLocaleString('ja-JP')}品目 ・ 価格指数{' '}
                      <span className={d.priceIndex > 100 ? 'text-accent-foreground' : 'text-primary'}>
                        {d.priceIndex}
                      </span>
                    </p>
                  </div>
                  <MeterBar value={d.share * 2} className="mt-2" />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="交渉支援メモ" hint="理事会提出用に出力可能">
            <ul className="flex flex-col gap-3 text-sm leading-relaxed">
              <li className="border-border rounded-md border p-3">
                <p className="font-medium">ムトウ扱い品の価格指数が104</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  中心静脈カテーテル等の海外製比率が高い品目に集中。同一機能区分の国内代替2件を候補として提示できます。
                </p>
              </li>
              <li className="border-border rounded-md border p-3">
                <p className="font-medium">ニトリルグローブは21施設で集約可能</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  年間112,000箱。ベンチマーク比 −7.9%（¥742）まで提示済み。合意で年間¥13.0M削減見込。
                </p>
              </li>
              <li className="border-border rounded-md border p-3">
                <p className="font-medium">輸液ポンプ専用ルートは交渉見送り</p>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  機器本体との専用設計のため代替不可。次回機器更新時の総額評価に論点を移送しました。
                </p>
              </li>
            </ul>
          </Panel>
        </div>
      </div>
    </>
  )
}
