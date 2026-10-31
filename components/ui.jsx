'use client'
/**
 * TempleAddress design system — Next.js 16 edition
 * Changes from Vite version:
 *   - 'use client' (uses useState, useEffect, window events)
 *   - Link from next/link  (href= instead of to=)
 *   - ActiveLink replaces NavLink (uses usePathname internally)
 *   - usePathname from next/navigation (replaces useLocation)
 *   - LanguageControl from @/components/LanguageControl
 */
import { Suspense, useCallback, useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ActiveLink from './ActiveLink'
import LanguageControl from './LanguageControl'
import { clientApi, readAuth, subscribeAuth } from '@/lib/client-api'
import { rolesFor, staffLanding } from '@/lib/staff-access'
import { useDemoPortals } from './DemoPortalGate'
import { MessageCircle, Menu, X, Sparkles, Send, ChevronRight, ChevronDown, Bell, ShieldCheck, Lock, Zap, ArrowLeftRight, Rocket, Globe2 } from 'lucide-react'

/* ── BRAND MARK ── */
export const TempleMark = ({ size = 36, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 64 68" className={`shrink-0 ${className}`} aria-hidden>
    <path d="M32 4c14.36 0 26 11.4 26 25.4 0 9.86-5.9 17.9-11.6 24.2-4.2 4.6-8.4 8-11.9 10.2a2 2 0 0 1-2.2 0c-3.5-2.2-7.7-5.6-11.9-10.2C11.9 47.3 6 39.26 6 29.4 6 15.4 17.64 4 32 4Z" fill="#C9541E"/>
    <circle cx="32" cy="29" r="16" fill="#fff"/>
    <g fill="#4A3527">
      <path d="M32 15.2 33.6 18h-3.2Z"/><path d="M32 17.2 38 22H26Z"/>
      <path d="M32 21.1 39.4 26H24.6Z"/><path d="M32 25 40.6 30.2H23.4Z"/>
      <rect x="23.4" y="30" width="17.2" height="7.2" rx="1.1"/>
      <rect x="26.2" y="32" width="2.4" height="5.2" fill="#fff"/>
      <rect x="35.4" y="32" width="2.4" height="5.2" fill="#fff"/>
    </g>
  </svg>
)

export const Logo = ({ light, className = '', markSize = 34 }) => (
  <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
    <TempleMark size={markSize} />
    <span className={`font-display text-xl font-semibold leading-none tracking-tight ${light ? 'text-white' : 'text-brown-800'}`}>
      Temple<span className={light ? 'text-gold-300' : 'text-brown-800'}>Address</span>
    </span>
  </Link>
)

export const GoogleIcon = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} aria-hidden>
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C39.9 37 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>
)

export const TrustBadges = ({ className = '' }) => (
  <div className={`flex flex-wrap items-center gap-2 ${className}`}>
    {[[Zap,'Razorpay'],[ArrowLeftRight,'UPI'],[Globe2,'Digital India'],[Rocket,'Startup India'],[Sparkles,'Kerala Startup Mission']].map(([I, l]) =>
      <span key={l} className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-brown-100"><I size={13} className="text-gold-400"/>{l}</span>)}
  </div>
)

export const Photo = ({ hue = '#7A5238', className = '', label = '', children }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ background: `radial-gradient(120% 90% at 25% 15%,${hue}cc 0%,${hue} 45%,#2E2019 100%)` }}>
    <svg viewBox="0 0 200 120" className="absolute inset-x-0 bottom-0 w-full opacity-30" preserveAspectRatio="none">
      <path d="M0 120 L0 90 L30 90 L40 60 L60 60 L70 40 L100 20 L130 40 L140 60 L160 60 L170 90 L200 90 L200 120Z" fill="#000"/>
    </svg>
    {label && <span className="absolute left-3 top-3 pill bg-black/30 text-white">{label}</span>}
    {children}
  </div>
)

export const Pill = ({ tone = 'n', children }) => {
  const t = { n:'bg-brown-100 text-brown-800', ok:'bg-emerald-50 text-emerald-700', warn:'bg-saffron-50 text-saffron-700', err:'bg-red-50 text-red-700', info:'bg-blue-50 text-blue-700', gold:'bg-gold-300/40 text-brown-800' }[tone]
  return <span className={`pill ${t}`}>{children}</span>
}

export const Field   = ({ label, hint, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="label">{label}</span>{children}
    {hint && <span className="mt-1 block text-xs text-brown-500">{hint}</span>}
  </label>
)
export const Input   = (p) => <input className="input" {...p} />
export const Select  = ({ options, ...p }) => <select className="input" {...p}>{options.map(o => <option key={o}>{o}</option>)}</select>
export const Toggle  = ({ label, defaultChecked, onChange }) => (
  <label className="inline-flex items-center gap-3 text-sm font-medium">
    <input type="checkbox" defaultChecked={defaultChecked} onChange={e => onChange?.(e.target.checked)} className="peer sr-only"/>
    <span className="relative h-6 w-11 rounded-full bg-brown-200 transition peer-checked:bg-emerald-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5"/>
    {label}
  </label>
)

const cellText = v => {
  if (v === null || v === undefined || v === false) return '—'
  if (typeof v === 'string' || typeof v === 'number') return String(v)
  if (Array.isArray(v)) return v.map(cellText).join(' ')
  if (v?.props?.children !== undefined) return cellText(v.props.children)
  return String(v)
}

export function Table({ head, rows, title = 'Record details', rowDetails }) {
  const [sel, setSel] = useState(null)
  const open = (row, i) => setSel({ row, i, extra: typeof rowDetails === 'function' ? rowDetails(row, i) : rowDetails?.[i] })
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <thead><tr>{head.map((h, i) => <th key={i} className="th">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => (
            <tr key={i} tabIndex={0} title="Click for full record" className="cursor-pointer transition hover:bg-brown-50 focus:bg-brown-50 focus:outline-none"
              onClick={e => { const c = e.target.closest('a,button,input,select,textarea,label'); if (!c || /invoice|details|view/i.test(c.textContent)) open(r, i) }}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(r, i) } }}>
              {r.map((c, j) => <td key={j} className="td">{c}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>
      {sel && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-brown-950/60 p-4" role="dialog" aria-modal onClick={() => setSel(null)}>
          <div className="card max-h-[88vh] w-full max-w-2xl overflow-y-auto p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div><div className="text-xs font-semibold uppercase tracking-wide text-saffron-700">Table record</div><h2 className="mt-1 text-xl font-semibold">{title}</h2></div>
              <button onClick={() => setSel(null)} className="rounded-lg p-2 hover:bg-brown-50" aria-label="Close"><X size={18}/></button>
            </div>
            <table className="mt-5 w-full border-separate border-spacing-0">
              <tbody>
                {head.map((lbl, idx) => (
                  <tr key={idx}>
                    <th className="w-[38%] border-b border-brown-100 py-3 pr-4 text-left text-xs font-semibold uppercase text-brown-500">{cellText(lbl)}</th>
                    <td className="border-b border-brown-100 py-3 text-sm font-medium text-brown-900">{cellText(sel.row[idx])}</td>
                  </tr>
                ))}
                {sel.extra && Object.entries(sel.extra).map(([l, v]) => (
                  <tr key={l}>
                    <th className="border-b border-brown-100 py-3 pr-4 text-left text-xs font-semibold uppercase text-brown-500">{l}</th>
                    <td className="border-b border-brown-100 py-3 text-sm font-medium text-brown-900">{cellText(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-5 flex justify-end"><button onClick={() => setSel(null)} className="btn-p">Close</button></div>
          </div>
        </div>
      )}
    </>
  )
}

export const Stat    = ({ v, l, delta }) => (
  <div className="card p-4"><div className="text-2xl font-bold text-brown-900">{v}</div><div className="text-sm text-brown-500">{l}</div>{delta && <div className="mt-1 text-xs font-semibold text-emerald-600">{delta}</div>}</div>
)
export const Section = ({ title, action, children, sub }) => (
  <section className="py-8">
    <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-2xl font-semibold">{title}</h2>{sub && <p className="text-sm text-brown-500">{sub}</p>}</div>{action}</div>
    {children}
  </section>
)
export const Steps   = ({ items, at }) => (
  <ol className="mb-6 flex gap-2">{items.map((s, i) => (
    <li key={s} className={`flex-1 rounded-xl px-3 py-2 text-center text-xs font-semibold ${i < at ? 'bg-brown-900 text-white' : i === at ? 'bg-saffron-500 text-white' : 'bg-brown-100 text-brown-500'}`}>{i + 1}. {s}</li>
  ))}</ol>
)
export const Tabs    = ({ tabs, at, set }) => (
  <div className="mb-5 flex flex-wrap gap-2">{tabs.map((t, i) => (
    <button key={t} onClick={() => set(i)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${i === at ? 'bg-brown-900 text-white' : 'bg-white text-brown-700 shadow-ring hover:bg-brown-50'}`}>{t}</button>
  ))}</div>
)
export const useToast = () => {
  const [m, setM] = useState(null)
  const toast = t => { setM(t); setTimeout(() => setM(null), 1800) }
  const el = m && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-brown-900 px-4 py-2 text-sm text-white shadow-soft">{m}</div>
  return [toast, el]
}
export const Money   = ({ v }) => <span className="tabular-nums">₹{Number(v).toLocaleString('en-IN')}</span>

/* ── PUBLIC SHELL ── */
const pubNav = [['/', 'Home'], ['/temples', 'Temples'], ['/special', 'Special poojas'], ['/festival', 'Festivals'], ['/services', 'Services']]

export function PublicShell({ children, tenant, hideChatbot = false, booking = false }) {
  const demoPortals = useDemoPortals()
  const [open, setOpen] = useState(false)
  const accountPath = useSyncExternalStore(subscribeAuth, () => {
    const session = readAuth()
    if (!session?.access) return '/login'
    if (rolesFor(session.user).length) return staffLanding(session.user)
    return session.user?.is_staff ? '/staff' : '/account'
  }, () => '/login')
  const signedIn = accountPath !== '/login'
  const lightHeader = tenant || booking
  return (
    <div className={`${tenant ? 'tenant' : ''} ${booking ? 'booking-shell' : ''}`}>
      <header className={`sticky top-0 z-30 backdrop-blur border-b ${tenant ? 'bg-white/90 text-brown-900 border-gold-400' : booking ? 'bg-white/95 text-brown-900 border-brown-100' : 'bg-brown-900/95 text-white border-saffron-500/60'}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          {tenant
            ? <Link href="/t/kottur-sree-mahavishnu-temple" className="font-display text-lg font-semibold">{tenant}</Link>
            : <Logo light={!lightHeader} />}
          {!tenant && (
            <nav className="ml-4 hidden gap-1 md:flex">
              {pubNav.map(([href, label]) => (
                <ActiveLink key={href} href={href} end={href === '/'} className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium ${lightHeader
                    ? (isActive ? 'bg-brown-50 text-brown-900' : 'text-brown-700 hover:bg-brown-50')
                    : (isActive ? 'bg-white/15 text-white' : 'text-brown-100 hover:bg-white/10')}`}>
                  {label}
                </ActiveLink>
              ))}
            </nav>
          )}
          <div className="flex-1" />
          <LanguageControl />
          {!booking && <Link href="/whatsapp" className="btn-wa hidden !py-2 md:inline-flex"><MessageCircle size={16}/>WhatsApp</Link>}
          <Link href={accountPath} className={`btn !py-2 ${tenant ? 'bg-brown-900 text-white' : booking ? 'border border-brown-200 bg-white text-brown-800 hover:bg-brown-50' : 'bg-white/15 text-white hover:bg-white/25'}`}>
            {signedIn ? accountPath.startsWith('/staff') ? 'Staff panel' : 'Profile' : booking ? 'Login / Register' : 'Login'}
          </Link>
          <button className={`md:hidden ${lightHeader ? 'text-brown-800' : ''}`} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className={`border-t px-4 py-2 md:hidden ${lightHeader ? 'border-brown-100' : 'border-white/10'}`}>
            {pubNav.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm">{label}</Link>)}
            {!booking && <Link href="/whatsapp" className="block px-3 py-2 text-sm text-[#25D366]">Book on WhatsApp</Link>}
          </div>
        )}
      </header>

      <main className="min-h-[70vh]">{children}</main>

      <footer className="mt-16 bg-brown-900 text-brown-100">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-2 text-sm text-brown-200">A digital address for every temple. Zero platform fee on vazhipadu and donations.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="pill glass text-brown-50"><ShieldCheck size={12} className="text-emerald-300"/>Committee verified</span>
              <span className="pill glass text-brown-50"><Lock size={12} className="text-gold-400"/>Secure payments</span>
            </div>
          </div>
          <div className="text-sm">
            <b className="text-white">For temples</b><br/>
            <Link href="/submit-temple" className="hover:text-white">Submit a temple</Link><br/>
            <Link href="/login?next=/account/listings/new&intent=create-profile" className="hover:text-white">Create a profile</Link><br/>
            <Link href="/vendor" className="hover:text-white">Temple login</Link><br/>
            <Link href="/sponsor" className="hover:text-white">Sponsor a temple</Link><br/>
            <Link href="/support" className="hover:text-white">Help & support</Link>
          </div>
          <div className="text-sm">
            <b className="text-white">Partners</b><br/>
            {demoPortals && <><Link href="/partner" className="hover:text-white">Become a partner</Link><br/>
            <Link href="/dealer" className="hover:text-white">Dealer portal</Link><br/></>}
            <Link href="/staff" className="hover:text-white">Staff panel</Link>
          </div>
          <div className="text-sm">
            <b className="text-white">Devotee support</b><br/>
            <Link href="/whatsapp" className="hover:text-white">WhatsApp +91 9495 041196</Link><br/>
            help@templeaddress.com<br/>
            English · മലയാളം
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-brown-200">Payments by <b className="text-brown-100">Razorpay</b> — TempleAddress never stores card details.</span>
              <TrustBadges />
            </div>
            <div className="flex flex-col gap-1 text-xs text-brown-300 sm:flex-row sm:items-center sm:justify-between">
              <nav aria-label="Policies" className="flex flex-wrap gap-3">
                {[['terms','Terms'],['privacy','Privacy'],['data','Data'],['cancellation','Cancellation'],['refund','Refunds']].map(([path, label]) =>
                  <Link key={path} href={`/policies/${path}`} className="underline hover:text-white">{label}</Link>)}
              </nav>
              <span>© 2026 TempleAddress</span>
            </div>
          </div>
        </div>
      </footer>
      {!hideChatbot && <Chatbot />}
    </div>
  )
}

/* ── DASHBOARD SHELL ──
   Sidebar groups are collapsible; pass collapsible:false to pin always-open.
   defaultOpen:false starts a group collapsed. */
function DashShellContent({ role, user, items, children, badge }) {
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(items.map(g => [g.group, g.defaultOpen !== false])))
  const toggleGroup = name => setOpenGroups(o => ({ ...o, [name]: !o[name] }))
  const primaryLinks = (items.find(g => g.primary) || items[0]).links
  return (
    <div className="min-h-screen bg-brown-50">
      <header className="sticky top-0 z-30 border-b border-saffron-500/60 bg-brown-900 text-white">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-4">
          <Logo light /><Pill tone="gold">{role}</Pill>
          <div className="flex-1" />
          <span className="hidden text-sm text-brown-100 md:block">{user}</span>
          <button className="relative rounded-lg bg-white/10 p-2" aria-label="Notifications">
            <Bell size={16}/>
            {badge && <span className="absolute -right-1 -top-1 rounded-full bg-saffron-500 px-1.5 text-[10px] font-bold">{badge}</span>}
          </button>
          <Link href="/login" className="btn bg-white/15 !py-1.5 text-white">Logout</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1400px] md:grid-cols-[250px_1fr]">
        <aside className="hidden border-r border-brown-100 bg-white p-3 md:block">
          <nav className="space-y-0.5">
            {items.map(g => {
              const isOpen = g.collapsible === false ? true : (openGroups[g.group] ?? true)
              return (
                <div key={g.group}>
                  {g.collapsible === false
                    ? <div className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wide text-brown-500">{g.group}</div>
                    : <button type="button" onClick={() => toggleGroup(g.group)} className="flex w-full items-center justify-between gap-2 rounded-lg px-3 pb-1 pt-4 text-left text-[11px] font-bold uppercase tracking-wide text-brown-500 hover:text-brown-800">
                        <span className="flex items-center gap-1.5">
                          {g.icon && <g.icon size={13}/>}{g.group}
                          {g.badge && <span className="rounded-full bg-saffron-100 px-1.5 py-0.5 text-[10px] font-bold text-saffron-700">{g.badge}</span>}
                        </span>
                        <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? '' : '-rotate-90'}`}/>
                      </button>}
                  {isOpen && (
                    <div className="space-y-0.5 pb-1">
                      {g.links.map(([href, label, I]) => {
                        const active = pathname === href || pathname.startsWith(`${href}/`)
                        return (
                          <Link key={href} href={href} className={`sideitem ${active ? 'active' : ''}`}>
                            {I && <I size={16}/>}{label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>
        <main className="min-w-0 p-4 pb-24 md:p-7">{children}</main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-brown-100 bg-white md:hidden">
        {primaryLinks.slice(0, 4).map(([href, label, I]) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${active ? 'text-saffron-600' : 'text-brown-600'}`}>
              {I && <I size={18}/>}{label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function DashShell(props) {
  return <Suspense fallback={<div className="min-h-screen bg-brown-50" />}><DashShellContent {...props} /></Suspense>
}

/* ── CHATBOT ── answers come from the TempleAddress assistant API (published listing data only) */
export function Chatbot() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [q, setQ] = useState(''), [language, setLanguage] = useState('en')
  const [msgs, setMsgs] = useState([]), [suggestions, setSuggestions] = useState([])
  const slug = pathname?.match(/^\/t\/([^/]+)/)?.[1] || ''
  useEffect(() => {
    if (!open || msgs.length) return
    clientApi(`assistant?language=${language}`, { auth: false }).then(data => { setMsgs([{ me: false, t: data.message }]); setSuggestions(data.suggestions) }).catch(() => setMsgs([{ me: false, t: 'Namaskaram 🙏 Ask about timings, poojas, booking or donations.' }]))
  }, [open, language, msgs.length])
  const ask = useCallback(async text => {
    const t = (text || q).trim(); if (!t || busy) return
    setMsgs(m => [...m, { me: true, t }]); setQ(''); setBusy(true)
    try {
      const data = await clientApi('assistant', { method: 'POST', auth: false, body: { message: t, language, listing_slug: slug } })
      setMsgs(m => [...m, { me: false, t: data.message, listing: data.listing, handoff: data.handoff }]); setSuggestions(data.suggestions || [])
    } catch (err) { setMsgs(m => [...m, { me: false, t: err.message || 'The assistant is unavailable right now.' }]) } finally { setBusy(false) }
  }, [q, busy, language, slug])
  useEffect(() => {
    const h = e => { setOpen(true); if (e.detail) setTimeout(() => ask(e.detail), 250) }
    window.addEventListener('ta:ask', h); return () => window.removeEventListener('ta:ask', h)
  }, [ask])
  // Checkout pages keep a sticky action bar in the same corner; the assistant stays out of the way there.
  if (/^\/(book|donate)\//.test(pathname || '')) return null
  return (
    <>
      <button onClick={() => setOpen(!open)} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-brown-900 px-4 py-3 text-sm font-semibold text-white shadow-soft">
        <Sparkles size={16} className="text-gold-400"/>Ask TempleAddress
      </button>
      {open && (
        <div role="dialog" aria-label="Temple assistant" className="fixed bottom-20 right-5 z-40 flex h-[480px] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-brown-200">
          <div className="flex items-center gap-2 bg-brown-900 px-4 py-3 text-white">
            <Sparkles size={16} className="text-gold-400"/><b className="text-sm">Temple assistant</b>
            <button onClick={() => { setLanguage(l => l === 'en' ? 'ml' : 'en'); setMsgs([]) }} className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[11px]" aria-label="Switch language">{language === 'en' ? 'മലയാളം' : 'English'}</button>
            <button onClick={() => setOpen(false)} className="ml-1 rounded p-0.5 hover:bg-white/10" aria-label="Close chat"><X size={14}/></button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm" aria-live="polite">
            {msgs.map((m, i) => <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.me ? 'ml-auto bg-saffron-500 text-white' : 'bg-brown-50'}`}>{m.t}{m.listing && <Link href={`/t/${m.listing.slug}`} className="mt-1 block text-xs font-semibold text-saffron-700">Open {m.listing.name_en}</Link>}{m.handoff && <Link href="/support" className="mt-1 block text-xs font-semibold text-saffron-700">Raise a support ticket</Link>}</div>)}
            {busy && <div className="w-fit rounded-2xl bg-brown-50 px-3 py-2 text-brown-500">…</div>}
            <div className="flex flex-wrap gap-1 pt-1">
              {suggestions.slice(0, 4).map(s => <button key={s} onClick={() => ask(s)} className="rounded-full border border-brown-200 px-2.5 py-1 text-left text-xs hover:bg-brown-50">{s}</button>)}
            </div>
          </div>
          <form onSubmit={e => { e.preventDefault(); ask() }} className="flex gap-2 border-t border-brown-100 p-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={language === 'ml' ? 'ചോദിക്കൂ…' : 'Ask about a temple, pooja or booking…'} aria-label="Message" maxLength={500} className="input !py-2"/>
            <button className="btn-p !px-3" disabled={busy} aria-label="Send"><Send size={16}/></button>
          </form>
        </div>
      )}
    </>
  )
}

export const Arrow = () => <ChevronRight size={16} className="opacity-60"/>
