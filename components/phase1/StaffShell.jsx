'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Logo, PublicShell } from '@/components/ui'
import { Menu, X, ChevronDown, Inbox, ListChecks, Building2, CalendarDays, Sparkles, BookOpen, Users, ReceiptText, Landmark, ShieldCheck, ClipboardList, MessageSquare, MessageCircle, History, ExternalLink, LogOut, ArrowLeftRight, Wallet } from 'lucide-react'
import { clientApi, logout, readAuth, subscribeAuth } from '@/lib/client-api'
import { canOpenStaff, canUseStaff, rolesFor, staffLanding, staffLinks } from '@/lib/staff-access'
import { isDemoPortal } from '@/lib/demo-portals'

const StaffContext = createContext(null)
export const useStaffUser = () => useContext(StaffContext)

export function StaffArea({ children }) {
  const pathname = usePathname(), router = useRouter()
  const [user, setUser] = useState(null), [error, setError] = useState(''), [checking, setChecking] = useState(true)
  useEffect(() => {
    if (pathname === '/staff/login' || isDemoPortal(pathname)) return
    let active = true, requestId = 0
    let sessionIdentity = readAuth()?.user?.uuid || readAuth()?.refresh
    async function check() {
      const request = ++requestId
      if (!readAuth()?.access) { setUser(null); router.replace(`/staff/login?next=${encodeURIComponent(pathname)}`); return }
      try {
        setChecking(true); setError('')
        const me = await clientApi('me')
        if (!active || request !== requestId) return
        if (!rolesFor(me).length) throw new Error('An assigned staff role is required. Contact your Portal Admin.')
        setUser(me)
      } catch (err) { if (active && request === requestId) { setUser(null); setError(err.message) } }
      finally { if (active && request === requestId) setChecking(false) }
    }
    check()
    const unsubscribe = subscribeAuth(() => {
      const session = readAuth()
      if (!session?.access) { requestId++; setUser(null); router.replace('/staff/login'); return }
      const nextIdentity = session.user?.uuid || session.refresh
      if (nextIdentity !== sessionIdentity) { sessionIdentity = nextIdentity; setUser(null); check() }
    })
    return () => { active = false; unsubscribe() }
  }, [pathname, router])
  // The existing middleware continues to control deferred prototype routes.
  if (pathname === '/staff/login' || isDemoPortal(pathname)) return children
  if (checking) return <PublicShell><p role="status" className="p-10">Checking staff access…</p></PublicShell>
  if (!user || !canOpenStaff(user, pathname)) return <PublicShell><main className="mx-auto max-w-xl space-y-4 p-10"><h1 className="text-2xl font-semibold">Staff access required</h1><p role="alert">{error || 'Your role does not have access to this page.'}</p>{user && <Link className="btn-g" href={staffLanding(user)}>Open your workspace</Link>}<Link className="btn-g" href="/staff/login">Staff sign in</Link></main></PublicShell>
  return <StaffContext.Provider value={user}>{children}</StaffContext.Provider>
}

export default function StaffShell({ children }) {
  const user = useStaffUser(), router = useRouter(), pathname = usePathname()
  const [error, setError] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false), [openGroups, setOpenGroups] = useState({})
  const roles = rolesFor(user)
  const roleLabel = roles.includes('portal admin') ? 'Portal Admin' : roles.map(role => role[0].toUpperCase() + role.slice(1)).join(' / ')
  const navigation = [
    ['Moderation', ['/staff', '/staff/reviews', '/staff/kyc', '/staff/charts', '/staff/special', '/staff/ownership', '/staff/support', '/staff/wallet-credit']],
    ['Operations', ['/staff/listing', '/staff/events', '/staff/poojas', '/staff/enquiries']],
    ['Directories', ['/staff/directory/users', '/staff/directory/transactions', '/staff/directory/bookings']],
    ['Finance', ['/staff/payouts', '/staff/bank-verification']],
    ['Activity', ['/staff/audit']],
  ].map(([group, paths]) => [group, staffLinks.filter(([url, , role]) => paths.includes(url) && canUseStaff(user, role)).sort((a, b) => paths.indexOf(a[0]) - paths.indexOf(b[0]))]).filter(([, links]) => links.length)
  const icons = { '/staff': Inbox, '/staff/kyc': ShieldCheck, '/staff/ownership': ArrowLeftRight, '/staff/support': MessageCircle, '/staff/wallet-credit': Wallet, '/staff/reviews': ListChecks, '/staff/listing': Building2, '/staff/events': CalendarDays, '/staff/special': Sparkles, '/staff/poojas': BookOpen, '/staff/charts': ClipboardList, '/staff/enquiries': MessageSquare, '/staff/directory/bookings': CalendarDays, '/staff/directory/transactions': ReceiptText, '/staff/directory/users': Users, '/staff/payouts': Landmark, '/staff/bank-verification': ShieldCheck, '/staff/audit': History }
  async function signOut() {
    try { await logout() } catch (err) { setError(err.message) }
    finally { router.replace('/staff/login') }
  }
  return <div className="min-h-screen bg-brown-50"><a href="#staff-main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-white focus:p-3">Skip to workspace</a><header className="sticky top-0 z-40 border-b border-saffron-500/60 bg-brown-900 text-white"><div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:px-6"><button type="button" className="rounded-lg p-2 hover:bg-white/10 lg:hidden" aria-label="Toggle staff navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button><Logo light markSize={30}/><span className="hidden rounded-full bg-gold-300/15 px-3 py-1 text-xs font-semibold text-gold-300 sm:inline-flex">{roleLabel}</span><div className="flex-1"/><Link href="/" className="hidden items-center gap-1.5 text-xs text-brown-100 hover:text-white md:inline-flex"><ExternalLink size={14}/>View website</Link><div className="hidden border-l border-white/15 pl-4 text-right sm:block"><p className="max-w-[220px] truncate text-sm font-semibold">{user?.name || user?.username}</p><p className="text-[11px] text-brown-200">{roleLabel}</p></div><button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/20" aria-label="Logout" onClick={signOut}><LogOut size={15}/><span className="hidden sm:inline">Logout</span></button></div></header>
    <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1600px] lg:grid-cols-[238px_minmax(0,1fr)]">
      {mobileOpen && <button className="fixed inset-0 top-16 z-30 bg-brown-950/50 lg:hidden" aria-label="Close staff navigation" onClick={() => setMobileOpen(false)}/>}
      <aside className={`${mobileOpen ? 'fixed bottom-0 left-0 top-16 z-30 w-[270px] overflow-y-auto shadow-xl' : 'hidden'} border-r border-brown-100 bg-white lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-64px)] lg:w-auto lg:overflow-y-auto lg:shadow-none`}><div className="border-b border-brown-100 px-5 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-saffron-700">Staff panel</p><p className="mt-1 truncate text-sm font-semibold">{user?.name || user?.username}</p><p className="mt-1 text-xs text-brown-500">{roleLabel}</p></div><nav aria-label="Staff navigation" className="space-y-3 p-3">{navigation.map(([group, links]) => <div key={group}><button type="button" className="mb-1 flex w-full items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-brown-500" aria-expanded={openGroups[group] !== false} onClick={() => setOpenGroups(values => ({ ...values, [group]: values[group] === false }))}>{group}<ChevronDown size={14} className={openGroups[group] === false ? '-rotate-90' : ''}/></button>{openGroups[group] !== false && <div className="space-y-1">{links.map(([url, label]) => { const Icon = icons[url]; const active = pathname === url || (url !== '/staff' && pathname.startsWith(`${url}/`)); return <Link key={url} href={url} aria-current={active ? 'page' : undefined} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-saffron-50 text-saffron-700' : 'text-brown-700 hover:bg-brown-50 hover:text-brown-900'}`}>{Icon && <Icon size={17}/>}<span>{label}</span></Link> })}</div>}</div>)}</nav><div className="m-3 border-t border-brown-100 px-3 pt-4"><Link href="/account" className="text-xs text-brown-500 hover:text-saffron-700">My personal account</Link></div></aside>
      <main id="staff-main" className="min-w-0 p-4 sm:p-6 xl:p-8">{error && <p role="alert" className="mb-4 text-red-700">{error}</p>}{children}</main>
    </div></div>
}
