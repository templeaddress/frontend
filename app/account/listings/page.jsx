import { Suspense } from 'react'
import { MyListings } from '@/components/phase1/Account'
export const metadata = { title: 'My Listings' }
export default function Page() { return <Suspense fallback={null}><MyListings/></Suspense> }
