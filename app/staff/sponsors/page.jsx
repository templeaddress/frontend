import { Suspense } from 'react'
import { PaymentsReceived } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Payments received' }
export default function Page() { return <Suspense fallback={null}><PaymentsReceived/></Suspense> }
