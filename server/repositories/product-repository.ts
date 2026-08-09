import type { Prisma, PrismaClient } from '@prisma/client'

export type ProductListItem = {
  id: string
  version: number
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

export type ProductFields = {
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
          id: row.id,
          version: row.version,
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
    async getById(input: { organizationId: string; organizationProductId: string }) {
      const row = await database.organizationProduct.findFirst({
        where: {
          id: input.organizationProductId,
          organizationId: input.organizationId,
          isActive: true,
        },
        include: { product: { include: { manufacturer: true } } },
      })
      if (!row) return null
      return {
        id: row.id,
        productId: row.productId,
        version: row.version,
        businessCode: row.businessCode,
        name: row.product.name,
        category: row.product.category,
        origin: row.product.origin,
        manufacturerName: row.product.manufacturer.name,
        manufacturerCountry: row.product.manufacturer.countryName ?? '',
        gtin: row.product.gtin,
        approvalNumber: row.product.approvalNumber,
        regulatoryCode: row.product.regulatoryCode,
        unit: row.product.unit,
        completeness: row.completeness,
        registrationSource: registrationSourceLabel(row.registrationSource),
      }
    },
    async update(
      input: ProductFields & {
        organizationId: string
        organizationProductId: string
        version: number
      },
    ) {
      const value = validateProductFields(input)
      try {
        return await database.$transaction(async (transaction) => {
          const current = await transaction.organizationProduct.findFirst({
            where: {
              id: input.organizationProductId,
              organizationId: input.organizationId,
              isActive: true,
            },
            include: { product: { include: { manufacturer: true } } },
          })
          if (!current) throw new Error('商品が見つかりません')
          if (current.version !== input.version) throw new Error('商品は別の操作で更新されています')

          const duplicateCode = await transaction.organizationProduct.findFirst({
            where: {
              organizationId: input.organizationId,
              businessCode: value.businessCode,
              id: { not: current.id },
            },
          })
          if (duplicateCode) throw new Error('この院内コードは登録済みです')
          if (value.gtin) {
            const duplicateGtin = await transaction.product.findFirst({
              where: { gtin: value.gtin, id: { not: current.productId } },
            })
            if (duplicateGtin) throw new Error('このGTINは登録済みです')
          }

          const changedFields = changedProductFields(current, value)
          if (changedFields.length === 0) throw new Error('変更内容がありません')

          const claimed = await transaction.organizationProduct.updateMany({
            where: {
              id: current.id,
              organizationId: input.organizationId,
              isActive: true,
              version: input.version,
            },
            data: {
              businessCode: value.businessCode,
              completeness: calculateProductCompleteness(value),
              version: { increment: 1 },
            },
          })
          if (claimed.count !== 1) throw new Error('商品は別の操作で更新されています')

          const manufacturer = await transaction.manufacturer.upsert({
            where: { name: value.manufacturerName },
            update: { countryName: value.manufacturerCountry },
            create: { name: value.manufacturerName, countryName: value.manufacturerCountry },
          })
          await transaction.product.update({
            where: { id: current.productId },
            data: {
              name: value.name,
              category: value.category,
              origin: value.origin,
              gtin: value.gtin,
              approvalNumber: value.approvalNumber,
              regulatoryCode: value.regulatoryCode,
              unit: value.unit,
              manufacturerId: manufacturer.id,
            },
          })
          await transaction.auditEvent.create({
            data: {
              organizationId: input.organizationId,
              entityType: 'ORGANIZATION_PRODUCT',
              entityId: current.id,
              action: 'UPDATED',
              changedFields,
            },
          })
          return { id: current.id, version: input.version + 1 }
        })
      } catch (error) {
        if (isUniqueConstraintError(error)) throw new Error('同じ登録内容がすでに保存されています')
        throw error
      }
    },
    async archive(input: { organizationId: string; organizationProductId: string; version: number }) {
      return database.$transaction(async (transaction) => {
        const current = await transaction.organizationProduct.findFirst({
          where: {
            id: input.organizationProductId,
            organizationId: input.organizationId,
            isActive: true,
          },
        })
        if (!current) throw new Error('商品が見つかりません')
        if (current.version !== input.version) throw new Error('商品は別の操作で更新されています')

        const archived = await transaction.organizationProduct.updateMany({
          where: {
            id: current.id,
            organizationId: input.organizationId,
            isActive: true,
            version: input.version,
          },
          data: { isActive: false, version: { increment: 1 } },
        })
        if (archived.count !== 1) throw new Error('商品は別の操作で更新されています')
        await transaction.auditEvent.create({
          data: {
            organizationId: input.organizationId,
            entityType: 'ORGANIZATION_PRODUCT',
            entityId: current.id,
            action: 'DELETED',
            changedFields: ['isActive'],
          },
        })
      })
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
      const value = validateProductFields(input)
      const lookupQuery = optional(input.lookupQuery, '検索語', 120)
      if (input.registrationSource === 'AI_ASSISTED_DUMMY' && !lookupQuery)
        throw new Error('検索語を確認してください')

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

          const normalizedQuery = lookupQuery ? normalize(lookupQuery) : null
          if (normalizedQuery && lookupQuery && normalizedQuery !== normalize(product.name)) {
            await transaction.productAlias.create({
              data: {
                organizationProductId: organizationProduct.id,
                name: lookupQuery,
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

function validateProductFields(input: ProductFields): ProductFields {
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
  }
  if (value.gtin && !/^\d{8,14}$/.test(value.gtin)) throw new Error('GTINは8〜14桁の数字で入力してください')
  return value
}

function changedProductFields(
  current: {
    businessCode: string
    product: {
      name: string
      category: string
      origin: string
      gtin: string | null
      approvalNumber: string | null
      regulatoryCode: string | null
      unit: string
      manufacturer: { name: string; countryName: string | null }
    }
  },
  value: ProductFields,
) {
  const values: Record<string, [string | null, string | null]> = {
    businessCode: [current.businessCode, value.businessCode],
    name: [current.product.name, value.name],
    category: [current.product.category, value.category],
    origin: [current.product.origin, value.origin],
    manufacturerName: [current.product.manufacturer.name, value.manufacturerName],
    manufacturerCountry: [current.product.manufacturer.countryName, value.manufacturerCountry],
    gtin: [current.product.gtin, value.gtin],
    approvalNumber: [current.product.approvalNumber, value.approvalNumber],
    regulatoryCode: [current.product.regulatoryCode, value.regulatoryCode],
    unit: [current.product.unit, value.unit],
  }
  return Object.entries(values)
    .filter(([, [before, after]]) => before !== after)
    .map(([field]) => field)
}

function calculateProductCompleteness(value: ProductFields) {
  return calculateCompleteness({
    name: value.name,
    category: value.category,
    origin: value.origin,
    manufacturerName: value.manufacturerName,
    unit: value.unit,
    gtin: value.gtin,
    approvalNumber: value.approvalNumber,
    regulatoryCode: value.regulatoryCode,
  })
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
