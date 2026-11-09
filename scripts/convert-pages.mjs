/**
 * Converts src/pages/*.jsx → components/pages/*.jsx
 *
 * Changes applied:
 *  1. 'use client' directive added at top
 *  2. react-router-dom → next/link + next/navigation
 *  3. <Link to="..."> → <Link href="...">
 *  4. useNavigate() → shim that wraps useRouter().push
 *  5. useLocation()  → usePathname()
 *  6. NavLink        → ActiveLink (same prop API via components/ActiveLink)
 *  7. Relative imports → @/lib/* and @/components/*
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')

const files = [
  'public.jsx',
  'account.jsx',
  'vendor.jsx',
  'vendorFestival.jsx',
  'vendorService.jsx',
  'partners.jsx',
  'booking.jsx',
  'checkout.jsx',
  'staffDirectory.jsx',
  'staffListingReview.jsx',
  'listingPreview.jsx',
  'policy.jsx',
]

mkdirSync(join(root, 'components/pages'), { recursive: true })

for (const file of files) {
  let c = readFileSync(join(root, 'src/pages', file), 'utf8')

  // ── 1. Add 'use client' ──────────────────────────────────────────────────
  c = `'use client'\n` + c

  // ── 2. Replace react-router-dom imports ─────────────────────────────────
  c = c.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"]react-router-dom['"]/g,
    (_, imports) => {
      const parts = imports.split(',').map(s => s.trim()).filter(Boolean)
      const lines = []

      if (parts.includes('Link')) lines.push("import Link from 'next/link'")

      const navParts = []
      if (parts.includes('useNavigate'))    navParts.push('useRouter')
      if (parts.includes('useParams'))      navParts.push('useParams')
      if (parts.includes('useSearchParams')) navParts.push('useSearchParams')
      if (parts.includes('useLocation'))    navParts.push('usePathname')
      if (navParts.length) lines.push(`import { ${navParts.join(', ')} } from 'next/navigation'`)

      if (parts.includes('NavLink'))
        lines.push("import ActiveLink from '@/components/ActiveLink'")

      return lines.join('\n') || '// (react-router-dom removed)'
    }
  )

  // ── 3. <Link to= → <Link href= ──────────────────────────────────────────
  // Handle: <Link to=  <Link key={x} to=  <Link className="..." to=  etc.
  c = c.replace(/<Link(\s[^>]*?)\sto=/g,  '<Link$1 href=')
  c = c.replace(/<Link\sto=/g,             '<Link href=')

  // ── 4. useNavigate shim ──────────────────────────────────────────────────
  // const foo = useNavigate()  →  const router = useRouter(); const foo = (p, o) => router.push(p, o)
  c = c.replace(
    /const\s+(\w+)\s*=\s*useNavigate\(\)/g,
    'const router = useRouter(); const $1 = (path, opts) => router.push(path, opts)'
  )

  // ── 5. useLocation() → usePathname() ────────────────────────────────────
  c = c.replace(/const\s+(\w+)\s*=\s*useLocation\(\)/g, 'const $1 = usePathname()')
  // location.pathname / loc.pathname → the variable itself (now a string)
  c = c.replace(/(\w+)\.pathname/g, (m, v) => {
    // Only replace if the variable was useLocation(); heuristic: single-word ending in 'loc' or 'location'
    if (/^loc(ation)?$/i.test(v)) return v
    return m  // leave other .pathname accesses alone
  })

  // ── 6. NavLink → ActiveLink ──────────────────────────────────────────────
  c = c.replace(/\bNavLink\b/g, 'ActiveLink')

  // ── 7. Fix relative imports ──────────────────────────────────────────────
  const importMap = {
    "'../ui'":                    "'@/components/ui'",
    '"../ui"':                    '"@/components/ui"',
    "'../data'":                  "'@/lib/data'",
    '"../data"':                  '"@/lib/data"',
    "'../booking'":               "'@/lib/booking'",
    '"../booking"':               '"@/lib/booking"',
    "'../listingQr'":             "'@/lib/listingQr'",
    '"../listingQr"':             '"@/lib/listingQr"',
    "'../listingBasics'":         "'@/lib/listingBasics'",
    '"../listingBasics"':         '"@/lib/listingBasics"',
    "'../staffListingReviews'":   "'@/lib/staffListingReviews'",
    '"../staffListingReviews"':   '"@/lib/staffListingReviews"',
    "'../ListingQr.jsx'":         "'@/components/ListingQr'",
    '"../ListingQr.jsx"':         '"@/components/ListingQr"',
    "'./checkout'":               "'@/components/pages/checkout'",
    '"./checkout"':               '"@/components/pages/checkout"',
  }
  for (const [from, to] of Object.entries(importMap)) {
    c = c.replaceAll(from, to)
  }

  writeFileSync(join(root, 'components/pages', file), c, 'utf8')
  console.log(`✓ ${file}`)
}

console.log('\nAll pages converted to components/pages/')
