import { Suspense } from 'react'
import { VendorDashboard } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorDashboard/></Suspense> }
