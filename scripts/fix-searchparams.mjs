/**
 * Three fixes in one pass:
 *
 * 1. components/pages/*.jsx
 *    react-router useSearchParams returns [params, setParams] (array).
 *    next/navigation useSearchParams returns params directly (not an array).
 *    Fix: const [x]=useSearchParams() → const x=useSearchParams()
 *         const [x, setX]=useSearchParams() → const x=useSearchParams()
 *
 * 2. app/** /page.jsx  (thin wrappers that re-export from components/pages)
 *    Any component that calls useSearchParams() must be inside <Suspense>.
 *    Fix: wrap the default export in <Suspense fallback={null}>
 *
 * 3. app/staff/layout.jsx already uses `const sp = useSearchParams()` correctly,
 *    but its parent route files need Suspense too.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'fs'   // Node 22+

// polyfill globSync for older Node
import { readdirSync, statSync } from 'fs'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')

function findFiles(dir, pattern) {
  const results = []
  function walk(d) {
    for (const name of readdirSync(d)) {
      const full = join(d, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (pattern.test(name)) results.push(full)
    }
  }
  walk(dir)
  return results
}

let fixed = 0

// ── FIX 1: useSearchParams destructuring ─────────────────────────────────────
const pageFiles = findFiles(join(root, 'components/pages'), /\.jsx$/)
for (const file of pageFiles) {
  let c = readFileSync(file, 'utf8')
  const orig = c

  // const [sp]=useSearchParams()  →  const sp=useSearchParams()
  // const [sp, setSp]=useSearchParams()  →  const sp=useSearchParams()
  c = c.replace(/const\s*\[(\w+)(?:\s*,\s*\w+)?\]\s*=\s*useSearchParams\(\)/g, 'const $1 = useSearchParams()')

  if (c !== orig) {
    writeFileSync(file, c, 'utf8')
    const rel = file.replace(root + '\\', '').replace(root + '/', '')
    console.log(`  ✓ Fixed destructuring: ${rel}`)
    fixed++
  }
}

// ── FIX 2: Suspense wrappers on thin app/ route files ────────────────────────
// Only wrap files that re-export a named component directly:
//   export default ComponentName  OR  export { X as default }
// Skip files that already have Suspense or are SSG server components.
const suspensePattern = /<Suspense|generateStaticParams|export const revalidate|'use client'\s*\nimport \{ Suspense/
const reExportPattern = /^export default (\w+)\s*$/m
const clientPagePattern = /^import \{ (\w+) \} from '@\/components\/pages\//m

const routeFiles = findFiles(join(root, 'app'), /^page\.jsx$/)
for (const file of routeFiles) {
  let c = readFileSync(file, 'utf8')
  const orig = c

  // Skip if already has Suspense, is an SSG page, or doesn't import from components/pages
  if (suspensePattern.test(c)) continue
  if (!clientPagePattern.test(c)) continue

  const reExportMatch = reExportPattern.exec(c)
  if (!reExportMatch) continue      // complex file, skip
  const componentName = reExportMatch[1]

  // Add Suspense import and wrap
  if (!c.includes("from 'react'") && !c.includes('import { Suspense }')) {
    c = `import { Suspense } from 'react'\n` + c
  }
  // Replace `export default ComponentName` with a wrapper function
  c = c.replace(
    reExportPattern,
    `export default function Page(props) { return <Suspense fallback={null}><${componentName} {...props}/></Suspense> }`
  )

  if (c !== orig) {
    writeFileSync(file, c, 'utf8')
    const rel = file.replace(root + '\\', '').replace(root + '/', '')
    console.log(`  ✓ Added Suspense: ${rel}`)
    fixed++
  }
}

console.log(`\nDone — ${fixed} files updated.`)
