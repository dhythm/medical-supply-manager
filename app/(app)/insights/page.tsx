import { PageHeader } from '@/components/app-shell'
import { FeaturePreparation } from '@/components/feature-preparation'

export default function InsightsPage() {
  return <><PageHeader eyebrow="データ活用" title="データガバナンス" /><div className="px-5 py-8 md:px-8"><FeaturePreparation featureName="データガバナンス" /></div></>
}
