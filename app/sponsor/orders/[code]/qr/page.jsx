import { Suspense } from 'react'
import SponsorQrBoard from '@/components/phase1/SponsorQrBoard'

export const metadata = { title: 'Sponsor QR board', robots: { index: false, follow: false } }
export default function Page() { return <Suspense fallback={null}><SponsorQrBoard/></Suspense> }
