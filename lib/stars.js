export function starOptions(stars, current = '') {
  const options = stars.map(row => ({ value: row.code, label: row.name_en }))
  if (current && !options.some(row => row.value === current)) options.unshift({ value: current, label: `${current} (current value)` })
  return options
}
