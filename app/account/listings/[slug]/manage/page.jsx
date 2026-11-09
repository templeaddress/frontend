import { Suspense } from 'react'
import { ManageListing } from '@/components/phase1/Account'

export const metadata = { title: 'Manage Listing', robots: { index: false, follow: false } }
export default function Page() { return <Suspense fallback={null}><ManageListing/></Suspense> }
