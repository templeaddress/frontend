import { Suspense } from 'react'
import StaffReviewDetail from '@/components/phase1/StaffReviewDetail'
export default function Page() { return <Suspense fallback={<p>Loading submission…</p>}><StaffReviewDetail/></Suspense> }
