import { Suspense } from 'react'
import { Phase1Checkout } from '@/components/phase1/Booking'

export const metadata = { title: 'Make a donation', description: 'Donate securely to an approved listing.', robots: { index: false, follow: false } }
export default function Page() { return <Suspense fallback={null}><Phase1Checkout mode="donation"/></Suspense> }
