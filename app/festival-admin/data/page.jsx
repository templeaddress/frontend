import { Suspense } from 'react'
import { VendorData } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorData/></Suspense> }
