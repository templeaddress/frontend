import { Suspense } from 'react'
import { Phase1Receipt } from '@/components/phase1/Booking'
export const metadata = { title: 'Booking Receipt', robots: { index: false, follow: false, nocache: true } }
export default function Page() { return <Suspense fallback={null}><Phase1Receipt/></Suspense> }
