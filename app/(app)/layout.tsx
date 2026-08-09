import { AppShell } from '@/components/app-shell'
import { getCurrentOrganization } from '@/server/current-organization'
import { getDatabaseClient } from '@/server/db/client'
import { createDashboardRepository } from '@/server/repositories/dashboard-repository'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const organization = await getCurrentOrganization()
  const summary = await createDashboardRepository(getDatabaseClient()).getSummary(organization.id)

  return (
    <AppShell organization={{ name: summary.organizationName, facilityCount: summary.facilityCount, bedCount: summary.bedCount }}>
      {children}
    </AppShell>
  )
}
