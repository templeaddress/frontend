import { Suspense } from 'react'
import { Phase1Checkout } from '@/components/phase1/Booking'

export const metadata = { title: 'Book a pooja', description: 'Book a pooja securely through Razorpay.', robots: { index: false, follow: false } }
export default function Page() { return <Suspense fallback={null}><Phase1Checkout mode="booking"/></Suspense> }
