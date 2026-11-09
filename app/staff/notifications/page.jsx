import { Suspense } from 'react'
import { Notifications } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Language & notifications' }
export default function Page() { return <Suspense fallback={null}><Notifications/></Suspense> }
