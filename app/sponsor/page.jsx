import { Suspense } from 'react'
import { SponsorCheckout } from '@/components/phase1/Sponsor'
export const metadata = { title: 'Sponsor a Temple', description: 'Support a verified temple with a transparent TempleAddress sponsorship package.', alternates: { canonical: '/sponsor' } }
export default function Page() { return <Suspense fallback={null}><SponsorCheckout/></Suspense> }
