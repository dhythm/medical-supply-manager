import { PageHeader } from '@/components/app-shell'
import { FeaturePreparation } from '@/components/feature-preparation'

export default function VoicePage() {
  return <><PageHeader eyebrow="顧客理解" title="顧客の声" /><div className="px-5 py-8 md:px-8"><FeaturePreparation featureName="顧客の声" /></div></>
}
