import { Suspense } from 'react'
import { ServiceProfile } from '@/components/phase1/Vendor'
export default function Page() { return <Suspense fallback={null}><ServiceProfile/></Suspense> }
