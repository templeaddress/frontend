'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'
import StarSelect from './StarSelect'

export default function BookingCorrection({ booking, staff = false, onSaved }) {
  const [selected, setSelected] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [stars, setStars] = useState([])
  useEffect(() => {
    clientApi('master-values/star', { auth: false }).then(setStars).catch(error => setError(error.message))
  }, [])
  const items = booking.items.filter(row => row.status === 'confirmed' && row.item_type !== 'donation')
  const item = items.find(row => row.uuid === selected)
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('')
    const body = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await clientApi(`${staff ? 'staff' : 'me'}/bookings/${booking.code}/items/${selected}`, { method: 'PATCH', body })
      setSelected(''); await onSaved?.()
    } catch (error) { setError(error.message) } finally { setBusy(false) }
  }
  if (!items.length) return null
  return <div className="mt-4 w-full border-t pt-4"><label className="text-sm font-semibold">Correct an upcoming item<select className="input mt-2" value={selected} onChange={event => { setSelected(event.target.value); setError('') }}><option value="">Select item</option>{items.map(row => <option key={row.uuid} value={row.uuid}>{row.item_name_en} - {row.service_date}</option>)}</select></label>{item && <form key={item.uuid} onSubmit={save} className="mt-3 grid gap-3 sm:grid-cols-2">
    {item.item_type === 'pooja' && <Field label="Service date"><Input name="service_date" type="date" defaultValue={item.service_date} required/></Field>}
    <Field label="Devotee name"><Input name="devotee_name" maxLength={160} defaultValue={item.devotee_name}/></Field><Field label="Star kind"><Input name="star_kind" maxLength={30} defaultValue={item.star_kind}/></Field><Field label="Star"><StarSelect name="star_value" stars={stars} defaultValue={item.star_value}/></Field><Field label="Reason"><Input name="reason" required/></Field><div className="self-end"><button className="btn-p" disabled={busy}>{busy ? 'Saving…' : 'Save correction'}</button></div><p className="text-xs text-brown-500 sm:col-span-2">Corrections must be made before the booking closes and before chart preparation.</p></form>}{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>
}
