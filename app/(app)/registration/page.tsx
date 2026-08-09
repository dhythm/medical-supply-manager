import { PageHeader } from '@/components/app-shell'
import { RegistrationConsole } from '@/components/registration-console'

export default function RegistrationPage() {
  return (
    <>
      <PageHeader
        eyebrow="商品管理"
        title="AI商品登録"
      />
      <div className="mx-auto max-w-[1440px] px-5 py-6 md:px-8 md:py-8">
        <RegistrationConsole />
      </div>
    </>
  )
}
