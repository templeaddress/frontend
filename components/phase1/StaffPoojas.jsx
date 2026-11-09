'use client'

import { useCallback, useEffect, useState } from 'react'

import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'
import PoojaCatalogue from './PoojaCatalogue'
import StaffListingPicker from './StaffListingPicker'

export default function StaffPoojas() {
  const [selected, setSelected] = useState(''), [poojas, setPoojas] = useState([])
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const [listing, setListing] = useState(null)
  const reload = useCallback(async () => {
    if (selected) setPoojas(await clientApi(`me/managed-listings/${selected}/poojas`))
  }, [selected])
  useEffect(() => { reload().catch(err => setError(err.message)) }, [reload])
  async function create(event) {
    event.preventDefault(); const form = event.currentTarget
    setBusy(true); setError('')
    try {
      const values = Object.fromEntries(new FormData(form))
      values.is_live = values.is_live === 'on'
      for (const field of ['end_time', 'available_from', 'available_to']) if (!values[field]) delete values[field]
      await clientApi(`me/managed-listings/${selected}/poojas`, { method: 'POST', body: values })
      form.reset(); await reload()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <section className="mt-8 space-y-4"><h2 className="text-2xl font-semibold">Pooja catalogue</h2><Field label="Temple or festival"><StaffListingPicker types={['temple', 'festival']} onChange={row => { setSelected(row?.uuid || ''); setListing(row); setPoojas([]) }}/></Field>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
    {listing && <><form onSubmit={create} className="card grid gap-3 p-5 md:grid-cols-3"><Field label="Pooja name"><Input name="name_en" required/></Field><Field label="Price ₹"><Input name="price" type="number" min="0" step="0.01" required/></Field><Field label="Booking mode"><select name="booking_mode" className="input" defaultValue="online"><option value="online">Online</option><option value="display">Display only</option></select></Field><Field label="Start time"><Input name="start_time" type="time"/></Field><Field label="End time"><Input name="end_time" type="time"/></Field><Field label="Daily capacity"><Input name="daily_capacity" type="number" min="1" defaultValue="10" required/></Field><Field label="Lead time in hours"><Input name="lead_time_hours" type="number" min="0" defaultValue="8"/></Field><Field label="Available from"><Input name="available_from" type="date"/></Field><Field label="Available to"><Input name="available_to" type="date"/></Field><label className="flex items-center gap-2"><input name="is_live" type="checkbox"/> Live pooja</label><button className="btn-g md:col-span-3" disabled={busy}>Add pooja</button></form><PoojaCatalogue listing={listing} poojas={poojas} reload={reload}/></>}
  </section>
}
