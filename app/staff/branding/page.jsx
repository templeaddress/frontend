import { Suspense } from 'react'
import { Branding } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Branding' }
export default function Page() { return <Suspense fallback={null}><Branding/></Suspense> }
