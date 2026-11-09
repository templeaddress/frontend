'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { PublicShell } from '@/components/ui'

export const policies = {
  terms: 'Terms of service',
  privacy: 'Privacy policy',
  data: 'Data policy',
  cancellation: 'Cancellation policy',
  refund: 'Refund policy',
  cookie: 'Cookie policy',
}

const copy = {
  terms: [
    'TempleAddress publishes staff-approved listing information and supports eligible pooja bookings and donations through Razorpay.',
    'A booking is confirmed only after the backend verifies and captures the gateway payment. A browser redirect alone does not confirm payment.',
  ],
  privacy: [
    'TempleAddress uses account, contact, devotee and ritual details only to operate listings, bookings, receipts, notifications and support.',
    'Public pages mask official contacts. Full contact details are available only after an authenticated reveal and are protected by rate limits and audit logs.',
  ],
  data: [
    'Booking, payment, receipt, chart and payout records are retained as linked operational and audit records.',
    'To request access, correction or deletion where legally permitted, contact TempleAddress support. Financial and audit records may need to be retained.',
  ],
  cancellation: [
    'Phase 1 does not allow customer cancellation. Donations cannot be cancelled.',
    'Before the applicable booking lock, an upcoming pooja item may allow an audited correction to its date, devotee name or nakshatra. Availability and cutoff rules are checked again.',
  ],
  refund: [
    'Phase 1 does not offer customer-initiated or automatic refunds. A failed or expired authorization is not captured and is released through the payment provider flow.',
    'Unexpected payment exceptions are reviewed by authorised staff and are not treated as a confirmed booking or completed payout.',
  ],
  cookie: [
    'TempleAddress uses essential browser storage and cookies for authentication, security and session continuity.',
    'Optional analytics or marketing storage must not be enabled without the applicable notice and consent controls.',
  ],
}

export function Policy() {
  const { kind } = useParams()
  const title = policies[kind] || 'Policy not found'
  return <PublicShell hideChatbot><div className="mx-auto max-w-3xl px-4 py-10">
    <h1 className="text-3xl font-semibold">{title}</h1>
    <div className="card mt-6 space-y-4 p-6">{(copy[kind] || []).map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p>Questions and formal requests may be sent to <a className="text-saffron-700 underline" href="mailto:info@templeaddress.com">info@templeaddress.com</a>.</p></div>
    <Link className="btn-g mt-4" href="/">Back to home</Link>
  </div></PublicShell>
}
