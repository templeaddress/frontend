import { Suspense } from 'react'
import { StaffSupport } from '@/components/phase1/StaffModeration'
export const metadata = { title: 'Support tickets' }
export default function Page() { return <Suspense fallback={null}><StaffSupport/></Suspense> }
