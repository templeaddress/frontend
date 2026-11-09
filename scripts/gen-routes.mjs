/**
 * Generates thin app/ route files and dashboard layout files.
 *
 * Public/account pages: re-export the named component from components/pages/
 * Dashboard pages:      layout.jsx (DashShell) + thin page.jsx wrappers
 * SSG pages (t/[slug], festival/[code], etc.):  skipped here — written manually with generateStaticParams
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')

const write = (rel, content) => {
  const p = join(root, rel)
  if (!existsSync(p)) { // Don't overwrite manually-created SSG pages
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, content.trim() + '\n', 'utf8')
    console.log(`  ✓ ${rel}`)
  } else {
    console.log(`  ~ ${rel} (skipped, exists)`)
  }
}

// Helper: thin client page that re-exports a named component
const page = (named, from, meta = '') =>
  `import { ${named} } from '${from}'\nexport default ${named}\n${meta}`

// Helper: client wrapper (for pages that need metadata too)
const clientPage = (named, from, title) => `
import { ${named} } from '${from}'
export const metadata = { title: '${title}' }
export default ${named}
`.trim()

console.log('\n── Public / Devotee pages ──')
write('app/page.jsx',           page('Home', '@/components/pages/public'))
write('app/temples/page.jsx',   clientPage('Temples', '@/components/pages/public', 'Temple Directory'))
write('app/special/page.jsx',   clientPage('Special', '@/components/pages/public', 'Special Poojas'))
write('app/festival/page.jsx',  clientPage('Festivals','@/components/pages/public','Festivals'))
write('app/services/page.jsx',  clientPage('Services', '@/components/pages/public', 'Service Professionals'))
write('app/sponsor/page.jsx',   clientPage('Sponsor',  '@/components/pages/public', 'Sponsor a Temple'))
write('app/login/page.jsx',     clientPage('Login',    '@/components/pages/public', 'Login'))
write('app/submit-temple/page.jsx', clientPage('SubmitTemple','@/components/pages/public','Submit a Temple'))
write('app/whatsapp/page.jsx',  clientPage('WhatsApp', '@/components/pages/public', 'Book on WhatsApp'))
write('app/donate/[slug]/page.jsx',  page('Donate',   '@/components/pages/public'))
write('app/claim/[slug]/page.jsx',   page('Claim',    '@/components/pages/public'))
write('app/listing/[slug]/page.jsx', page('TemplePage','@/components/pages/public'))
write('app/receipt/[bookingCode]/page.jsx', page('BookingReceipt','@/components/pages/booking'))
write('app/preview/listing/[code]/page.jsx', `import ListingPreview from '@/components/pages/listingPreview'\nexport default ListingPreview`)

console.log('\n── Booking (SSG shell + client content) ──')
// /book/[slug] is written manually (needs 'use client' + complex state)
// /t/[slug] is written manually (SSG + generateMetadata)
// /festival/[code] is written manually (SSG + generateMetadata)
// /service/[id] is written manually (SSG + generateMetadata)
// /special/[id] is written manually (SSG + generateMetadata)
// /policies/[kind] is written manually (SSG)

console.log('\n── Account (all client) ──')
write('app/account/page.jsx',                   clientPage('Account',          '@/components/pages/account', 'My Account'))
write('app/account/listings/page.jsx',          clientPage('UserListings',     '@/components/pages/account', 'My Listings'))
write('app/account/listings/new/page.jsx',      clientPage('UserCreateListing','@/components/pages/account', 'Create Listing'))
write('app/account/listings/[slug]/edit/page.jsx', clientPage('UserEditListing','@/components/pages/account','Edit Listing'))
write('app/account/partner-application/page.jsx',  clientPage('PartnerApplication','@/components/pages/account','Partner Application'))

// ── VENDOR DASHBOARD ──────────────────────────────────────────────────────────
console.log('\n── Vendor · Temple committee ──')
const vendorNav = [
  ['/vendor',          'Today',      'LayoutDashboard'],
  ['/vendor/bookings', 'Bookings',   'CalendarDays'],
  ['/vendor/charts',   'Charts',     'BarChart2'],
  ['/vendor/poojas',   'Poojas',     'BookOpen'],
  ['/vendor/donations','Donations',  'HeartHandshake'],
  ['/vendor/payouts',  'Payouts',    'Banknote'],
  ['/vendor/settings', 'Settings',  'Settings'],
  ['/vendor/editor',   'Page editor','PenLine'],
  ['/vendor/data',     'My data',   'Database'],
]
write('app/vendor/layout.jsx', `
'use client'
import { DashShell } from '@/components/ui'
import { LayoutDashboard, CalendarDays, BarChart2, BookOpen, HeartHandshake, Banknote, Settings, PenLine, Database } from 'lucide-react'

const items = [{ group: 'Temple', collapsible: false, primary: true, links: [
  ['/vendor',           'Today',       LayoutDashboard],
  ['/vendor/bookings',  'Bookings',    CalendarDays],
  ['/vendor/charts',    'Charts',      BarChart2],
  ['/vendor/poojas',    'Poojas & prices', BookOpen],
  ['/vendor/donations', 'Donations',   HeartHandshake],
  ['/vendor/payouts',   'Payouts',     Banknote],
  ['/vendor/settings',  'Settings',    Settings],
  ['/vendor/editor',    'Page editor', PenLine],
  ['/vendor/data',      'My data',     Database],
]}]

export default function VendorLayout({ children }) {
  return <DashShell role="Temple Committee" user="Temple Admin" items={items} badge="3">{children}</DashShell>
}
`)
write('app/vendor/page.jsx',           page('VToday',      '@/components/pages/vendor'))
write('app/vendor/bookings/page.jsx',  page('VBookings',   '@/components/pages/vendor'))
write('app/vendor/charts/page.jsx',    page('VCharts',     '@/components/pages/vendor'))
write('app/vendor/charts/[chartId]/page.jsx', page('VChartDetail','@/components/pages/vendor'))
write('app/vendor/poojas/page.jsx',    page('VPoojas',     '@/components/pages/vendor'))
write('app/vendor/donations/page.jsx', page('VDonations',  '@/components/pages/vendor'))
write('app/vendor/payouts/page.jsx',   page('VPayouts',    '@/components/pages/vendor'))
write('app/vendor/settings/page.jsx',  page('VSettings',   '@/components/pages/vendor'))
write('app/vendor/editor/page.jsx',    page('VPage',       '@/components/pages/vendor'))
write('app/vendor/data/page.jsx',      page('VData',       '@/components/pages/vendor'))

// ── FESTIVAL ADMIN ────────────────────────────────────────────────────────────
console.log('\n── Vendor · Festival committee ──')
write('app/festival-admin/layout.jsx', `
'use client'
import { DashShell } from '@/components/ui'
import { LayoutDashboard, CalendarDays, Gift, BookOpen, Sparkles, Globe2, Settings } from 'lucide-react'

const items = [{ group: 'Festival', collapsible: false, primary: true, links: [
  ['/festival-admin',             'Overview',    LayoutDashboard],
  ['/festival-admin/programme',   'Programme',   CalendarDays],
  ['/festival-admin/offerings',   'Offerings',   Gift],
  ['/festival-admin/bookings',    'Bookings',    BookOpen],
  ['/festival-admin/sponsors',    'Sponsors',    Sparkles],
  ['/festival-admin/profile',     'Festival page', Globe2],
  ['/festival-admin/settings',    'Settings',    Settings],
]}]

export default function FestivalAdminLayout({ children }) {
  return <DashShell role="Festival Committee" user="Festival Convenor" items={items}>{children}</DashShell>
}
`)
write('app/festival-admin/page.jsx',           page('FOverview',  '@/components/pages/vendorFestival'))
write('app/festival-admin/programme/page.jsx', page('FProgramme', '@/components/pages/vendorFestival'))
write('app/festival-admin/offerings/page.jsx', page('FOfferings', '@/components/pages/vendorFestival'))
write('app/festival-admin/bookings/page.jsx',  page('FBookings',  '@/components/pages/vendorFestival'))
write('app/festival-admin/sponsors/page.jsx',  page('FSponsors',  '@/components/pages/vendorFestival'))
write('app/festival-admin/profile/page.jsx',   page('FPage',      '@/components/pages/vendorFestival'))
write('app/festival-admin/settings/page.jsx',  page('FSettings',  '@/components/pages/vendorFestival'))

// ── SERVICE ADMIN ─────────────────────────────────────────────────────────────
console.log('\n── Vendor · Service provider ──')
write('app/service-admin/layout.jsx', `
'use client'
import { DashShell } from '@/components/ui'
import { LayoutDashboard, CalendarDays, Briefcase, MessageSquare, Star, User } from 'lucide-react'

const items = [{ group: 'Service Provider', collapsible: false, primary: true, links: [
  ['/service-admin',              'Summary',     LayoutDashboard],
  ['/service-admin/appointments', 'Appointments', CalendarDays],
  ['/service-admin/services',     'Services',    Briefcase],
  ['/service-admin/enquiries',    'Enquiries',   MessageSquare],
  ['/service-admin/reviews',      'Reviews',     Star],
  ['/service-admin/profile',      'Profile & page', User],
]}]

export default function ServiceAdminLayout({ children }) {
  return <DashShell role="Service Provider" user="Provider" items={items}>{children}</DashShell>
}
`)
write('app/service-admin/page.jsx',              page('SSummary',     '@/components/pages/vendorService'))
write('app/service-admin/appointments/page.jsx', page('SAppointments','@/components/pages/vendorService'))
write('app/service-admin/services/page.jsx',     page('SServices',    '@/components/pages/vendorService'))
write('app/service-admin/enquiries/page.jsx',    page('SEnquiries',   '@/components/pages/vendorService'))
write('app/service-admin/reviews/page.jsx',      page('SReviews',     '@/components/pages/vendorService'))
write('app/service-admin/profile/page.jsx',      page('SProfile',     '@/components/pages/vendorService'))

// ── PARTNER ───────────────────────────────────────────────────────────────────
console.log('\n── Partner ──')
write('app/partner/layout.jsx', `
'use client'
import { DashShell } from '@/components/ui'
import { Wallet, User, Building2, Share2, Send, ClipboardList } from 'lucide-react'

const items = [{ group: 'Partner', collapsible: false, primary: true, links: [
  ['/partner',             'Wallet',      Wallet],
  ['/partner/profile',     'Profile',     User],
  ['/partner/listings',    'Listings',    Building2],
  ['/partner/share',       'Share',       Share2],
  ['/partner/submit',      'Submit',      Send],
  ['/partner/submissions', 'Submissions', ClipboardList],
]}]

export default function PartnerLayout({ children }) {
  return <DashShell role="Field Partner" user="Partner" items={items}>{children}</DashShell>
}
`)
write('app/partner/page.jsx',                    page('AWallet',     '@/components/pages/partners'))
write('app/partner/profile/page.jsx',            page('AProfile',    '@/components/pages/partners'))
write('app/partner/listings/page.jsx',           page('AListings',   '@/components/pages/partners'))
write('app/partner/listings/[slug]/edit/page.jsx', page('AEditListing','@/components/pages/partners'))
write('app/partner/share/page.jsx',              page('AShare',      '@/components/pages/partners'))
write('app/partner/submit/page.jsx',             page('ASubmit',     '@/components/pages/partners'))
write('app/partner/submissions/page.jsx',        page('ASubmissions','@/components/pages/partners'))

// ── DEALER ────────────────────────────────────────────────────────────────────
console.log('\n── Dealer ──')
write('app/dealer/layout.jsx', `
'use client'
import { DashShell } from '@/components/ui'
import { LayoutDashboard, Wallet, User, Users } from 'lucide-react'

const items = [{ group: 'Dealer', collapsible: false, primary: true, links: [
  ['/dealer',           'Dashboard', LayoutDashboard],
  ['/dealer/wallet',    'Wallet',    Wallet],
  ['/dealer/profile',   'Profile',   User],
  ['/dealer/partners',  'Partners',  Users],
]}]

export default function DealerLayout({ children }) {
  return <DashShell role="Dealer" user="Dealer" items={items}>{children}</DashShell>
}
`)
write('app/dealer/page.jsx',          page('DDash',    '@/components/pages/partners'))
write('app/dealer/wallet/page.jsx',   page('DWallet',  '@/components/pages/partners'))
write('app/dealer/profile/page.jsx',  page('DProfile', '@/components/pages/partners'))
write('app/dealer/partners/page.jsx', page('DPartners','@/components/pages/partners'))

// ── STAFF ─────────────────────────────────────────────────────────────────────
console.log('\n── Staff (3 sub-roles via ?role= searchParam) ──')
write('app/staff/layout.jsx', `
'use client'
import { DashShell } from '@/components/ui'
import { useSearchParams } from 'next/navigation'
import {
  LayoutDashboard, ClipboardList, UserCheck, BarChart2, Sparkles,
  Banknote, ArrowDownToLine, Landmark, Users, Database, Settings,
  Bell, ShieldCheck, FileText, Globe2, Package, CreditCard, Archive,
  TrendingUp, Key, Wallet
} from 'lucide-react'

const moderatorItems = [
  { group: 'Moderator', collapsible: false, primary: true, links: [
    ['/staff?role=moderator',   'Dashboard',  LayoutDashboard],
    ['/staff/listing?role=moderator', 'Listings', ClipboardList],
    ['/staff/kyc?role=moderator',     'KYC',     UserCheck],
    ['/staff/charts?role=moderator',  'Charts',  BarChart2],
    ['/staff/special?role=moderator', 'Special poojas', Sparkles],
    ['/staff/ownership?role=moderator','Ownership', Landmark],
    ['/staff/support?role=moderator', 'Support', ClipboardList],
    ['/staff/directory/bookings?role=moderator','Bookings directory', Database],
  ]},
]
const accountantItems = [
  { group: 'Accountant', collapsible: false, primary: true, links: [
    ['/staff?role=accountant',  'Dashboard',  LayoutDashboard],
    ['/staff/payouts?role=accountant',     'Payouts',    Banknote],
    ['/staff/withdrawals?role=accountant', 'Withdrawals', ArrowDownToLine],
    ['/staff/sponsors?role=accountant',    'Sponsors',   Sparkles],
  ]},
]
const adminItems = [
  { group: 'Admin', collapsible: false, primary: true, links: [
    ['/staff?role=admin',       'Dashboard',  LayoutDashboard],
    ['/staff/analytics?role=admin','Analytics', TrendingUp],
    ['/staff/tables?role=admin','Tables',     Database],
  ]},
  { group: 'Configuration', defaultOpen: false, links: [
    ['/staff/staff-management?role=admin', 'Staff',       Users],
    ['/staff/masterdata?role=admin',       'Master data', Settings],
    ['/staff/gateway-config?role=admin',   'Gateways',    Key],
    ['/staff/plans?role=admin',            'Plans',       Package],
    ['/staff/config?role=admin',           'Config',      Settings],
    ['/staff/branding?role=admin',         'Branding',    Globe2],
    ['/staff/notifications?role=admin',    'Notifications',Bell],
    ['/staff/audit-logs?role=admin',       'Audit logs',  FileText],
    ['/staff/backup?role=admin',           'Backup',      Archive],
    ['/staff/wallet-credit?role=admin',    'Wallet credit',Wallet],
  ]},
]

export default function StaffLayout({ children }) {
  const sp = useSearchParams()
  const role = sp.get('role') || 'admin'
  const items = role === 'moderator' ? moderatorItems : role === 'accountant' ? accountantItems : adminItems
  const label = role === 'moderator' ? 'Moderator' : role === 'accountant' ? 'Accountant' : 'Portal Admin'
  return <DashShell role={label} user="Staff" items={items} badge="5">{children}</DashShell>
}
`)
write('app/staff/page.jsx',                clientPage('SQueues',          '@/components/pages/partners', 'Staff Dashboard'))
write('app/staff/analytics/page.jsx',      clientPage('SAnalytics',       '@/components/pages/partners', 'Analytics'))
write('app/staff/listing/page.jsx',        clientPage('SListing',         '@/components/pages/partners', 'Listing Queue'))
write('app/staff/kyc/page.jsx',            clientPage('SKyc',             '@/components/pages/partners', 'KYC Queue'))
write('app/staff/charts/page.jsx',         clientPage('SCharts',          '@/components/pages/partners', 'Daily Charts'))
write('app/staff/special/page.jsx',        clientPage('SSpecial',         '@/components/pages/partners', 'Special Poojas'))
write('app/staff/support/page.jsx',        clientPage('SSupport',         '@/components/pages/partners', 'Support'))
write('app/staff/review/[queue]/[id]/page.jsx', clientPage('SReviewDetail','@/components/pages/partners','Review'))
write('app/staff/payouts/page.jsx',        clientPage('SPayouts',         '@/components/pages/partners', 'Payouts'))
write('app/staff/withdrawals/page.jsx',    clientPage('SWithdrawals',     '@/components/pages/partners', 'Withdrawals'))
write('app/staff/ownership/page.jsx',      clientPage('SOwnership',       '@/components/pages/partners', 'Ownership'))
write('app/staff/sponsors/page.jsx',       clientPage('SSponsors',        '@/components/pages/partners', 'Sponsors'))
write('app/staff/backup/page.jsx',         clientPage('SBackup',          '@/components/pages/partners', 'Backup'))
write('app/staff/wallet-credit/page.jsx',  clientPage('SWalletCredit',    '@/components/pages/partners', 'Wallet Credit'))
write('app/staff/config/page.jsx',         clientPage('SConfig',          '@/components/pages/partners', 'Config'))
write('app/staff/tables/page.jsx',         clientPage('STables',          '@/components/pages/partners', 'Tables'))
write('app/staff/staff-management/page.jsx',clientPage('SStaffManagement','@/components/pages/partners', 'Staff Management'))
write('app/staff/masterdata/page.jsx',     clientPage('SMasterData',      '@/components/pages/partners', 'Master Data'))
write('app/staff/gateway-config/page.jsx', clientPage('SGatewayConfig',   '@/components/pages/partners', 'Gateway Config'))
write('app/staff/plans/page.jsx',          clientPage('SPlansAdmin',      '@/components/pages/partners', 'Plans'))
write('app/staff/branding/page.jsx',       clientPage('SBranding',        '@/components/pages/partners', 'Branding'))
write('app/staff/notifications/page.jsx',  clientPage('SNotifications',   '@/components/pages/partners', 'Notifications'))
write('app/staff/audit-logs/page.jsx',     clientPage('SAuditLogs',       '@/components/pages/partners', 'Audit Logs'))
write('app/staff/directory/bookings/page.jsx', `
import { StaffBookingsDirectory } from '@/components/pages/staffDirectory'
export default StaffBookingsDirectory
`)
write('app/staff/directory/[kind]/page.jsx', `
import { StaffDirectory } from '@/components/pages/staffDirectory'
export default StaffDirectory
`)

console.log('\n✅ All route files generated.')
