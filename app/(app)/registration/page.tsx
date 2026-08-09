import { PageHeader } from '@/components/app-shell'
import { FeaturePreparation } from '@/components/feature-preparation'

export default function RegistrationPage() {
  return <><PageHeader eyebrow="商品管理" title="AI商品登録" /><div className="px-5 py-8 md:px-8"><FeaturePreparation featureName="AI商品登録" /></div></>
}
