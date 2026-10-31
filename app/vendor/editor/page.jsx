import { Suspense } from 'react'
import { VendorEditor } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><VendorEditor/></Suspense> }
