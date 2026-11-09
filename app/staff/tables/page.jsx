import { Suspense } from 'react'
import { Tables } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Tables' }
export default function Page() { return <Suspense fallback={null}><Tables/></Suspense> }
