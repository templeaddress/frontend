import { Suspense } from 'react'
import { StaffWalletCredit } from '@/components/phase1/StaffModeration'
export const metadata = { title: 'Manual wallet points' }
export default function Page() { return <Suspense fallback={null}><StaffWalletCredit/></Suspense> }
