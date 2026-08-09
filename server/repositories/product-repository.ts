import type { Prisma, PrismaClient } from '@prisma/client'

export type ProductListItem = {
  businessCode: string
  name: string
  category: string
  manufacturerName: string
  manufacturerCountry: string
  origin: string
  gtin: string
  approvalNumber: string
  regulatoryCode: string
  unit: string
  listPriceYen: number
  contractPriceYen: number
  distributorName: string
  completeness: number
  registrationSource: string
  updatedAt: string
  usedInEmr: boolean
}

export type ProductListQuery = {
  organizationId: string
  query?: string
  category?: string
  origin?: string
  page?: number
  pageSize?: number
}

export function createProductRepository(database: PrismaClient) {
  return {
    async summarize(organizationId: string) {
      const rows = await database.organizationProduct.findMany({
        where: { organizationId, isActive: true },
        select: { product: { select: { category: true, manufacturerId: true } } },
      })
      const categoryCount = rows.reduce<Record<string, number>>((result, row) => {
        result[row.product.category] = (result[row.product.category] ?? 0) + 1
        return result
      }, {})

      return {
        totalCount: rows.length,
        categoryCount,
        manufacturerCount: new Set(rows.map((row) => row.product.manufacturerId)).size,
      }
    },
    async list(input: ProductListQuery) {
      const page = Math.max(1, input.page ?? 1)
      const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 20))
      const query = input.query?.trim()

      const where: Prisma.OrganizationProductWhereInput = {
        organizationId: input.organizationId,
        isActive: true,
        ...((input.category || input.origin) && {
          product: {
            ...(input.category ? { category: input.category } : {}),
            ...(input.origin ? { origin: input.origin } : {}),
          },
        }),
        ...(query
          ? {
              OR: [
                { businessCode: { contains: query, mode: 'insensitive' } },
                { product: { name: { contains: query, mode: 'insensitive' } } },
                { product: { gtin: { contains: query, mode: 'insensitive' } } },
                { product: { approvalNumber: { contains: query, mode: 'insensitive' } } },
                { product: { regulatoryCode: { contains: query, mode: 'insensitive' } } },
                { product: { manufacturer: { name: { contains: query, mode: 'insensitive' } } } },
                { aliases: { some: { normalizedName: { contains: query.toLowerCase() } } } },
              ],
            }
          : {}),
      }

      const [rows, totalCount] = await database.$transaction([
        database.organizationProduct.findMany({
          where,
          include: {
            product: { include: { manufacturer: true } },
            contractPrices: {
              include: { distributor: true },
              orderBy: { validFrom: 'desc' },
              take: 1,
            },
          },
          orderBy: [{ updatedAt: 'desc' }, { businessCode: 'asc' }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        database.organizationProduct.count({ where }),
      ])

      const items: ProductListItem[] = rows.map((row) => {
        const price = row.contractPrices[0]
        return {
          businessCode: row.businessCode,
          name: row.product.name,
          category: row.product.category,
          manufacturerName: row.product.manufacturer.name,
          manufacturerCountry: row.product.manufacturer.countryName ?? '—',
          origin: row.product.origin,
          gtin: row.product.gtin ?? '—',
          approvalNumber: row.product.approvalNumber ?? '—',
          regulatoryCode: row.product.regulatoryCode ?? '—',
          unit: row.product.unit,
          listPriceYen: price?.listPriceYen ?? 0,
          contractPriceYen: price?.contractPriceYen ?? 0,
          distributorName: price?.distributor.name ?? '—',
          completeness: row.completeness,
          registrationSource: registrationSourceLabel(row.registrationSource),
          updatedAt: row.updatedAt.toISOString().slice(0, 10),
          usedInEmr: row.usedInEmr,
        }
      })

      return {
        items,
        totalCount,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      }
    },
    async register(input: {
      organizationId: string
      registrationSource: 'MANUAL' | 'AI_ASSISTED_DUMMY'
      businessCode: string
      name: string
      category: string
      origin: string
      manufacturerName: string
      manufacturerCountry: string
      gtin: string | null
      approvalNumber: string | null
      regulatoryCode: string | null
      unit: string
      lookupQuery: string | null
    }) {
      const value = {
        businessCode: required(input.businessCode, '院内コード', 40).toUpperCase(),
        name: required(input.name, '製品名', 120),
        category: required(input.category, 'カテゴリ', 40),
        origin: required(input.origin, '製造区分', 40),
        manufacturerName: required(input.manufacturerName, 'メーカー', 120),
        manufacturerCountry: required(input.manufacturerCountry, 'メーカー国', 80),
        gtin: optional(input.gtin, 'GTIN', 14),
        approvalNumber: optional(input.approvalNumber, '承認番号', 80),
        regulatoryCode: optional(input.regulatoryCode, '薬価基準・材料コード', 80),
        unit: required(input.unit, '単位', 40),
        lookupQuery: optional(input.lookupQuery, '検索語', 120),
      }
      if (input.registrationSource === 'AI_ASSISTED_DUMMY' && !value.lookupQuery)
        throw new Error('検索語を確認してください')
      if (value.gtin && !/^\d{8,14}$/.test(value.gtin))
        throw new Error('GTINは8〜14桁の数字で入力してください')

      try {
        return await database.$transaction(async (transaction) => {
          const duplicateCode = await transaction.organizationProduct.findUnique({
            where: {
              organizationId_businessCode: {
                organizationId: input.organizationId,
                businessCode: value.businessCode,
              },
            },
          })
          if (duplicateCode) throw new Error('この院内コードは登録済みです')

          const existingProduct = value.gtin
            ? await transaction.product.findUnique({ where: { gtin: value.gtin } })
            : null
          if (existingProduct) {
            const duplicateProduct = await transaction.organizationProduct.findUnique({
              where: {
                organizationId_productId: {
                  organizationId: input.organizationId,
                  productId: existingProduct.id,
                },
              },
            })
            if (duplicateProduct) throw new Error('この商品は商品マスタに登録済みです')
          }

          const product =
            existingProduct ??
            (await transaction.product.create({
              data: {
                name: value.name,
                category: value.category,
                origin: value.origin,
                gtin: value.gtin,
                approvalNumber: value.approvalNumber,
                regulatoryCode: value.regulatoryCode,
                unit: value.unit,
                manufacturer: {
                  connectOrCreate: {
                    where: { name: value.manufacturerName },
                    create: { name: value.manufacturerName, countryName: value.manufacturerCountry },
                  },
                },
              },
            }))

          const completeness = calculateCompleteness({
            name: product.name,
            category: product.category,
            origin: product.origin,
            manufacturerName: value.manufacturerName,
            unit: product.unit,
            gtin: product.gtin,
            approvalNumber: product.approvalNumber,
            regulatoryCode: product.regulatoryCode,
          })
          const organizationProduct = await transaction.organizationProduct.create({
            data: {
              organizationId: input.organizationId,
              productId: product.id,
              businessCode: value.businessCode,
              registrationSource: input.registrationSource,
              completeness,
            },
          })

          const normalizedQuery = value.lookupQuery ? normalize(value.lookupQuery) : null
          if (normalizedQuery && normalizedQuery !== normalize(product.name)) {
            await transaction.productAlias.create({
              data: {
                organizationProductId: organizationProduct.id,
                name: value.lookupQuery!,
                normalizedName: normalizedQuery,
              },
            })
          }
          return organizationProduct
        })
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new Error('同じ登録内容がすでに保存されています')
        }
        throw error
      }
    },
  }
}

function required(value: string, label: string, maxLength: number) {
  const result = value.trim()
  if (!result) throw new Error(`${label}を入力してください`)
  if (result.length > maxLength) throw new Error(`${label}は${maxLength}文字以内で入力してください`)
  return result
}

function optional(value: string | null, label: string, maxLength: number) {
  const result = value?.trim() || null
  if (result && result.length > maxLength) throw new Error(`${label}は${maxLength}文字以内で入力してください`)
  return result
}

function normalize(value: string) {
  return value.trim().toLowerCase().replaceAll(/\s+/g, ' ')
}

function calculateCompleteness(input: Record<string, string | null>) {
  const completed = Object.values(input).filter(Boolean).length
  return Math.round((completed / Object.keys(input).length) * 100)
}

function registrationSourceLabel(value: string) {
  if (value === 'SAMPLE') return 'サンプルデータ'
  if (value === 'AI_ASSISTED_DUMMY') return 'AI補完（ダミー応答）'
  if (value === 'MANUAL') return '手動登録'
  return value
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
}
