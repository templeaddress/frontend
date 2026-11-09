import { Suspense } from 'react'
import StaffDirectory from '@/components/phase1/StaffDirectory'
import { StaffDirectory as LegacyDirectory } from '@/components/pages/staffDirectory'
export default async function Page({ params }) {
  const { kind } = await params
  return <Suspense fallback={null}>{['users', 'transactions'].includes(kind) ? <StaffDirectory kind={kind} key={kind}/> : <LegacyDirectory/>}</Suspense>
}
