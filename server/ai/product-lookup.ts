type ProductCandidate = {
  name: string
  category: string
  origin: string
  manufacturerName: string
  manufacturerCountry: string
  gtin: string | null
  approvalNumber: string | null
  regulatoryCode: string | null
  unit: string
}

type ProductLookupResult = {
  query: string
  responseKind: 'DUMMY'
  candidate: ProductCandidate
}

export interface ProductLookup {
  findCandidate(query: string): Promise<ProductLookupResult>
}

export function createDummyProductLookup(): ProductLookup {
  return {
    async findCandidate(value) {
      const query = value.trim()
      if (!query) throw new Error('製品名を入力してください')
      if (query.length > 120) throw new Error('製品名は120文字以内で入力してください')

      return {
        query,
        responseKind: 'DUMMY',
        candidate: {
          name: query,
          category: '医療材料',
          origin: '国内製',
          manufacturerName: 'ダミーメディカル',
          manufacturerCountry: '日本',
          gtin: null,
          approvalNumber: null,
          regulatoryCode: null,
          unit: '箱',
        },
      }
    },
  }
}
