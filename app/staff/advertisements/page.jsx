import { Suspense } from 'react'
import SponsorCreativeReview from '@/components/phase1/SponsorCreativeReview'

export const metadata = { title: 'Sponsor artwork', robots: { index: false } }
export default function Page() { return <Suspense fallback={null}><SponsorCreativeReview/></Suspense> }
