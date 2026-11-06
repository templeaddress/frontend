import { Suspense } from 'react'
import SponsorInvoice from '@/components/phase1/SponsorInvoice'

export const metadata = { title: 'Sponsorship invoice', robots: { index: false, follow: false } }
export default function Page() { return <Suspense fallback={null}><SponsorInvoice/></Suspense> }
