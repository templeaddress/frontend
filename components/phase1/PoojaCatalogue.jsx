'use client'

import { useState } from 'react'

import { clientApi } from '@/lib/client-api'
import { Field, Input } from '@/components/ui'

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function PoojaRow({ listing, pooja, reload }) {
  const [details, setDetails] = useState(null), [blocked, setBlocked] = useState([])
  const [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const root = `me/managed-listings/${listing.uuid}/poojas/${pooja.uuid}`
  async function open() {
    try {
      const [item, days] = await Promise.all([clientApi(root), clientApi(`${root}/blocked-dates`)])
      setDetails(item); setBlocked(days); setError('')
    } catch (err) { setError(err.message) }
  }
  async function action(work) {
    if (busy) return
    setBusy(true); setError('')
    try { await work(); await open(); await reload() } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  async function save(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget), values = Object.fromEntries(form)
    values.is_live = form.has('is_live')
    values.weekday_mask = form.getAll('weekday').map(Number)
    delete values.weekday
    for (const field of ['start_time', 'end_time', 'available_from', 'available_to']) if (!values[field]) values[field] = null
    await action(() => clientApi(root, { method: 'PATCH', body: values }))
  }
  return <div className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><span className="font-semibold">{pooja.name_en} · ₹{pooja.price} · {pooja.is_active ? 'Active' : 'Inactive'}</span><button className="btn-g" onClick={() => details ? setDetails(null) : open()}>{details ? 'Close' : 'Manage schedule'}</button></div>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {details && <div className="mt-4 space-y-4"><form onSubmit={save} className="grid gap-3 md:grid-cols-3">
      <Field label="Name"><Input name="name_en" defaultValue={details.name_en} required/></Field>
      <Field label="Price ₹"><Input name="price" type="number" min="0" step="0.01" defaultValue={details.price} required/></Field>
      <Field label="Booking mode"><select className="input" name="booking_mode" defaultValue={details.booking_mode}><option value="online">Online</option><option value="display">Display only</option></select></Field>
      <Field label="Starts at"><Input name="start_time" type="time" defaultValue={details.start_time || ''}/></Field>
      <Field label="Ends at"><Input name="end_time" type="time" defaultValue={details.end_time || ''}/></Field>
      <Field label="Lead time in hours"><Input name="lead_time_hours" type="number" min="0" defaultValue={details.lead_time_hours}/></Field>
      <Field label="Daily capacity"><Input name="daily_capacity" type="number" min="1" defaultValue={details.daily_capacity}/></Field>
      <Field label="Available from"><Input name="available_from" type="date" defaultValue={details.available_from || ''}/></Field>
      <Field label="Available to"><Input name="available_to" type="date" defaultValue={details.available_to || ''}/></Field>
      <label className="flex items-center gap-2"><input name="is_live" type="checkbox" defaultChecked={details.is_live}/> Live pooja</label>
      <fieldset className="md:col-span-3"><legend className="font-semibold">Available weekdays (none means every day)</legend><div className="flex flex-wrap gap-3">{weekdays.map((day, index) => <label key={day} className="flex items-center gap-1"><input type="checkbox" name="weekday" value={index} defaultChecked={details.weekday_mask?.includes(index)}/>{day}</label>)}</div></fieldset>
      <button className="btn-g md:col-span-3" disabled={busy}>Save pooja</button>
    </form>
    <div><h4 className="font-semibold">Blocked dates</h4>{blocked.map(row => <div key={row.date} className="mt-2 flex items-center gap-3 text-sm"><span>{row.date} · {row.reason}</span><button className="btn-g" disabled={busy} onClick={() => action(() => clientApi(`${root}/blocked-dates`, { method: 'DELETE', body: { date: row.date } }))}>Unblock</button></div>)}
      <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); const form = event.currentTarget; action(async () => { await clientApi(`${root}/blocked-dates`, { method: 'POST', body: Object.fromEntries(new FormData(form)) }); form.reset() }) }}><Field label="Block date"><Input name="date" type="date" required/></Field><Field label="Reason"><Input name="reason"/></Field><button className="btn-g" disabled={busy}>Block date</button></form>
    </div></div>}
  </div>
}

export default function PoojaCatalogue({ listing, poojas, reload }) {
  return <div className="mt-5 space-y-3"><h3 className="font-semibold">Pooja schedules</h3>{poojas.map(row => <PoojaRow key={row.uuid} listing={listing} pooja={row} reload={reload}/>)}</div>
}
