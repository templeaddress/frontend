import { Suspense } from 'react'
import { VendorCharts } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorCharts/></Suspense> }
