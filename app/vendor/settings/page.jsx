import { Suspense } from 'react'
import { VendorSettings } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorSettings/></Suspense> }
