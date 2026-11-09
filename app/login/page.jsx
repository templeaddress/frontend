import { Suspense } from 'react'
import Phase1Login from '@/components/phase1/Auth'
export const metadata = { title: 'Login', robots: { index: false, follow: false } }
export default function Page() { return <Suspense fallback={null}><Phase1Login/></Suspense> }
