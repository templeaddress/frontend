'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/client-api'
import { StaffNotice, staffDate } from './StaffUI'

export default function StaffBookingNotes({ booking, onSaved }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function save(event) {
    event.preventDefault()
    if (busy) return
    const form = event.currentTarget, body = Object.fromEntries(new FormData(form))
    setBusy(true); setError('')
    try { await clientApi(`staff/bookings/${booking.code}/notes`, { method: 'POST', body }); await onSaved(); setOpen(false) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }
  return <section className="border-t border-brown-100 pt-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-semibold">WhatsApp proof notes</h3><button className="btn-g !py-2 text-xs" onClick={() => setOpen(value => !value)}>Add audit note</button></div><p className="mb-4 text-sm text-brown-500">Record evidence shared with staff outside the portal.</p>{booking.staff_notes?.map((note, index) => <article key={index} className="mb-3 rounded-xl border border-brown-100 p-4"><p className="whitespace-pre-wrap text-sm">{note.note}</p><p className="mt-2 text-xs text-brown-500">{note.actor} · {staffDate(note.created_at)}</p><p className="mt-1 text-xs text-brown-500">Reason: {note.reason}</p></article>)}{open && <form className="space-y-3 rounded-xl bg-brown-50 p-4" onSubmit={save}><label className="block text-sm">Booking item<select name="item_uuid" className="input mt-2" required>{booking.items.map(item => <option key={item.uuid} value={item.uuid}>{item.item_name_en} · {item.devotee_name || item.item_code}</option>)}</select></label><label className="block text-sm">Evidence note<textarea name="note" className="input mt-2" required maxLength={3000}/></label><label className="block text-sm">Reason<textarea name="reason" className="input mt-2" required maxLength={2000}/></label><StaffNotice error={error}/><button className="btn-p" disabled={busy}>{busy ? 'Saving…' : 'Record audit note'}</button></form>}</section>
}
