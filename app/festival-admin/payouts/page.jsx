import { Suspense } from 'react'
import { VendorPayouts } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorPayouts/></Suspense> }
