import { PublicShell } from '@/components/ui'
import SupportForm from '@/components/phase1/SupportForm'
export const metadata = { title: 'Help & support', description: 'Raise a support request with the TempleAddress team.', alternates: { canonical: '/support' } }
export default function Page() { return <PublicShell><main className="mx-auto max-w-2xl px-4 py-10"><h1 className="font-display text-4xl font-semibold">Help & support</h1><p className="mb-6 mt-2 text-brown-600">Questions about a booking, receipt, listing or payout? Tell us and our team will get back to you.</p><SupportForm/></main></PublicShell> }
