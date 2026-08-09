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
          registrationSource: row.registrationSource === 'DEMO' ? 'デモデータ' : row.registrationSource,
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
  }
}
