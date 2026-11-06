'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { referralLoginPath } from '@/lib/referral'

function ReferralLink({ href, children, ...props }) {
  const pathname = usePathname(), query = useSearchParams()
  const target = referralLoginPath(pathname, query.toString())
  return <Link {...props} href={target === '/login' ? href : target}>{children}</Link>
}

export default function ReferralSignInLink({ href = '/login', children, ...props }) {
  return <Suspense fallback={<Link {...props} href={href}>{children}</Link>}><ReferralLink {...props} href={href}>{children}</ReferralLink></Suspense>
}
