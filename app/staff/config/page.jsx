import { Suspense } from 'react'
import { PlatformConfig } from '@/components/phase1/StaffAdmin'
export const metadata = { title: 'Configuration' }
export default function Page() { return <Suspense fallback={null}><PlatformConfig/></Suspense> }
