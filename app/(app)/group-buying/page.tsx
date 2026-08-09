import { PageHeader } from '@/components/app-shell'
import { FeaturePreparation } from '@/components/feature-preparation'

export default function GroupBuyingPage() {
  return <><PageHeader eyebrow="調達分析" title="共同購入・価格交渉" /><div className="px-5 py-8 md:px-8"><FeaturePreparation featureName="共同購入・価格交渉" /></div></>
}
