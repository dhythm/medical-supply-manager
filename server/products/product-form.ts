import type { ProductFields } from '@/server/repositories/product-repository'

const categories = ['医薬品', '医療材料', '医療機器', '一般消耗品'] as const
const origins = ['国内製', '海外製'] as const

export function productFieldsFromFormData(formData: FormData): ProductFields {
  return {
    businessCode: text(formData, 'businessCode'),
    name: text(formData, 'name'),
    category: allowed(formData, 'category', categories),
    origin: allowed(formData, 'origin', origins),
    manufacturerName: text(formData, 'manufacturerName'),
    manufacturerCountry: text(formData, 'manufacturerCountry'),
    gtin: optionalText(formData, 'gtin'),
    approvalNumber: optionalText(formData, 'approvalNumber'),
    regulatoryCode: optionalText(formData, 'regulatoryCode'),
    unit: text(formData, 'unit'),
  }
}

export function optionalFormText(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim() || null
}

function text(data: FormData, key: string) {
  const result = String(data.get(key) ?? '').trim()
  if (!result) throw new Error('必須項目を入力してください')
  return result
}

function optionalText(data: FormData, key: string) {
  return String(data.get(key) ?? '').trim() || null
}

function allowed<const Value extends string>(data: FormData, key: string, values: readonly Value[]) {
  const result = text(data, key)
  if (!values.includes(result as Value)) throw new Error('選択項目を確認してください')
  return result
}
