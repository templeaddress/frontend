// Booking date rules shared by the checkout UI and its tests (all dates are IST calendar dates).

export function indiaDate(value = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(value)
  const pick = type => parts.find(part => part.type === type)?.value
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

export const addDays = (isoDate, days) => { const value = new Date(`${isoDate}T00:00:00Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10) }

// Earliest bookable service date (IST): live poojas are today only; others need their lead time and must be booked
// before 7:30 PM IST on the previous day, when that day's chart is locked (Annexure B2/B3). The server re-checks.
export function earliestDate(item, now = new Date()) {
  if (item?.is_live) return indiaDate(now)
  const leadMs = Number(item?.lead_time_hours || 0) * 3600000
  let leadDate = indiaDate(new Date(now.getTime() + leadMs))
  // The lead time counts back from the pooja's start time on that date, not from midnight.
  if (item?.start_time && new Date(`${leadDate}T${item.start_time.slice(0, 8).padEnd(8, ':00')}+05:30`).getTime() - leadMs <= now.getTime()) leadDate = addDays(leadDate, 1)
  const istHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(now).replace(':', '.'))
  const lockDate = addDays(indiaDate(now), istHour >= 19.3 ? 2 : 1)
  return leadDate > lockDate ? leadDate : lockDate
}

// The dates a recurring pooja covers, first date included (mirrors the server's expansion for the summary).
export function recurringDates(first, frequency, count) {
  const start = new Date(`${first}T00:00:00`), dates = []
  for (let n = 0; n < count; n += 1) {
    const day = new Date(start)
    if (frequency === 'daily') day.setDate(start.getDate() + n)
    else if (frequency === 'weekly') day.setDate(start.getDate() + 7 * n)
    else { day.setDate(1); day.setMonth(start.getMonth() + n); day.setDate(Math.min(start.getDate(), new Date(day.getFullYear(), day.getMonth() + 1, 0).getDate())) }
    dates.push(`${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`)
  }
  return dates
}
