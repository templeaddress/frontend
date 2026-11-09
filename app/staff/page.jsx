import { Suspense } from 'react'
import { StaffQueues } from '@/components/phase1/StaffModeration'
export const metadata = { title: 'Moderator work queues' }
export default function Page() { return <Suspense fallback={null}><StaffQueues/></Suspense> }
