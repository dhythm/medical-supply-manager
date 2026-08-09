import { PageHeader } from '@/components/app-shell'
import { FeaturePreparation } from '@/components/feature-preparation'

export default function EmrPage() {
  return <><PageHeader eyebrow="システム連携" title="電子カルテ連携" /><div className="px-5 py-8 md:px-8"><FeaturePreparation featureName="電子カルテ連携" /></div></>
}
