import { Suspense } from 'react'
import { SponsorOrder } from '@/components/phase1/Sponsor'
export const metadata = { title: 'Sponsorship order', robots: { index: false } }
export default function Page() { return <Suspense fallback={null}><SponsorOrder/></Suspense> }
