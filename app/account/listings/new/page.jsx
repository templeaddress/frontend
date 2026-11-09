import { Suspense } from 'react'
import { CreateListing } from '@/components/phase1/Account'
export const metadata = { title: 'Create Listing' }
export default function Page() { return <Suspense fallback={null}><CreateListing/></Suspense> }
