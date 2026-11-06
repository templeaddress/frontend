export const sponsorItemKey = row => `${row.kind}:${row.code}`

export function sponsorshipItems(catalogue) {
  const packages = (catalogue?.sponsor_packages || []).map(row => ({ ...row, benefits: row.benefits || [], kind: 'package', unit: row.duration_days === 365 ? '/yr' : `/${row.duration_days} days` }))
  const plans = (catalogue?.plans || []).map(row => ({ ...row, benefits: row.benefits || [], kind: 'plan', unit: row.one_time ? '/one time' : row.validity_days === 365 ? '/yr' : `/${row.validity_days} days` }))
  return [...packages, ...plans.filter(row => !row.one_time), ...plans.filter(row => row.one_time)]
}

export function sponsorshipPreview(price, percent) {
  // Match decimal half-up rounding for the displayed estimate. The server prices the final order.
  const cents = Math.round(Number(price || 0) * 100)
  const rate = Math.round(Number(percent ?? 18) * 10000)
  const taxCents = Math.floor((cents * rate + 500000) / 1000000)
  return { subtotal: cents / 100, tax: taxCents / 100, total: (cents + taxCents) / 100 }
}
