// Demo-only booking rules. Production must recheck capacity and payment on the server.
export const bookingKey = 'ta-pooja-bookings-v1'
export function readBookings() { if (typeof window === 'undefined') return []; try { return JSON.parse(window.sessionStorage.getItem(bookingKey) || '[]') } catch { return [] } }
export const indiaDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
function time24(value) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(value || '')
  if (!match) return '00:00'
  return `${String(Number(match[1]) % 12 + (/PM/i.test(match[3]) ? 12 : 0)).padStart(2, '0')}:${match[2]}`
}
export function unavailable(temple, pooja, date, quantity = 1, records = [], now = new Date()) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return 'Quantity must be a whole number between 1 and 100.'
  if (!temple.bookable || pooja.bookable === false || pooja.bookingType === 'Offline') return 'Online booking is unavailable. Please contact the temple.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < indiaDate(now)) return 'Choose today or a future date.'
  if (pooja.availableFrom && date < pooja.availableFrom || pooja.availableTo && date > pooja.availableTo || pooja.unavailableDates?.includes(date)) return 'This date is unavailable.'
  const start = new Date(`${date}T${time24(pooja.startTime)}:00+05:30`)
  if (!pooja.startTime || !pooja.endTime) return 'Time slots have not been configured. Please contact the temple.'
  const end = new Date(`${date}T${time24(pooja.endTime || pooja.startTime)}:00+05:30`)
  if (pooja.availableWeekdays && !pooja.availableWeekdays.includes(new Date(`${date}T12:00:00+05:30`).getUTCDay())) return 'This pooja is not offered on this weekday.'
  if (end <= now) return 'This time slot has ended.'
  if (!pooja.live) {
    const hours = Number(pooja.cutoffHours || 0)
    if (hours > 0 && now >= new Date(start.getTime() - hours * 3600000)) return `Booking closes ${hours} hours before this pooja.`
    const days = Number(/^(\d+) days? ahead$/.exec(pooja.minBookingTime || '')?.[1] || 0)
    const calendarDaysAhead = (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${indiaDate(now)}T00:00:00Z`)) / 86400000
    if (days > 0 && calendarDaysAhead < days) return `Book this pooja at least ${days} calendar day${days === 1 ? '' : 's'} ahead.`
  }
  const used = records.filter(r => r.status === 'paid' && r.templeCode === temple.code).reduce((sum, record) => {
    const items = Array.isArray(record.items) ? record.items : [record]
    return sum + items.filter(item => (item.code || item.poojaCode) === pooja.code && item.dates?.includes(date)).reduce((count, item) => count + item.quantity, 0)
  }, 0)
  if (pooja.dailyLimit > 0 && used + quantity > pooja.dailyLimit) return `Only ${Math.max(0, pooja.dailyLimit - used)} places remain for this date.`
  return ''
}

export function bookingCartIssue(temple, items, records = [], now = new Date()) {
  for (const item of items) {
    const pooja = temple.poojas.find(candidate => candidate.code === item.code)
    if (!pooja) return {id: item.id, reason: 'This pooja is no longer available.'}
    if (!item.date) return {id: item.id, reason: 'Choose pooja date to validate booking availability.'}
    if (item.recurring && (!item.nextDate || item.nextDate <= item.date)) return {id: item.id, reason: 'Next recurring date must be after the first date.'}
    const reserved = items.filter(other => other.id !== item.id).map(other => ({status: 'paid', templeCode: temple.code, poojaCode: other.code, dates: other.dates, quantity: other.quantity}))
    for (const date of item.dates) {
      const reason = unavailable(temple, pooja, date, item.quantity, [...records, ...reserved], now)
      if (reason) return {id: item.id, reason: `${pooja.name}: ${reason}`}
    }
  }
  return null
}

export function upsertBookingItem(items, item, editingId = null) {
  return editingId ? items.map(selected => selected.id === editingId ? item : selected) : [...items, item]
}

export function bookingReceiptRows(record) {
  const items = Array.isArray(record.items) && record.items.length ? record.items : [{
    id: record.poojaCode, pooja: record.pooja, name: record.name, kind: record.kind,
    ritual: record.ritual, dates: record.dates, slot: record.slot,
    quantity: record.quantity, unitPrice: record.unitPrice,
  }]
  return items.flatMap((item, index) => (item.dates || []).map(date => ({
    id: `${item.id || index}-${date}`,
    pooja: item.pooja,
    devoteeName: item.name,
    ritual: `${item.kind}: ${item.ritual}`,
    bookingDate: date,
    slot: item.slot,
    delivery: item.prasadCollection === 'Collect at Counter' ? 'Counter' : item.prasadCollection || '--',
    quantity: item.quantity,
    amount: item.unitPrice * item.quantity,
  })))
}
