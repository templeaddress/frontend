import { Suspense } from 'react'
import StaffLogin from '@/components/phase1/StaffLogin'
export default function Page() { return <Suspense fallback={<p>Loading staff sign in…</p>}><StaffLogin/></Suspense> }
