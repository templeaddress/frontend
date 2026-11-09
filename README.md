# TempleAddress — Next.js frontend (SSR, SSG, ISR and Tailwind)

Demo portals are disabled unless `/api/v1/config` returns
`feature_flags.demo_portals: true` (a JSON boolean). This flag controls the vendor,
festival admin, service admin, partner and dealer routes, mock staff pages and
their public footer links. Keep it off on production; API-backed staff routes
remain available under their existing permissions. The flag defaults off if
configuration cannot be loaded. It controls demo visibility, not API authorization.

When running behind an ingress, set `TRUSTED_CLIENT_IP_HEADER` only to a header
the ingress overwrites with the actual client IP (for example `x-real-ip`), and
block direct access bypassing the ingress. Configure the corresponding proxy
CIDRs in Django's `CONTACT_REVEAL_TRUSTED_PROXIES`; see the backend README.

## Mobile app downloads

`/download-app` is the public app landing page. The footer's Downloads and Get
the app links open it. Android uses `/download-app/android`, matching
`old-code/landingpage-next`; `/download-android` remains an alias. iOS keeps its
existing optional App Store redirect at `/download-ios`.
Buttons show Coming soon when their URL is empty or invalid. Existing account,
booking, payment and policy routes are unchanged.

The environment stores the **download URL**, not the APK file. To enable Android:

1. Build a signed, standalone release APK that runs without Metro. Do not publish
   the Expo development-client/debug APK used for emulator testing.
2. Use the direct APK artifact URL from the completed EAS build, or upload the
   release APK to your file host. For EAS, use the `.apk` artifact link, not the
   build-details page. The file must be downloadable without a login. Publishing
   the app on Google Play is not required.
3. Add the URL to the frontend's `.env.local`:

   ```dotenv
   ANDROID_APK_URL=https://your-download-host.example/templeaddress-v3.0.1.apk
   ANDROID_APK_DOWNLOAD_MODE=proxy
   IOS_APP_STORE_URL=
   ```

   The old landing page's `NEXT_PUBLIC_ANDROID_APP_URL` is also supported when
   `ANDROID_APK_URL` is blank. Prefer the server-only `ANDROID_APK_URL` for new
   configuration; the legacy public variable is bundled at build time.

4. Restart `npm run dev` locally. On Amplify, add `ANDROID_APK_URL` under the
   branch's environment variables and set `ANDROID_APK_DOWNLOAD_MODE=redirect`,
   then redeploy. `amplify.yml` writes these settings into `.env.production` and
   defaults Amplify to redirect mode. Set `IOS_APP_STORE_URL` to the App Store
   link when the iOS release is available.
5. Open `/download-app` and click Download APK for Android. Also check
   `/download-app/android` directly: proxy mode returns the APK as an attachment
   named `TempleaddressApp.apk`; redirect mode opens the configured artifact.

Alternatively, deploy the APK at `public/downloads/templeaddress-v3.0.1.apk` and set
`ANDROID_APK_URL=/downloads/templeaddress-v3.0.1.apk`. The file must be included in
the deployment. Files under `public/` are public; an environment value alone does
not upload or create a file. Use a versioned filename when replacing the release.

Proxy mode follows the old landing page: the Next.js Node route fetches the
artifact without caching and streams its body with APK content type and an
attachment filename. Missing configuration returns 503; unavailable artifacts
or HTML/JSON error pages return a readable 502 response. APK bytes are not
buffered into server memory. No backend changes or database migrations are required.

Amplify Hosting currently documents a 5.72 MB compute-response limit and no
Next.js streaming support. A normal APK exceeds that limit. Use redirect mode
on Amplify so the file is downloaded directly from EAS/S3/CloudFront. Configure
the file host's `Content-Type` as `application/vnd.android.package-archive` and
`Content-Disposition` as `attachment; filename="TempleaddressApp.apk"` when
using redirect mode. This still downloads the APK without the Play Store.
Use proxy mode with a Node host that supports streaming large responses.
See [AWS response limits](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html)
and [Next.js support on Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/ssr-amplify-support.html).

## Authoritative product baseline

The current product requirements are defined only by the following sources:

- [TempleAddress BRD (PDF)](../backend/Docs/TempleAddress_BRD.pdf)
- [TempleAddress BRD (DOCX)](../backend/Docs/TempleAddress_BRD.docx)
- [Clickable TempleAddress prototype](https://templeaddress.vercel.app/)

The BRD defines production behaviour, business rules, delivery phases and role permissions. The prototype defines the
expected visual language, screen composition, form layout and simulated interactions. If a prototype interaction
conflicts with the BRD, the BRD takes precedence. Prototype data, authentication, notifications, payments, receipts,
charts, QR generation and portal actions are demonstrations and must not be treated as completed integrations.

### Required UI areas

- **Public discovery:** landing page, bilingual search, advanced filters, category browsing and public Temple, Festival,
  Service Provider and Special Pooja pages.
- **Temple details:** bilingual identity, code, verification, deity, location, timings, rating, About, Details, Contact,
  Donations and Poojas, plus galleries, guidelines, nearby places, sponsor placement, QR and claim action.
- **Festival details:** dates, venue, committee, programme events in IST, event status, bookable offerings, per-day
  capacity, sponsorship packages, travel information, artists and partner branding.
- **Service details:** professional profile, category, experience, gallery, biography, timings, availability, services,
  duration, delivery mode, prices, reviews, appointment request, quick enquiry and callback action.
- **Special pooja details:** bilingual name, host temple/provider, schedule, ritual description, sankalpam, proof type,
  capacity, price, prasadam method, beneficiary information and booking action.
- **Authenticated areas:** devotee account, temple vendor, festival committee, service provider, partner, dealer,
  moderator, accountant and portal-administration interfaces.

All public entity pages require stable crawlable URLs, responsive layouts, English and Malayalam content, unique SEO
metadata, canonical URLs, structured data and sitemap coverage. Login, accounts and operational dashboards must not be
indexed.

### Forms and displayed data

The public quick-submission form requires listing name, type/category, location, address, contact number, contact
person, optional image and optional submitter details. It does not grant listing ownership.

The authenticated listing editor is a saved-draft wizard with these sections:

1. Type and basics
2. Location
3. Details
4. Gallery
5. Contact and KYC
6. Review and submission

Supported listing-specific fields include:

| Listing type | Important fields |
|---|---|
| Temple | English/Malayalam names, category, main and other deities, management type, morning/evening timings, cover image and poojas |
| Festival | English/Malayalam names, category, organising temple/committee, dates, venue, programme and offerings |
| Service professional | English/Malayalam names, profession, category, experience, qualifications, languages, availability and services |
| Special pooja | English/Malayalam names, category, host, date/frequency, price, capacity, proof and prasadam method |

Other important forms are temple claim and verification, devotee profile/family members, donation and 80G details,
festival sponsorship, service appointment/enquiry, partner/dealer KYC, vendor settings and staff review forms.

### Booking and payment experience

The pooja booking UI must support this visible sequence:

1. Select poojas and enter a devotee name.
2. Select Nakshatra, Gothra or Rashi, date, prasadam method, quantity and recurrence where applicable.
3. Review the booking cart and totals.
4. Provide contact details, optional donation and instructions.
5. Verify the mobile number with OTP.
6. Review the booking reference, line items, date/time and payable total.
7. Open the applicable gateway checkout and handle success, failure, pending and timeout states.
8. Show the final receipt, notification state and temple-chart date only after backend confirmation.

The prototype gateway displays the booking amount, gateway charge, GST on the gateway charge and final charged amount,
and can simulate success, failure or timeout. In production, a browser redirect is not payment confirmation: the backend
must verify the gateway webhook idempotently before confirming the booking or issuing the final receipt.

Donations capture purpose, preset/custom amount, donor name, mobile, optional 80G request and PAN. Sponsorship checkout
captures sponsor type, optional partner code, temple, plan, payment method, base amount, GST and total. Service
appointments are paid directly to the professional and must not create a TempleAddress-collected appointment payment.

### Operational workflow reflected by the UI

The traceable financial and fulfilment chain is:

`Booking -> Booking items -> Payment transaction -> Receipt -> Chart -> Vendor payable -> Bank UTR`

- Temple vendors manage daily bookings, live bookings, charts, poojas, capacity, QR and payout visibility.
- Festival committees manage programme events, offerings, per-day limits, day sheets, sponsors and committee data.
- Service providers manage availability, appointments, services, enquiries, profile revisions and reviews.
- Accountants export approved NEFT batches, process them through banking, import UTR/journal results and reconcile each
  row independently.
- Partners and dealers see attributed listings, commissions, wallets, withdrawal requests and audit-ready ledgers.
- Moderators review listings, KYC, charts, special poojas, claims/transfers and support queues.

Do not present a mock success screen, browser-storage mutation or generated sample receipt as proof that a production
booking, payment, notification, chart or settlement operation completed.

Production-oriented Next.js App Router frontend derived from the clickable prototype. Routes use normal crawlable URLs
instead of hash navigation. Run the application with:

    npm install
    npm run dev        # http://localhost:3000
    npm run build      # production build with prerendered routes
    npm run start      # serve the production build
    npm run lint
    npm test

The frontend currently uses local mock data while the Django API integration is completed. Some demo-only interactions
still use browser storage, including partner status, listing drafts and Mini ERP activation details. These simulations
must be replaced by authenticated API operations before production release.

## Structure
- `app/` — App Router route tree, layouts, metadata, sitemap, robots, manifest and generated social images
- `app/t/[slug]`, `app/festival/[code]`, `app/service/[id]`, `app/special/[id]` — public entity pages with static parameters and entity-specific metadata
- `app/book/[slug]`, `app/donate/[slug]`, `app/receipt/[bookingCode]` — booking, donation and receipt routes
- `app/account`, `app/vendor`, `app/festival-admin`, `app/service-admin`, `app/partner`, `app/dealer`, `app/staff` — role-specific route groups and layouts
- `components/ui.jsx` — shared design system, shells, fields, tables, navigation and assistant components
- `components/pages/` — reusable page-level UI consumed by App Router server entry points
- `lib/data.js` — temporary mock data for public entities, portals, gateways and analytics
- `lib/booking.js` — temporary booking-domain helpers covered by Node tests
- `next.config.mjs` — Cache Components/Partial Prerendering and Next.js runtime configuration

## Latest prototype decisions

- **Pooja checkout:** `/book/[slug]` uses `components/pages/booking.jsx`: date/time availability, Nakshatra/Gothra/Rashi choice, guest mobile, donation, recurring options, demo OTP, summary and simulated gateway success/failure/timeout/retry. Fees appear only at the gateway and on the final receipt. Successful mock receipts use `/receipt/[bookingCode]` and session storage; no real payment or notification occurs.
- **Availability:** `lib/booking.js` checks IST time, offline-only items, advance cutoff, configured date/weekday restrictions and session-local paid capacity. Run `npm test`. Production needs server-side inventory reservations, OTP validation, payment verification and idempotency; this browser simulation is not an API integration.
- **Public pages:** strict temple slug lookup, real listing QR, address-based Google map (coordinates when provided), optional public contacts and `sponsorAd: {banner, text, url}`. No invented office contacts or event dates. Header offers opt-in Google translation; booking/receipt personal data is excluded from translation. Footer policy pages clearly await approved policy content.
- **Scope:** the Next.js frontend is implemented, while live Django API integration remains pending for mock-backed flows. Existing generic `/receipt` remains a legacy sample; new bookings use their unique receipt URL.

- **Listing entry:** the landing page offers **Submit a temple** (a public, no-login contact form) and **Create a profile** (OTP/Google login, then the full listing editor). Claiming is available only from a specific listing detail page.
- **Listing editor:** devotees and partners can create, view and edit listings. Each section saves as a draft; staff can view all drafts. Photos and KYC documents are optional.
- **Generic listings:** the public form uses “Name of listing” and supports temples, kavus, holy places, Jain temples, Buddhist pagodas, festivals and services. Church and mosque categories are excluded.
- **Temple data:** Main deity 1, optional Main deity 2 and other deities use the shared Admin master-data list.
- **Contacts:** store both official public phone/email (shown publicly and used for booking notifications) and private committee-member phone/email (staff verification/support only).
- **Sponsorship checkout:** supports self sponsorship and third-party sponsorship. Third-party branding fields are optional. Packages include Supporter, Patron, Benefactor and the one-time **Temple Billing mini ERP** product.
- **Payments and tax:** gateway payments complete automatically; UPI, bank transfer and cheque require transaction details and staff verification. Manual payments receive only a provisional receipt until verified. Sponsorship sales issue tax invoices, never 80G receipts.
- **Mini ERP fulfilment:** after payment, the payer can see the temple code, activation UUID, download link and activation steps. Normal plans show that activation starts after invoice/payment confirmation.
- **Partner dashboard:** the separate “sell a product” option is removed; commercial sales are handled through sponsorship checkout. The “Become a Partner” dashboard card is removed, while the footer link remains.

## User roles & auth (prototype)
Chosen on the `/login` page, which adapts its form per role:

| Role | How they get the role | Login method |
|---|---|---|
| **Guest** | No account | None — can browse and submit a listing's basic details without logging in |
| **User / devotee** | Created on first login | Mobile + OTP, or Google login |
| **Partner** | Applies from the account page (KYC wizard), approved by staff | Mobile + OTP, or Google login |
| **Vendor** — Temple · Festival committee · Service provider | Claimed/verified by staff; type chosen at login | Mobile + OTP, or Google login |
| **Dealer** | Approved by staff to manage a territory and partner network | **Password + OTP**, or Google Authenticator |
| **Staff** — Moderator · Accountant · Portal admin | Provisioned by a Portal admin | **Password + OTP**, or Google Authenticator |

Staff sub-roles scope the dashboard nav via `?role=moderator|accountant|admin` on every `/staff*` route (read with
`useSearchParams`, defaulting to the fullest view when absent, e.g. site-map links).

- **Moderator** — reviews listings, KYC, service providers, partner onboarding, special poojas and ownership requests; views bookings and daily charts.
- **Accountant** — approves vendor and partner/dealer wallet payouts, exports NEFT batches, imports bank UTRs and views payments received.
- **Portal admin** — analytics, staff/dealers, master data, gateways, plans, commissions, branding, notifications, backups and audit logs; critical changes have an admin PIN in the prototype.

Google login is mocked (no real OAuth) — the button completes the same prototype flow as OTP.

## The three vendor types
Each type has its **own dashboard and route group** — they share the design system but not the screens, because the
work is genuinely different. The login page sends each type to its own home, and legacy `/vendor?type=festival|service`
links redirect there.

| | **Temple committee** `/vendor` | **Festival committee** `/festival-admin` | **Service provider** `/service-admin` |
|---|---|---|---|
| Sells | Daily vazhipadu, donations | Time-bound offerings & sponsorships | Time-slot appointments |
| Core screen | Today's automatically prepared **pooja chart**, booking details and previous chart history | **Day sheet** per festival day (names read at the ritual) | **Appointment diary** (slot by slot) |
| Catalogue | Poojas & prices, daily limits | Offerings with a **per-festival-day** limit + sponsorship packages | Services with duration, mode (in person / phone / online / at home / at temple), travel radius |
| Money in | Bookings + donations (80G where eligible) | Online offerings + sponsorships | Optional subscription for listing visibility; appointment fees are paid directly to the professional |
| Money out | — | **Artists & vendors** (fees, advances, balances) | — |
| Settlement | Own gateway directly to temple, or TempleAddress-collected funds paid to its bank through accountant NEFT | Festival sponsorship and offering records are shown by day | No platform-collected appointment settlement in the MVP |
| Time shape | Perpetual | **Time-bound** — countdown, budget vs collected, auto-archive 7 days after, roll over to next year | Perpetual, driven by **availability** (working days/hours, slot length, leave) |
| Distinct extras | 80G certificate, white-label domain | Permissions & compliance (panchayat, police, fire, elephant, fireworks), committee handover by OTP | Enquiries inbox, reviews with replies, listing-health score, KYC verification badge |
| No | — | No daily chart, no 80G | No donations, no 80G, no daily chart |

Notes on the two newer dashboards:
- **Festival** — `festival` in `lib/data.js` drives it: `programme` (day/event/time/kind/performer/status), `offerings`, `sponsors`, `artists`, `expenses`, `sheet`. Day tabs come from `festival.days`.
- **Service provider** — `provider` in `lib/data.js` drives it: `today`/`upcoming`/`past` appointments, `services`, `week` (working days), `specials`, `enquiries`, `feedback`, `earnings`. Special poojas are behind a toggle, since only some providers offer them.
- Public service profiles include category, default photo and gallery, about/history/remarks, timings, live-looking slots, enquiries, bookable services/special poojas, ratings/reviews and share links. Profile revisions remain pending until staff approval while the approved page stays live.
- Festival identity and descriptive content stay static; each programme event has its own date/time/status, and festival poojas are booked against a selected festival date with per-day availability.

## Business rules encoded
- Payment modes per temple listing: **Omniware via TempleAddress** (weekly payout), **own gateway** (Razorpay / PayU settles directly, so no TempleAddress payout), or **bank account only** (manual NEFT payout).
- Listing IDs are assigned from independent MasterData sequences and remain stable everywhere: Temple `T1001+`, Service `S1001+`, Festival `F1001+`, Event `E1001+`, and Holy place `H1001+`.
- Temple chart IDs include their listing ID and date (for example `CH-T1028-260913`). Dashboard, chart history and payout views use the same record, so bookings, donations, total and paid/pending settlement are traceable.
- Manual payout flow (accountant → Payouts): batch → export Excel → pay in internet banking → import the same sheet with UTR/journal → mark paid → vendor notified. RazorpayX is a future connector; the Excel flow stays as fallback.
- 80G: temples/trusts only. A donation with a PAN generates an 80G receipt alongside the booking receipt. Festival committees and service providers do not issue 80G.
- Convenience fee: listing override → platform default → 0, capped by a Portal-admin global ceiling. Sponsorships recorded manually by a committee carry no platform fee.
- Ownership: partner-submitted pages can be claimed by the committee (OTP + documents) and transferred (new owner accepts by OTP), with a full audit log. Festival listings hand over to the next year's convenor the same way.
- Add-temple / page editor require About, Story, History, Speciality, Guidelines, Remarks, Nearby places, Other deities, Photos.
- Chatbot: RAG-style assistant on public pages, answers only from TempleAddress data, escalates to WhatsApp; openable from anywhere via a `ta:ask` window event.

## Brand
- Logo mark (`TempleMark` in `components/ui.jsx`) is an inline SVG — a temple gopuram inside a rounded pin — so no image asset is needed. `Logo` composes mark + wordmark and takes a `light` prop for dark headers.
- Footer shows a trust-badges strip (Razorpay, UPI, Digital India, Startup India, Kerala Startup Mission) next to the payment-gateway line — see `TrustBadges` in `components/ui.jsx`.
- Palette and type live in `tailwind.config.js`: brown / saffron / gold, Fraunces (display) + Manrope + Anek Malayalam. Malayalam text uses the `.ml` class.

## Next.js rendering strategy

Use the App Router and select rendering per route based on data volatility and privacy:

| Route type | Rendering | Purpose |
|---|---|---|
| Marketing and policy pages | SSG | Fast, cacheable and crawlable content generated at build time |
| Temple, festival, service and special-pooja pages | SSG + ISR | Stable SEO pages generated from known slugs and revalidated when approved content changes |
| Public search and discovery | SSR or Partial Prerendering | Static shell with request-time query/filter results |
| Availability and public booking information | SSR with controlled caching | Server-authoritative cutoff, inventory and price display |
| Account, vendor and staff portals | Authenticated SSR | Request-time authorization and fresh operational data; always `noindex` |
| Checkout and payment status | Dynamic SSR/API operations | Never statically cache user, booking or transaction state |

Public dynamic entities use `generateStaticParams` and `generateMetadata`. The root layout supplies default metadata,
Open Graph data and canonical configuration; `app/sitemap.js`, `app/robots.js`, `app/manifest.js`, `app/icon.svg` and
`app/opengraph-image.jsx` provide the remaining SEO and installability surfaces. `next.config.mjs` enables Cache
Components and Partial Prerendering.

When Django APIs replace `lib/data.js`, use server-side fetches with explicit cache and revalidation policies. Trigger
on-demand revalidation after staff approves or publishes public content. Never cache authenticated responses, payment
status, personal details, bank data or role-scoped operational records in a public/static cache.
