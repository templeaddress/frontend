import { Suspense } from 'react'
import { Withdrawals } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Wallet withdrawal NEFT' }
export default function Page() { return <Suspense fallback={null}><Withdrawals/></Suspense> }
