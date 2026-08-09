import { PageHeader } from '@/components/app-shell'
import { RegistrationConsole } from '@/components/registration-console'

export default function RegistrationPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Product Registration"
        title="製品名を入れるだけで、商品マスタが出来上がる"
        description="PMDA・厚生労働省の認可情報、GS1データプール、メーカーの公開カタログを横断して収集し、院内マスタとの重複まで判定した登録案を提示します。担当者の仕事は「承認」だけになります。"
      />
      <div className="px-5 py-6 md:px-8 md:py-8">
        <RegistrationConsole />
      </div>
    </>
  )
}
