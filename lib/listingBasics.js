export function templeTimingFields(timings = '') {
  const fields = { morningOpening: '', morningClosing: '', eveningOpening: '', eveningClosing: '' }
  const toTime = (hour, minute, period) => {
    hour = Number(hour)
    if (Number(minute) > 59 || hour > (period ? 12 : 23) || (period && hour < 1)) return ''
    if (period) hour = hour % 12 + (period.toUpperCase() === 'PM' ? 12 : 0)
    return `${String(hour).padStart(2, '0')}:${minute}`
  }
  timings.split(/[·|;]/).slice(0, 2).forEach((range, index) => {
    const match = range.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
    if (!match) return
    const period = index === 1 || (match[3] || match[6] || '').toUpperCase() === 'PM' ? 'evening' : 'morning'
    fields[`${period}Opening`] = toTime(match[1], match[2], match[3] || match[6])
    fields[`${period}Closing`] = toTime(match[4], match[5], match[6] || match[3])
  })
  return fields
}

// Drafts previously stored two main-deity selects, three other-deity selects,
// management and a free-text timing range after the first four basic fields.
export function migrateTempleBasics(saved) {
  if (!saved || saved.length !== 11 || saved[4]?.type !== 'select-one' || saved[5]?.type !== 'select-one' || saved[10]?.type !== 'text') return saved
  const values = [...new Set(saved.slice(5, 9).map(field => field.value).filter(value => value && value !== 'Not selected'))]
  return [
    ...saved.slice(0, 4),
    { ...saved[4], name: 'mainDeity' },
    { name: 'otherDeities', type: 'select-multiple', value: values[0] || '', values },
    { ...saved[9], name: 'managedBy' },
    ...Object.entries(templeTimingFields(saved[10].value)).map(([name, value]) => ({ name, type: 'time', value })),
  ]
}
