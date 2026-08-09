import { PackagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ProductRegistrationValue = {
  name?: string
  businessCode?: string
  unit?: string
  manufacturerName?: string
  manufacturerCountry?: string
  origin?: string
  category?: string
  gtin?: string | null
  approvalNumber?: string | null
  regulatoryCode?: string | null
}

type ProductRegistrationFormProps = {
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  lookupQuery?: string
  initialValue?: ProductRegistrationValue
}

export function ProductRegistrationForm({
  action,
  submitLabel,
  lookupQuery,
  initialValue = {},
}: ProductRegistrationFormProps) {
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {lookupQuery ? <input type="hidden" name="lookupQuery" value={lookupQuery} /> : null}
      <label className="grid min-w-0 gap-1 text-xs md:col-span-2">
        製品名
        <Input name="name" defaultValue={initialValue.name} required maxLength={120} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        院内コード
        <Input name="businessCode" defaultValue={initialValue.businessCode} required maxLength={40} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        単位
        <Input name="unit" defaultValue={initialValue.unit} required maxLength={40} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs md:col-span-2">
        メーカー
        <Input
          name="manufacturerName"
          defaultValue={initialValue.manufacturerName}
          required
          maxLength={120}
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        メーカー国
        <Input
          name="manufacturerCountry"
          defaultValue={initialValue.manufacturerCountry}
          required
          maxLength={80}
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        製造区分
        <select
          name="origin"
          defaultValue={initialValue.origin ?? '国内製'}
          className="border-input bg-background h-8 min-w-0 rounded-lg border px-2"
        >
          <option value="国内製">国内製</option>
          <option value="海外製">海外製</option>
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        カテゴリ
        <select
          name="category"
          defaultValue={initialValue.category ?? '医療材料'}
          className="border-input bg-background h-8 min-w-0 rounded-lg border px-2"
        >
          <option value="医薬品">医薬品</option>
          <option value="医療材料">医療材料</option>
          <option value="医療機器">医療機器</option>
          <option value="一般消耗品">一般消耗品</option>
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        GTIN
        <Input name="gtin" defaultValue={initialValue.gtin ?? ''} inputMode="numeric" maxLength={14} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        承認番号
        <Input name="approvalNumber" defaultValue={initialValue.approvalNumber ?? ''} maxLength={80} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        薬価基準・材料コード
        <Input name="regulatoryCode" defaultValue={initialValue.regulatoryCode ?? ''} maxLength={80} />
      </label>
      <div className="border-border/70 flex justify-end border-t pt-4 md:col-span-2 xl:col-span-4">
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-40">
          <PackagePlus aria-hidden="true" />
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
