import { Suspense } from 'react'
import { SponsorOrders } from '@/components/phase1/Sponsor'
export const metadata = { title: 'My sponsorships', robots: { index: false } }
export default function Page() { return <Suspense fallback={null}><SponsorOrders/></Suspense> }
