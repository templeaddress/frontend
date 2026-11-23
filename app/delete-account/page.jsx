import { PublicShell } from '@/components/ui'
import DeleteAccountForm from './request-form'
import PublicText from '@/components/PublicText'

export const metadata = { title: 'Delete Account | TempleAddress', robots: { index: true, follow: true } }

export default function DeleteAccountPage() {
  return <PublicShell><main className="mx-auto max-w-2xl px-4 py-12">
    <h1 className="text-3xl font-semibold"><PublicText>Delete Your TempleAddress Account</PublicText></h1>
    <p className="mt-4"><PublicText>Verify your registered mobile number and submit a request. Our team will review it before processing your account deletion.</PublicText></p>
    <p className="mt-4"><PublicText>Personal account information will be deleted or anonymized where applicable. Booking, payment and other records may be retained where required for legal, financial or regulatory purposes. Retention requirements are subject to review.</PublicText></p>
    <p className="mt-4"><PublicText>Read our</PublicText> <a className="underline" href="/privacy"><PublicText>Privacy Policy</PublicText></a> <PublicText>for more information.</PublicText></p>
    <DeleteAccountForm />
  </main></PublicShell>
}
