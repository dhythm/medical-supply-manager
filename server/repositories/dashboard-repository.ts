import type { PrismaClient } from '@prisma/client'

export function createDashboardRepository(database: PrismaClient) {
  return {
    async getSummary(organizationId: string) {
      const [
        organization,
        totalProductCount,
        reviewProductCount,
        overseasProductCount,
        completeness,
        recentRows,
        sampleProductCount,
      ] = await database.$transaction([
        database.organization.findUniqueOrThrow({
          where: { id: organizationId },
          select: { name: true, facilities: { select: { bedCount: true } } },
        }),
        database.organizationProduct.count({ where: { organizationId, isActive: true } }),
        database.organizationProduct.count({
          where: { organizationId, isActive: true, completeness: { lt: 100 } },
        }),
        database.organizationProduct.count({
          where: { organizationId, isActive: true, product: { origin: '海外製' } },
        }),
        database.organizationProduct.aggregate({
          where: { organizationId, isActive: true },
          _avg: { completeness: true },
        }),
        database.organizationProduct.findMany({
          where: { organizationId, isActive: true },
          select: {
            businessCode: true,
            completeness: true,
            updatedAt: true,
            product: { select: { name: true } },
          },
          orderBy: [{ updatedAt: 'desc' }, { businessCode: 'asc' }],
          take: 4,
        }),
        database.organizationProduct.count({
          where: { organizationId, isActive: true, registrationSource: 'SAMPLE' },
        }),
      ])

      return {
        organizationName: organization.name,
        facilityCount: organization.facilities.length,
        bedCount: organization.facilities.reduce((sum, facility) => sum + facility.bedCount, 0),
        totalProductCount,
        reviewProductCount,
        overseasProductCount,
        overseasProductRate:
          totalProductCount === 0 ? 0 : Math.round((overseasProductCount / totalProductCount) * 1000) / 10,
        averageCompleteness: Math.round((completeness._avg.completeness ?? 0) * 10) / 10,
        hasSampleData: sampleProductCount > 0,
        recentProducts: recentRows.map((row) => ({
          businessCode: row.businessCode,
          name: row.product.name,
          completeness: row.completeness,
          updatedAt: row.updatedAt.toISOString().slice(0, 10),
        })),
      }
    },
  }
}
