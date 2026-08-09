import { PageHeader } from '@/components/app-shell'
import { CatalogTable } from '@/components/catalog-table'
import { StatCard } from '@/components/shared'

export default function CatalogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Master Database"
        title="医薬品・医材・機器を、同じ粒度で引ける"
        description="認可情報・機能区分コード・GS1コードを軸に正規化した統合マスタ。メーカー数と製品数が多い医材でも、原産国や代替品まで含めて横断検索できます。"
      />
      <div className="grid gap-4 px-5 py-6 md:px-8 md:py-8">
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
