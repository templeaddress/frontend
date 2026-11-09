import { Suspense } from 'react'
import { StaffDealers } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Staff & dealers' }
export default function Page() { return <Suspense fallback={null}><StaffDealers/></Suspense> }
