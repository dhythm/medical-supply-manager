import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ProductOption = {
  id: string
  label: string
}

type NegotiationCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>
  products: ProductOption[]
}

export function NegotiationCreateForm({ action, products }: NegotiationCreateFormProps) {
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <label className="grid min-w-0 gap-1 text-xs xl:col-span-2">
        商品
        <select
          name="organizationProductId"
          required
          className="border-input bg-background h-9 w-full min-w-0 rounded-lg border px-3"
        >
          <option value="">選択</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-xs xl:col-span-2">
        案件名
        <Input name="title" required maxLength={120} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        基準単価
        <Input name="baselineUnitPriceYen" type="number" min={1} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        目標単価
        <Input name="targetUnitPriceYen" type="number" min={1} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        見積期限
        <Input name="quoteDueDate" type="date" />
      </label>
      <div className="flex items-end xl:col-start-6">
        <Button type="submit">
          <Plus className="size-4" />
          作成
        </Button>
      </div>
    </form>
  )
}
