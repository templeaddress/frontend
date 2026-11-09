import { Suspense } from 'react'
import { StaffOwnership } from '@/components/phase1/StaffModeration'
export const metadata = { title: 'Claims & transfers' }
export default function Page() { return <Suspense fallback={null}><StaffOwnership/></Suspense> }
