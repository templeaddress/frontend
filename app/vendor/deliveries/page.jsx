import { Suspense } from 'react'
import { VendorDeliveries } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorDeliveries/></Suspense> }
