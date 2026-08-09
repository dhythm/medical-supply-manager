import { MessageSquarePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SelectOption = {
  label: string
  value: string
}

type CustomerFeedbackCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>
  sourceOptions: SelectOption[]
  departmentOptions: SelectOption[]
}

export function CustomerFeedbackCreateForm({
  action,
  sourceOptions,
  departmentOptions,
}: CustomerFeedbackCreateFormProps) {
  return (
    <form action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <label className="grid min-w-0 gap-1 text-xs md:col-span-2 xl:col-span-3">
        件名
        <Input name="title" required maxLength={120} />
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        受付経路
        <select name="source" className="border-input bg-background h-8 min-w-0 rounded-lg border px-2">
          {sourceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        部門
        <select name="department" className="border-input bg-background h-8 min-w-0 rounded-lg border px-2">
          {departmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid min-w-0 gap-1 text-xs">
        重要度
        <select name="impact" className="border-input bg-background h-8 min-w-0 rounded-lg border px-2">
          <option value="LOW">低</option>
          <option value="MEDIUM">中</option>
          <option value="HIGH">高</option>
        </select>
      </label>
      <label className="grid gap-1 text-xs md:col-span-2 xl:col-span-6">
        内容
        <textarea
          name="summary"
          required
          maxLength={1000}
          rows={3}
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 resize-y rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3"
        />
      </label>
      <div
        role="group"
        aria-label="受付情報"
        className="border-border/70 grid items-end gap-3 border-t pt-4 md:col-span-2 sm:grid-cols-[minmax(12rem,16rem)_1fr] xl:col-span-6"
      >
        <label className="grid gap-1 text-xs">
          受付日
          <Input name="capturedAt" type="date" required />
        </label>
        <Button type="submit" size="lg" className="w-full sm:w-auto sm:min-w-36 sm:justify-self-end">
          <MessageSquarePlus aria-hidden="true" />
          顧客の声を登録
        </Button>
      </div>
    </form>
  )
}
