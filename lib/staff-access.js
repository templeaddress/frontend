// Navigation is a convenience only; every staff API checks server-side permissions.
export const staffRoles = ['moderator', 'accountant', 'portal admin']
export function rolesFor(user) {
  if (Array.isArray(user?.roles)) return user.roles.filter(role => staffRoles.includes(role))
  // Auth responses use the legacy role field; /me supplies authoritative groups.
  return user?.role === 'admin' ? ['portal admin'] : user?.role === 'accountant' ? ['accountant'] : user?.role === 'staff' ? ['moderator'] : []
}
export function canUseStaff(user, role) {
  const roles = rolesFor(user)
  return roles.includes('portal admin') || roles.includes(role)
}
export const staffLinks = [
  ['/staff', 'Queues', 'moderator'], ['/staff/reviews', 'Listing review', 'moderator'], ['/staff/listing', 'All listings', 'moderator'],
  ['/staff/kyc', 'KYC & partners', 'moderator'], ['/staff/ownership', 'Claims & transfers', 'moderator'], ['/staff/support', 'Support tickets', 'moderator'],
  ['/staff/wallet-credit', 'Manual wallet points', 'moderator'],
  ['/staff/advertisements', 'Sponsor artwork', 'moderator'],
  ['/staff/events', 'Events', 'moderator'], ['/staff/special', 'Special poojas', 'moderator'], ['/staff/poojas', 'Pooja catalogue', 'moderator'],
  ['/staff/directory/bookings', 'Bookings', 'moderator'], ['/staff/directory/users', 'Users', 'moderator'],
  ['/staff/directory/transactions', 'Transactions', 'moderator'], ['/staff/charts', 'Charts', 'moderator'],
  ['/staff/enquiries', 'Enquiries & leads', 'moderator'],
  ['/staff/finance', 'Finance queues', 'accountant'], ['/staff/payouts', 'Payout NEFT batches', 'accountant'], ['/staff/withdrawals', 'Wallet withdrawal NEFT', 'accountant'],
  ['/staff/sponsors', 'Payments received', 'accountant'],
  ['/staff/analytics', 'Analytics dashboard', 'portal admin'], ['/staff/staff-management', 'Staff & dealers', 'portal admin'], ['/staff/tables', 'Advanced · tables', 'portal admin'],
  ['/staff/masterdata', 'Master data', 'portal admin'], ['/staff/gateway-config', 'Payment gateways', 'portal admin'], ['/staff/config', 'Configuration', 'portal admin'],
  ['/staff/plans', 'Sponsors & plans', 'portal admin'], ['/staff/backup', 'Backup & restore', 'portal admin'], ['/staff/branding', 'Branding', 'portal admin'],
  ['/staff/notifications', 'Language & notifications', 'portal admin'], ['/staff/audit', 'Activity & audit logs', 'moderator'],
  ['/staff/bank-verification', 'Bank verification', 'portal admin'],
]
export function staffLanding(user) { return canUseStaff(user, 'moderator') ? '/staff' : '/staff/finance' }
export function canOpenStaff(user, path) {
  const link = staffLinks.find(([url]) => url === path || (url === '/staff/reviews' && /^\/staff\/reviews\/[0-9a-f-]{36}$/.test(path)))
  return Boolean(link && canUseStaff(user, link[2]))
}
export function staffNext(user, path) { return canOpenStaff(user, path) ? path : staffLanding(user) }
