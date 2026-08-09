'use client'

import { Trash2, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export function ProductDeleteControl({
  action,
  productName,
}: {
  action: (formData: FormData) => void | Promise<void>
  productName: string
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <Button type="button" variant="destructive" onClick={() => setConfirming(true)}>
        <Trash2 aria-hidden="true" />
        商品を削除
      </Button>
    )
  }

  return (
    <div className="border-destructive/25 bg-destructive/5 rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <TriangleAlert className="text-destructive mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{productName}を商品マスタから削除します。</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={action}>
              <Button type="submit" variant="destructive">
                削除を確定
              </Button>
            </form>
            <Button type="button" variant="outline" onClick={() => setConfirming(false)}>
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
