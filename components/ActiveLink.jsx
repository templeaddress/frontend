'use client'
/**
 * Drop-in replacement for React Router's <NavLink>.
 * Accepts either a plain className string OR the function form `({isActive}) => string`
 * that NavLink uses — so converted pages need zero further edits.
 *
 *   <ActiveLink href="/temples" end className={({isActive}) => isActive ? 'active' : ''}>
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ActiveLink({ href, end = false, className, children, ...rest }) {
  const pathname = usePathname()
  const isActive = end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
  const resolved = typeof className === 'function' ? className({ isActive }) : className
  return (
    <Link href={href} className={resolved} {...rest}>
      {children}
    </Link>
  )
}
