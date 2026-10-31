import { Suspense } from 'react'
import { VendorReviews } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorReviews/></Suspense> }
