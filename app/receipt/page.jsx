import Link from 'next/link'
import { PublicShell } from '@/components/ui'

export const metadata = { title: 'Receipt', robots: { index: false, follow: false, nocache: true } }

export default function ReceiptHelpPage() {
  return (
    <PublicShell hideChatbot>
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="card p-8 text-center">
          <h1 className="text-3xl font-semibold">Choose a booking receipt</h1>
          <p className="mt-3 text-brown-600">Receipts are private and use the unique link created after a successful booking. Open one from your account or complete a new booking.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/account" className="btn-p">Open my account</Link><Link href="/temples" className="btn-g">Browse temples</Link></div>
        </div>
      </main>
    </PublicShell>
  )
}
