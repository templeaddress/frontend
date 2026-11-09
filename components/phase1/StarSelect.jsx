import { starOptions } from '@/lib/stars'

export default function StarSelect({ stars, value, defaultValue, ...props }) {
  return <select className="input" {...props} {...(value !== undefined ? { value } : { defaultValue })}><option value="">Not specified</option>{starOptions(stars, value ?? defaultValue).map(row => <option value={row.value} key={row.value}>{row.label}</option>)}</select>
}
