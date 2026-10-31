// Vendor dashboards are live (Phase 2); partner and dealer portals stay prototype-only until Phase 3.
const demoRoots = ['/partner', '/dealer']
const deferredPublicRoots = ['/claim']
const liveStaffPages = new Set(['/staff', '/staff/login', '/staff/reviews', '/staff/events', '/staff/special', '/staff/poojas', '/staff/bank-verification', '/staff/charts', '/staff/payouts', '/staff/listing', '/staff/enquiries', '/staff/audit', '/staff/directory/bookings', '/staff/directory/users', '/staff/directory/transactions', '/staff/kyc', '/staff/ownership', '/staff/support', '/staff/wallet-credit'])

// Build-time switch shared by the server middleware and the client footer.
export const demoPortalsEnabled = value => value === 'true'

export function isDemoPortal(pathname) {
  const path = pathname?.replace(/\/$/, '') || '/'
  return demoRoots.some(root => path === root || path.startsWith(`${root}/`)) ||
    deferredPublicRoots.some(root => path === root || path.startsWith(`${root}/`)) ||
    ((path === '/staff' || path.startsWith('/staff/')) && !liveStaffPages.has(path) && !/^\/staff\/reviews\/[0-9a-f-]{36}$/.test(path))
}
