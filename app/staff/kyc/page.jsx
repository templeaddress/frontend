import { Suspense } from 'react'
import { StaffKyc } from '@/components/phase1/StaffModeration'
export const metadata = { title: 'KYC & partners' }
export default function Page() { return <Suspense fallback={null}><StaffKyc/></Suspense> }
