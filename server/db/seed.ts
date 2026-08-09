import type { PrismaClient } from '@prisma/client'

const facilities = [
  { code: 'JONAN-GENERAL', name: '城南総合病院', bedCount: 520 },
  { code: 'JONAN-EAST', name: '城南東病院', bedCount: 260 },
  { code: 'JONAN-REHAB', name: '城南リハビリテーション病院', bedCount: 169 },
  { code: 'JONAN-CLINIC', name: '城南クリニック', bedCount: 0 },
]

export async function seedDatabase(database: PrismaClient) {
  const organization = await database.organization.upsert({
    where: { code: 'JONAN' },
    update: { name: '城南医療グループ' },
    create: { code: 'JONAN', name: '城南医療グループ' },
  })

  for (const facility of facilities) {
    await database.facility.upsert({
      where: {
        organizationId_code: {
          organizationId: organization.id,
          code: facility.code,
        },
      },
      update: {
        name: facility.name,
        bedCount: facility.bedCount,
      },
      create: {
        ...facility,
        organizationId: organization.id,
      },
    })
  }
}
