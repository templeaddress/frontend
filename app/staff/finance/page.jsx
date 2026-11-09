import { Suspense } from 'react'
import { FinanceQueues } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Finance queues' }
export default function Page() { return <Suspense fallback={null}><FinanceQueues/></Suspense> }
