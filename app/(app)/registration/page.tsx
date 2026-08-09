import { redirect } from 'next/navigation'

export default function LegacyRegistrationPage() {
  redirect('/catalog/new?mode=ai')
}
