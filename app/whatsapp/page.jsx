import Link from 'next/link'

import { PublicShell } from '@/components/ui'

export const metadata = {
  title: 'TempleAddress WhatsApp Support',
  description: 'Contact TempleAddress devotee support on WhatsApp.',
  robots: { index: false, follow: false },
}

export default function WhatsAppSupportPage() {
  return <PublicShell hideChatbot><main className="mx-auto max-w-2xl px-4 py-16">
    <div className="card p-8 text-center">
      <h1 className="text-3xl font-semibold">WhatsApp support</h1>
      <p className="mt-3 text-brown-600">We use WhatsApp for approved alerts, receipts and chart delivery. Interactive WhatsApp booking is not available yet.</p>
      <a className="btn-wa mt-6" href="https://wa.me/919495041196" target="_blank" rel="noreferrer">Message +91 9495 041196</a>
      <Link className="btn-g mt-3" href="/temples">Browse temples</Link>
    </div>
  </main></PublicShell>
}
