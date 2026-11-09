// An unset NEXT_PUBLIC_APP_ENV is treated as production so the live site is never de-indexed by omission.
export const isProductionSite = (value = process.env.NEXT_PUBLIC_APP_ENV) => !value || value === 'production'
