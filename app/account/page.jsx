import { Suspense } from 'react'
import { Phase1Account } from '@/components/phase1/Account'
export const metadata = { title: 'My Account' }
export default function Page() { return <Suspense fallback={null}><Phase1Account/></Suspense> }
