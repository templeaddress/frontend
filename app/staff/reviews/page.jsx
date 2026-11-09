import { Suspense } from 'react'
import StaffReviews from '@/components/phase1/StaffReviews'
export default function Page() { return <Suspense fallback={<p>Loading listing review…</p>}><StaffReviews/></Suspense> }
