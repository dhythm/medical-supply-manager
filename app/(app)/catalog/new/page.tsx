import { ArrowLeft, Search } from 'lucide-react'
import Link from 'next/link'

import { PageHeader } from '@/components/app-shell'
import { ProductRegistrationForm } from '@/components/product-registration-form'
import { Panel } from '@/components/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createDummyProductLookup } from '@/server/ai/product-lookup'

import { registerAiProductAction, registerManualProductAction } from './actions'

type ProductRegistrationPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductRegistrationPage({ searchParams }: ProductRegistrationPageProps) {
  const params = await searchParams
  const mode = single(params.mode) === 'ai' ? 'ai' : 'manual'
  const query = single(params.q)?.trim() ?? ''
  const error = single(params.error)
  let lookupError: string | undefined
  const result =
    mode === 'ai' && query
      ? await createDummyProductLookup()
          .findCandidate(query)
          .catch((lookupFailure: unknown) => {
            lookupError =
              lookupFailure instanceof Error ? lookupFailure.message : '候補を取得できませんでした'
            return null
          })
      : null

  return (
    <>
      <PageHeader
        eyebrow="商品マスタ"
        title="商品登録"
        actions={
          <Button nativeButton={false} variant="outline" render={<Link href="/catalog" />}>
            <ArrowLeft aria-hidden="true" />
            商品マスタへ戻る
          </Button>
        }
      />
      <div className="mx-auto grid max-w-[1200px] gap-5 px-5 py-6 md:px-8 md:py-8">
        <nav aria-label="登録方法" className="bg-muted inline-flex w-fit rounded-lg p-1">
          <RegistrationModeLink href="/catalog/new" active={mode === 'manual'}>
            手入力
          </RegistrationModeLink>
          <RegistrationModeLink href="/catalog/new?mode=ai" active={mode === 'ai'}>
            AI補完
          </RegistrationModeLink>
        </nav>

        {error || lookupError ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-lg border px-4 py-3 text-sm"
          >
            {error ?? lookupError}
          </p>
        ) : null}

        {mode === 'manual' ? (
          <Panel title="登録内容">
            <ProductRegistrationForm action={registerManualProductAction} submitLabel="商品を登録" />
          </Panel>
        ) : (
          <>
            <Panel title="商品情報を取得">
              <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="mode" value="ai" />
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
                <div className="mb-4">
                  <Badge variant="outline">ダミーAI候補</Badge>
                </div>
                <ProductRegistrationForm
                  action={registerAiProductAction}
                  submitLabel="商品を登録"
                  lookupQuery={result.query}
                  initialValue={result.candidate}
                />
              </Panel>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}

function RegistrationModeLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md px-4 py-2 text-sm font-medium transition-colors',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  )
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
