'use client'

import { useRouter } from 'next/navigation'
import { PublicShell } from '@/components/ui'

export default function ListingUnavailable({ reset }) {
  const router = useRouter()
  return <PublicShell><main className="mx-auto max-w-4xl px-4 py-16"><h1 className="text-3xl font-semibold">This listing is temporarily unavailable</h1><p className="mt-3 text-brown-600">We could not load the verified listing details. Please try again shortly.</p><button className="btn-p mt-5" onClick={reset || (() => router.refresh())}>Try again</button></main></PublicShell>
}
