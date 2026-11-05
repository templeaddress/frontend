import { Suspense } from 'react'
import { VendorDonations } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorDonations/></Suspense> }
