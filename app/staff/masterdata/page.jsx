import { Suspense } from 'react'
import { MasterData } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Master data' }
export default function Page() { return <Suspense fallback={null}><MasterData/></Suspense> }
