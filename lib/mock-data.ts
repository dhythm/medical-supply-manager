// ---------------------------------------------------------------------------
// MEDIBASE モックデータ
// 会話メモ（購買管理 / 医療データ / 顧客の声）から想定した機能のダミーデータ
// ---------------------------------------------------------------------------

export type Category = '医薬品' | '医療材料' | '医療機器' | '一般消耗品'
export type Origin = '国内製' | '海外製'

export type Product = {
  id: string
  name: string
  category: Category
  maker: string
  makerCountry: string
  origin: Origin
  jan: string
  /** 医薬品: 薬価基準収載医薬品コード / 医材: 保険医療材料等コード */
  regulatoryCode: string
  /** 承認番号（PMDA / 厚生労働省） */
  approvalNo: string
  unit: string
  listPrice: number
  contractPrice: number
  distributor: string
  /** マスタ項目の充足率（%） */
  completeness: number
  source: 'AI自動登録' | '手入力' | '卸連携' | 'GS1連携'
  updatedAt: string
  usedInEmr: boolean
}

export const products: Product[] = [
  {
    id: 'P-100241',
    name: '滅菌注射針 23G×1 1/4インチ（100本入）',
    category: '医療材料',
    maker: 'Terumo',
    makerCountry: '日本',
    origin: '国内製',
    jan: '4987350201347',
    regulatoryCode: '004-0121',
    approvalNo: '13B1X00021000342',
    unit: '箱',
    listPrice: 1480,
    contractPrice: 1102,
    distributor: 'メディセオ',
    completeness: 100,
    source: 'AI自動登録',
    updatedAt: '2026-08-06',
    usedInEmr: true,
  },
  {
    id: 'P-100242',
    name: '弾性包帯 幅75mm×長4.5m（滅菌済）',
    category: '医療材料',
    maker: '3M Health Care',
    makerCountry: '米国',
    origin: '海外製',
    jan: '4987167445120',
    regulatoryCode: '007-0043',
    approvalNo: '21700BZY00312000',
    unit: '巻',
    listPrice: 640,
    contractPrice: 512,
    distributor: 'スズケン',
    completeness: 92,
    source: 'AI自動登録',
    updatedAt: '2026-08-06',
    usedInEmr: true,
  },
  {
    id: 'P-100243',
    name: 'ロキソプロフェンNa錠60mg「サワイ」',
    category: '医薬品',
    maker: '沢井製薬',
    makerCountry: '日本',
    origin: '国内製',
    jan: '4987080114458',
    regulatoryCode: '1149019F1234',
    approvalNo: '22400AMX00891000',
    unit: 'PTP100錠',
    listPrice: 970,
    contractPrice: 812,
    distributor: 'アルフレッサ',
    completeness: 100,
    source: 'AI自動登録',
    updatedAt: '2026-08-05',
    usedInEmr: true,
  },
  {
    id: 'P-100244',
    name: '中心静脈カテーテルキット 4Fr ダブルルーメン',
    category: '医療材料',
    maker: 'Becton Dickinson',
    makerCountry: '米国',
    origin: '海外製',
    jan: '4987410882014',
    regulatoryCode: '133-0012',
    approvalNo: '22600BZX00145000',
    unit: 'セット',
    listPrice: 8600,
    contractPrice: 7310,
    distributor: 'ムトウ',
    completeness: 78,
    source: '手入力',
    updatedAt: '2026-07-29',
    usedInEmr: true,
  },
  {
    id: 'P-100245',
    name: '吸収性縫合糸 4-0 針付 45cm（12本入）',
    category: '医療材料',
    maker: 'Johnson & Johnson',
    makerCountry: '米国',
    origin: '海外製',
    jan: '4987521330119',
    regulatoryCode: '036-0007',
    approvalNo: '20800BZY00449000',
    unit: '箱',
    listPrice: 12400,
    contractPrice: 10788,
    distributor: 'メディセオ',
    completeness: 88,
    source: '卸連携',
    updatedAt: '2026-08-02',
    usedInEmr: true,
  },
  {
    id: 'P-100246',
    name: 'アトルバスタチンCa錠10mg「ファイザー」',
    category: '医薬品',
    maker: 'ヴィアトリス製薬',
    makerCountry: '日本',
    origin: '国内製',
    jan: '4987080552113',
    regulatoryCode: '2189015F2021',
    approvalNo: '22200AMX00734000',
    unit: 'PTP100錠',
    listPrice: 3210,
    contractPrice: 2634,
    distributor: 'アルフレッサ',
    completeness: 100,
    source: 'GS1連携',
    updatedAt: '2026-08-07',
    usedInEmr: true,
  },
  {
    id: 'P-100247',
    name: '使い捨てプラスチックグローブ ニトリル Mサイズ（200枚）',
    category: '一般消耗品',
    maker: 'Top Glove',
    makerCountry: 'マレーシア',
    origin: '海外製',
    jan: '4987450019827',
    regulatoryCode: '—',
    approvalNo: '—',
    unit: '箱',
    listPrice: 1180,
    contractPrice: 858,
    distributor: 'ミスミ',
    completeness: 64,
    source: '手入力',
    updatedAt: '2026-07-18',
    usedInEmr: false,
  },
  {
    id: 'P-100248',
    name: '輸液ポンプ用専用ルート（20本入）',
    category: '医療機器',
    maker: 'Fresenius Kabi',
    makerCountry: 'ドイツ',
    origin: '海外製',
    jan: '4987190448801',
    regulatoryCode: '150-0031',
    approvalNo: '22900BZX00088000',
    unit: '箱',
    listPrice: 22800,
    contractPrice: 20976,
    distributor: 'スズケン',
    completeness: 81,
    source: 'AI自動登録',
    updatedAt: '2026-08-04',
    usedInEmr: true,
  },
]

// --- ダッシュボード ------------------------------------------------------

/** 購買管理業務の工数内訳（会話: 商品登録だけで約50%） */
export const workloadBreakdown = [
  { task: '商品登録・マスタ整備', ratio: 48, aiReducible: 82 },
  { task: '価格改定・見積照合', ratio: 18, aiReducible: 55 },
  { task: '発注・納期確認', ratio: 14, aiReducible: 30 },
  { task: '検品・入庫処理', ratio: 12, aiReducible: 20 },
  { task: '請求・支払照合', ratio: 8, aiReducible: 60 },
]

export const kpis = [
  { label: '登録済み商品', value: '48,219', delta: '+1,204 / 今月', tone: 'neutral' as const },
  { label: 'AI自動登録率', value: '76.4%', delta: '+11.2pt / 前月比', tone: 'up' as const },
  { label: '登録1件あたり工数', value: '2.4分', delta: '手入力18.6分 → 87%削減', tone: 'up' as const },
  { label: '要確認マスタ', value: '312件', delta: '承認番号・単位の欠損', tone: 'warn' as const },
]

/** 海外製比率（会話: 医材の約7割が海外製） */
export const originShare = [
  { category: '医療材料', overseas: 71, domestic: 29 },
  { category: '医療機器', overseas: 63, domestic: 37 },
  { category: '医薬品', overseas: 22, domestic: 78 },
  { category: '一般消耗品', overseas: 58, domestic: 42 },
]

export const registrationQueue = [
  { name: '静脈留置針 24G セーフティ機構付', status: '照合待ち', source: 'PMDA / GS1' },
  { name: 'アルコール綿 単包 100包', status: 'AI下書き完了', source: 'メーカーサイト' },
  { name: 'セフトリアキソンNa静注用1g', status: '薬価コード照合中', source: '薬価基準収載品目' },
  { name: '創傷被覆材 ハイドロコロイド 10×10cm', status: '重複候補あり', source: '院内マスタ' },
]

// --- AI商品登録 ---------------------------------------------------------

export type FetchStep = {
  source: string
  detail: string
  fields: string[]
  latencyMs: number
}

export const fetchSteps: FetchStep[] = [
  {
    source: 'PMDA 医療機器・医薬品情報',
    detail: '承認番号 / 一般的名称 / クラス分類を照合',
    fields: ['approvalNo', 'genericName', 'classification'],
    latencyMs: 900,
  },
  {
    source: '厚生労働省 保険適用材料区分',
    detail: '機能区分コードと償還価格を取得',
    fields: ['regulatoryCode', 'reimbursement'],
    latencyMs: 800,
  },
  {
    source: 'GS1 / JANデータプール',
    detail: 'GTIN・包装単位・入数を正規化',
    fields: ['jan', 'unit', 'packSize'],
    latencyMs: 700,
  },
  {
    source: 'メーカー公開カタログ',
    detail: '仕様・規格・添付文書PDFを解析',
    fields: ['spec', 'maker', 'documentUrl'],
    latencyMs: 1100,
  },
  {
    source: '院内マスタ重複チェック',
    detail: '既存48,219件と表記ゆれを含めて突合',
    fields: ['duplicate'],
    latencyMs: 600,
  },
]

export type Candidate = {
  name: string
  maker: string
  category: Category
  origin: Origin
  jan: string
  approvalNo: string
  regulatoryCode: string
  unit: string
  packSize: string
  listPrice: number
  reimbursement: number
  confidence: number
  duplicate: string | null
  citations: string[]
}

export const candidates: Candidate[] = [
  {
    name: '静脈留置針 24G×19mm セーフティ機構付（50本入）',
    maker: 'Terumo',
    category: '医療材料',
    origin: '国内製',
    jan: '4987350338012',
    approvalNo: '13B1X00021000517',
    regulatoryCode: '004-0132',
    unit: '箱',
    packSize: '50本 / 箱',
    listPrice: 6800,
    reimbursement: 5900,
    confidence: 96,
    duplicate: null,
    citations: ['PMDA', '厚労省 材料区分', 'GS1', 'メーカーカタログ'],
  },
  {
    name: '静脈留置針 24G×19mm（セーフティなし・50本入）',
    maker: 'Nipro',
    category: '医療材料',
    origin: '国内製',
    jan: '4987458210049',
    approvalNo: '13B2X00075000188',
    regulatoryCode: '004-0131',
    unit: '箱',
    packSize: '50本 / 箱',
    listPrice: 4200,
    reimbursement: 3700,
    confidence: 71,
    duplicate: 'P-100118「留置針24G」と類似',
    citations: ['PMDA', 'GS1'],
  },
  {
    name: 'IVカテーテル 24G セーフティタイプ（並行輸入）',
    maker: 'B. Braun',
    category: '医療材料',
    origin: '海外製',
    jan: '4049320188115',
    approvalNo: '22400BZX00301000',
    regulatoryCode: '004-0132',
    unit: '箱',
    packSize: '50本 / 箱',
    listPrice: 7400,
    reimbursement: 5900,
    confidence: 58,
    duplicate: null,
    citations: ['PMDA', 'メーカーカタログ'],
  },
]

// --- 共同購入 ------------------------------------------------------------

export const groupBuying = [
  {
    item: '滅菌注射針 23G（100本入）',
    participants: 14,
    volume: '38,400箱 / 年',
    current: 1102,
    proposed: 968,
    benchmark: 1015,
    status: '交渉中',
  },
  {
    item: '吸収性縫合糸 4-0 針付',
    participants: 9,
    volume: '4,120箱 / 年',
    current: 10788,
    proposed: 9640,
    benchmark: 10210,
    status: '合意',
  },
  {
    item: 'ニトリルグローブ M（200枚）',
    participants: 21,
    volume: '112,000箱 / 年',
    current: 858,
    proposed: 742,
    benchmark: 795,
    status: '交渉中',
  },
  {
    item: '輸液ポンプ専用ルート',
    participants: 6,
    volume: '2,300箱 / 年',
    current: 20976,
    proposed: 19420,
    benchmark: 20100,
    status: '見送り',
  },
]

/** 卸依存度（会話: 病院は何を仕入れるべきか判断しづらく卸に依存しやすい） */
export const distributorDependency = [
  { name: 'メディセオ', share: 38, items: 18240, priceIndex: 99 },
  { name: 'スズケン', share: 24, items: 11430, priceIndex: 102 },
  { name: 'アルフレッサ', share: 21, items: 9880, priceIndex: 97 },
  { name: 'ムトウ', share: 11, items: 5120, priceIndex: 104 },
  { name: 'その他', share: 6, items: 3549, priceIndex: 101 },
]

// --- 電子カルテ連携 -------------------------------------------------------

export const emrConnections = [
  {
    hospital: '中央総合病院（本院）',
    vendor: 'HOPE LifeMark-HX',
    type: 'オンプレミス',
    method: 'SS-MIX2 標準ストレージ経由',
    status: '連携中',
    beds: 620,
    lastSync: '2026-08-09 05:12',
  },
  {
    hospital: '城南クリニック',
    vendor: 'CLIUS（クラウド型）',
    type: 'クラウド',
    method: 'REST API / OAuth 2.0',
    status: '連携中',
    beds: 0,
    lastSync: '2026-08-09 06:40',
  },
  {
    hospital: '北稜記念病院',
    vendor: 'MI・RA・Is',
    type: 'オンプレミス',
    method: 'CSV日次バッチ（閉域）',
    status: '検証中',
    beds: 310,
    lastSync: '2026-08-08 23:00',
  },
  {
    hospital: 'みなと在宅医療センター',
    vendor: 'エムスリーデジカル',
    type: 'クラウド',
    method: 'REST API / OAuth 2.0',
    status: '申請待ち',
    beds: 19,
    lastSync: '—',
  },
]

/** 電子カルテの使用実績から在庫消費を逆算 */
export const consumptionSignals = [
  { product: 'ロキソプロフェンNa錠60mg', dept: '整形外科', orders: 1842, trend: +12, stockDays: 24 },
  { product: '滅菌注射針 23G', dept: '外来処置室', orders: 3610, trend: +4, stockDays: 11 },
  { product: '弾性包帯 75mm', dept: '救急外来', orders: 980, trend: -6, stockDays: 38 },
  { product: '中心静脈カテーテルキット', dept: 'ICU', orders: 212, trend: +21, stockDays: 7 },
  { product: 'アトルバスタチンCa錠10mg', dept: '循環器内科', orders: 1516, trend: +2, stockDays: 31 },
]

// --- データインサイト ------------------------------------------------------

export const insightPanels = [
  {
    title: '処方傾向レポート',
    consumer: '製薬企業 / MR',
    granularity: '施設グループ × 診療科 × 月次',
    dataset: '院内処方実績（k匿名化 k=8）',
    consent: '施設同意済み',
    risk: '低',
    note: '医師個人が特定されうる粒度は集計時に自動でマスクされます。',
  },
  {
    title: '採用切替アラート',
    consumer: '製薬企業 / 医材メーカー',
    granularity: '施設グループ × 製品カテゴリ × 週次',
    dataset: '購買実績 + マスタ改定履歴',
    consent: '施設同意済み',
    risk: '低',
    note: '卸から取得した取引情報は契約上再提供不可のため対象外です。',
  },
  {
    title: 'レセプト横断分析',
    consumer: '研究機関 / 保険者',
    granularity: '疾患 × 治療パターン × 四半期',
    dataset: 'レセプト（次世代医療基盤法スキームを想定）',
    consent: '要・個別同意 / 倫理審査',
    risk: '高',
    note: '要配慮個人情報。仮名加工と第三者提供記録の作成が前提です。',
  },
  {
    title: '健診データ連携',
    consumer: '保険者 / 産業医',
    granularity: '事業所 × 年次',
    dataset: '健康診断結果',
    consent: '要・本人同意',
    risk: '高',
    note: '本人同意の取得状況をレコード単位で保持し、未同意は自動除外します。',
  },
]

export const guardrails = [
  '医師個人が識別できる粒度での外部提供は既定でブロック',
  '卸会社由来データは契約フラグで再提供対象から自動除外',
  '要配慮個人情報は仮名加工処理後のみ分析環境へ持ち込み可',
  '提供先・提供項目・提供日時をすべて監査ログに記録',
]

// --- 顧客の声 / 展示会 -----------------------------------------------------

export type VoiceTicket = {
  id: string
  title: string
  source: '展示会' | '訪問ヒアリング' | '導入院サポート' | '電話・メール'
  facility: string
  role: string
  heardBy: string
  heardByRole: '開発' | '経営' | '営業' | 'CS'
  date: string
  status: '検討中' | '仕様化済み' | 'リリース済み' | '見送り'
  impact: '高' | '中' | '低'
  quote: string
}

export const voiceTickets: VoiceTicket[] = [
  {
    id: 'V-0431',
    title: '製品名だけ入力すれば登録が終わるようにしてほしい',
    source: '展示会',
    facility: '中央総合病院',
    role: '用度課長',
    heardBy: '徳留',
    heardByRole: '経営',
    date: '2026-07-24',
    status: 'リリース済み',
    impact: '高',
    quote: '型番を探して仕様を写す作業が一番きつい。名前だけで引っ張ってきてほしい。',
  },
  {
    id: 'V-0437',
    title: '海外製医材の代替品を横並びで比較したい',
    source: '展示会',
    facility: '北稜記念病院',
    role: '手術室看護師長',
    heardBy: '佐野',
    heardByRole: '開発',
    date: '2026-07-24',
    status: '仕様化済み',
    impact: '高',
    quote: '欠品したときに何が代わりになるのか、卸に聞くまで分からない。',
  },
  {
    id: 'V-0442',
    title: '共同購入の価格根拠を理事会に出せる形式で出力したい',
    source: '訪問ヒアリング',
    facility: '城南医療グループ',
    role: '事務長',
    heardBy: '徳留',
    heardByRole: '経営',
    date: '2026-07-30',
    status: '検討中',
    impact: '中',
    quote: '交渉した結果がいくら効いたのか、説明資料を作るのに毎回半日かかる。',
  },
  {
    id: 'V-0448',
    title: 'クラウド型電子カルテとの単方向連携だけ先に始めたい',
    source: '導入院サポート',
    facility: 'みなと在宅医療センター',
    role: '院長',
    heardBy: '池田',
    heardByRole: 'CS',
    date: '2026-08-03',
    status: '仕様化済み',
    impact: '中',
    quote: 'フル連携は怖いが、使った分が在庫から引かれるだけでも十分助かる。',
  },
  {
    id: 'V-0450',
    title: '院内の呼称（略称）でも検索に引っかかるようにしてほしい',
    source: '展示会',
    facility: '城南クリニック',
    role: '看護師',
    heardBy: '佐野',
    heardByRole: '開発',
    date: '2026-07-25',
    status: '検討中',
    impact: '高',
    quote: '現場は正式名称で呼んでいない。「サーフロ」で出てこないと使われない。',
  },
]

export const exhibition = {
  name: '第29回 病院経営・医療DX EXPO',
  venue: '東京ビッグサイト 東7ホール / ブース 7-C12',
  period: '2026-07-24 〜 2026-07-26',
  staffing: [
    { name: '徳留', role: '経営', hours: 14, conversations: 41, opportunities: 9 },
    { name: '佐野', role: '開発', hours: 16, conversations: 38, opportunities: 7 },
    { name: '池田', role: 'CS', hours: 12, conversations: 27, opportunities: 4 },
    { name: '外部呼び込みスタッフ', role: '呼び込み', hours: 18, conversations: 96, opportunities: 1 },
  ],
  funnel: [
    { stage: '来訪', count: 202 },
    { stage: '着席デモ', count: 88 },
    { stage: '課題ヒアリング完了', count: 63 },
    { stage: '商談化', count: 21 },
    { stage: 'トライアル申込', count: 8 },
  ],
}
