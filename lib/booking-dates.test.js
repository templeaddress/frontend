import test from 'node:test'
import assert from 'node:assert/strict'

test('recurring pooja dates include the first date and clamp month ends', async () => {
  const { recurringDates } = await import('./booking-dates.js')
  assert.deepEqual(recurringDates('2026-11-02', 'weekly', 3), ['2026-11-02', '2026-11-09', '2026-11-16'])
  assert.deepEqual(recurringDates('2026-01-31', 'monthly', 3), ['2026-01-31', '2026-02-28', '2026-03-31'])
  assert.deepEqual(recurringDates('2026-12-31', 'daily', 2), ['2026-12-31', '2027-01-01'])
})
