import { Search } from 'lucide-react'

import { PageHeader } from '@/components/app-shell'
import { Panel } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createDummyProductLookup } from '@/server/ai/product-lookup'

import { registerProductAction } from './actions'

type RegistrationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegistrationPage({ searchParams }: RegistrationPageProps) {
  const params = await searchParams
  const query = single(params.q)?.trim() ?? ''
  const error = single(params.error)
  let lookupError: string | undefined
  const result = query
    ? await createDummyProductLookup()
        .findCandidate(query)
        .catch((lookupFailure: unknown) => {
          lookupError = lookupFailure instanceof Error ? lookupFailure.message : '候補を取得できませんでした'
          return null
        })
    : null

  return (
    <>
      <PageHeader eyebrow="商品管理" title="AI商品登録" />
      <div className="mx-auto grid max-w-[1200px] gap-5 px-5 py-6 md:px-8 md:py-8">
        {error || lookupError ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {error ?? lookupError}
          </p>
        ) : null}

        <Panel title="商品情報を取得">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="grid flex-1 gap-1 text-xs">
              製品名
              <span className="relative">
                <Search
                  className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input name="q" defaultValue={query} required maxLength={120} className="pl-9" />
              </span>
            </label>
            <Button type="submit">候補を取得</Button>
          </form>
        </Panel>

        {result ? (
          <Panel title="登録内容" hint="ダミーAI応答">
            <form action={registerProductAction} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input type="hidden" name="lookupQuery" value={result.query} />
              <div className="md:col-span-2 xl:col-span-4">
                <Badge variant="outline">ダミーAI候補</Badge>
              </div>
              <label className="grid gap-1 text-xs md:col-span-2">
                製品名
                <Input name="name" defaultValue={result.candidate.name} required maxLength={120} />
              </label>
              <label className="grid gap-1 text-xs">
                院内コード
                <Input name="businessCode" required maxLength={40} />
              </label>
              <label className="grid gap-1 text-xs">
                単位
                <Input name="unit" defaultValue={result.candidate.unit} required maxLength={40} />
              </label>
              <label className="grid gap-1 text-xs md:col-span-2">
                メーカー
                <Input
                  name="manufacturerName"
                  defaultValue={result.candidate.manufacturerName}
                  required
                  maxLength={120}
                />
              </label>
              <label className="grid gap-1 text-xs">
                メーカー国
                <Input
                  name="manufacturerCountry"
                  defaultValue={result.candidate.manufacturerCountry}
                  required
                  maxLength={80}
                />
              </label>
              <label className="grid gap-1 text-xs">
                製造区分
                <select
                  name="origin"
                  defaultValue={result.candidate.origin}
                  className="border-input bg-background h-8 rounded-lg border px-2"
                >
                  <option value="国内製">国内製</option>
                  <option value="海外製">海外製</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs">
                カテゴリ
                <select
                  name="category"
                  defaultValue={result.candidate.category}
                  className="border-input bg-background h-8 rounded-lg border px-2"
                >
                  <option value="医薬品">医薬品</option>
                  <option value="医療材料">医療材料</option>
                  <option value="医療機器">医療機器</option>
                  <option value="一般消耗品">一般消耗品</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs">
                GTIN
                <Input
                  name="gtin"
                  defaultValue={result.candidate.gtin ?? ''}
                  inputMode="numeric"
                  maxLength={14}
                />
              </label>
              <label className="grid gap-1 text-xs">
                承認番号
                <Input
                  name="approvalNumber"
                  defaultValue={result.candidate.approvalNumber ?? ''}
                  maxLength={80}
                />
              </label>
              <label className="grid gap-1 text-xs">
                薬価基準・材料コード
                <Input
                  name="regulatoryCode"
                  defaultValue={result.candidate.regulatoryCode ?? ''}
                  maxLength={80}
                />
              </label>
              <div className="flex items-end md:col-span-2 xl:col-span-4">
                <Button type="submit">商品マスタに登録</Button>
              </div>
            </form>
          </Panel>
        ) : null}
      </div>
    </>
  )
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
