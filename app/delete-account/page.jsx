import { PublicShell } from '@/components/ui'
import DeleteAccountForm from './request-form'

export const metadata = { title: 'Delete Account | TempleAddress', robots: { index: true, follow: true } }

export default function DeleteAccountPage() {
  return <PublicShell><main className="mx-auto max-w-2xl px-4 py-12">
    <h1 className="text-3xl font-semibold">Delete Your TempleAddress Account</h1>
    <p className="mt-4">Verify your registered mobile number and submit a request. Our team will review it before processing your account deletion.</p>
    <p className="mt-4">Personal account information will be deleted or anonymized where applicable. Booking, payment and other records may be retained where required for legal, financial or regulatory purposes. Retention requirements are subject to review.</p>
    <p className="mt-4">Read our <a className="underline" href="/privacy">Privacy Policy</a> for more information.</p>
    <DeleteAccountForm />
  </main></PublicShell>
}
