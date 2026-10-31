import { Suspense } from 'react'
import { VendorBookings } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorBookings/></Suspense> }
