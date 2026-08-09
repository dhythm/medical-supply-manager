import { PageHeader } from '@/components/app-shell'
import { CatalogTable } from '@/components/catalog-table'
import { StatCard } from '@/components/shared'

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        eyebrow="商品管理"
        title="商品マスタ"
      />
      <div className="mx-auto grid max-w-[1440px] gap-5 px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="医薬品" value="21,480" delta="薬価コード紐付け 99.2%" />
          <StatCard label="医療材料" value="19,336" delta="機能区分紐付け 94.7%" />
          <StatCard label="医療機器 / 消耗品" value="7,403" delta="承認番号欠損 214件" tone="warn" />
          <StatCard label="登録メーカー" value="1,862" delta="うち海外 1,204社" />
        </div>
        <CatalogTable />
      </div>
    </>
  )
}
