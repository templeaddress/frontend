import { Suspense } from 'react'
import { Backup } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Backup & restore' }
export default function Page() { return <Suspense fallback={null}><Backup/></Suspense> }
