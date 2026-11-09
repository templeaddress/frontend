import { Suspense } from 'react'
import { StaffPayouts } from '@/components/phase1/Staff'
export const metadata = { title: 'Payouts' }
export default function Page() { return <Suspense fallback={null}><StaffPayouts/></Suspense> }
