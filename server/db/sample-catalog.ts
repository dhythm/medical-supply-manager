export type SampleCatalogItem = {
  businessCode: string
  name: string
  category: string
  manufacturerName: string
  manufacturerCountry: string
  origin: string
  gtin: string
  regulatoryCode: string | null
  approvalNumber: string | null
  unit: string
  listPriceYen: number
  contractPriceYen: number
  distributorName: string
  completeness: number
  usedInEmr: boolean
}

export const sampleCatalog: SampleCatalogItem[] = [
  { businessCode: 'P-100241', name: '滅菌注射針 23G×1 1/4インチ（100本入）', category: '医療材料', manufacturerName: 'Terumo', manufacturerCountry: '日本', origin: '国内製', gtin: '4987350201347', regulatoryCode: '004-0121', approvalNumber: '13B1X00021000342', unit: '箱', listPriceYen: 1480, contractPriceYen: 1102, distributorName: 'メディセオ', completeness: 100, usedInEmr: true },
  { businessCode: 'P-100242', name: '弾性包帯 幅75mm×長4.5m（滅菌済）', category: '医療材料', manufacturerName: '3M Health Care', manufacturerCountry: '米国', origin: '海外製', gtin: '4987167445120', regulatoryCode: '007-0043', approvalNumber: '21700BZY00312000', unit: '巻', listPriceYen: 640, contractPriceYen: 512, distributorName: 'スズケン', completeness: 92, usedInEmr: true },
  { businessCode: 'P-100243', name: 'ロキソプロフェンNa錠60mg「サワイ」', category: '医薬品', manufacturerName: '沢井製薬', manufacturerCountry: '日本', origin: '国内製', gtin: '4987080114458', regulatoryCode: '1149019F1234', approvalNumber: '22400AMX00891000', unit: 'PTP100錠', listPriceYen: 970, contractPriceYen: 812, distributorName: 'アルフレッサ', completeness: 100, usedInEmr: true },
  { businessCode: 'P-100244', name: '中心静脈カテーテルキット 4Fr ダブルルーメン', category: '医療材料', manufacturerName: 'Becton Dickinson', manufacturerCountry: '米国', origin: '海外製', gtin: '4987410882014', regulatoryCode: '133-0012', approvalNumber: '22600BZX00145000', unit: 'セット', listPriceYen: 8600, contractPriceYen: 7310, distributorName: 'ムトウ', completeness: 78, usedInEmr: true },
  { businessCode: 'P-100245', name: '吸収性縫合糸 4-0 針付 45cm（12本入）', category: '医療材料', manufacturerName: 'Johnson & Johnson', manufacturerCountry: '米国', origin: '海外製', gtin: '4987521330119', regulatoryCode: '036-0007', approvalNumber: '20800BZY00449000', unit: '箱', listPriceYen: 12400, contractPriceYen: 10788, distributorName: 'メディセオ', completeness: 88, usedInEmr: true },
  { businessCode: 'P-100246', name: 'アトルバスタチンCa錠10mg「ファイザー」', category: '医薬品', manufacturerName: 'ヴィアトリス製薬', manufacturerCountry: '日本', origin: '国内製', gtin: '4987080552113', regulatoryCode: '2189015F2021', approvalNumber: '22200AMX00734000', unit: 'PTP100錠', listPriceYen: 3210, contractPriceYen: 2634, distributorName: 'アルフレッサ', completeness: 100, usedInEmr: true },
  { businessCode: 'P-100247', name: '使い捨てプラスチックグローブ ニトリル Mサイズ（200枚）', category: '一般消耗品', manufacturerName: 'Top Glove', manufacturerCountry: 'マレーシア', origin: '海外製', gtin: '4987450019827', regulatoryCode: null, approvalNumber: null, unit: '箱', listPriceYen: 1180, contractPriceYen: 858, distributorName: 'ミスミ', completeness: 64, usedInEmr: false },
  { businessCode: 'P-100248', name: '輸液ポンプ用専用ルート（20本入）', category: '医療機器', manufacturerName: 'Fresenius Kabi', manufacturerCountry: 'ドイツ', origin: '海外製', gtin: '4987190448801', regulatoryCode: '150-0031', approvalNumber: '22900BZX00088000', unit: '箱', listPriceYen: 22800, contractPriceYen: 20976, distributorName: 'スズケン', completeness: 81, usedInEmr: true },
]
