# Vendor portal

The panel follows the temple, festival and service prototypes in `old-code/TA-prototype/templeaddress/src/pages/vendor*.jsx`, using the existing Phase 2/3 backend rules and real listing memberships. Prototype balances, contacts, payment references and toast-only actions are not used as production data.

## Screens

| Area | Routes | Connected behaviour |
| --- | --- | --- |
| Temple | `/vendor` | Listing dashboard, stored chart preview, collection mode, totals, quick actions and downloadable public-listing QR. |
| Reports | `/vendor/bookings`, `/vendor/donations`, `/vendor/charts`, `/vendor/charts/{uuid}`, `/vendor/payouts`, `/vendor/data` | URL-preserved booking filters, server pagination, selected-record details, complete filtered CSV exports, chart PDF download, frozen chart totals, bank references and export history. Donation purposes can be added, edited and deactivated. |
| Catalogue | `/vendor/poojas` | Modal add/edit, fixed pooja identity, English/Malayalam content, category/deity, price, online/display mode, active/live flags, timings, lead time, capacity, date/weekday availability, required devotee fields, prasadam delivery options and blocked dates. Changes apply through the existing validated catalogue APIs. |
| Delivery | `/vendor/deliveries` | Paginated pending/packed/dispatched/delivered/returned lists; update courier, tracking and delivery status through the existing notification/audit workflow. |
| Content and finance profile | `/vendor/editor`, `/vendor/settings` | Embedded revision editor and permitted free-event editor; content review/resubmission, private documents, KYC and versioned bank submissions, collection/team/subscription display. |
| Festival | `/festival-admin` plus `/programme`, `/offerings`, `/bookings`, `/charts`, `/charts/{uuid}`, `/donations`, `/deliveries`, `/payouts`, `/data`, `/sponsors`, `/profile`, `/settings` | Festival-specific navigation/public links, programme revisions, offerings, day sheets, sponsors and the same permitted reporting/fulfilment workflows. |
| Service | `/service-admin` plus `/appointments`, `/services`, `/enquiries`, `/reviews`, `/profile` | Appointment details/status notes/history, service add/edit/deactivation, contact-based enquiry responses, public review replies, multiple working windows, IST blocked periods, content/events/KYC/bank profile. Appointment payment remains directly with the provider. |

## Scope and permissions

- The selected listing UUID keys the workspace. Changing listings closes the old record's dialogs/forms and discards old query responses. Entering a different portal type selects an authorized listing of that type or redirects to the appropriate authorized workspace.
- Owner/admin controls follow both membership roles and the API's aggregated `can_manage_content` flag. Read-only memberships do not receive write, payout or dispatch controls. Every API independently checks listing access.
- Public page links and QR payloads use `/t/{slug}`, `/festival/{slug}` or `/service/{slug}` for the actual selected listing.
- Publication/booking activation, ownership, gateway credentials, payout approval/bank processing, pricing calculations and commission rules retain their existing staff/backend workflows. No model or migration changes are introduced.
- A new bank submission creates a version requiring verification; it does not overwrite the account recorded on financial history. KYC submission/approval and bank verification remain distinct.
- The prototype's owner publication toggles, gateway credential switching, notification-resend toasts, paid special-pooja proof management and in-app enquiry conversations have no equivalent authorized self-service workflow in the inspected APIs. The panel does not present these as working controls. Priced events retain their existing staff creation rules; the embedded event editor creates permitted free events.

## API changes

- Charts, payouts, delivery items, export history, appointments, enquiries and reviews accept optional `page`/`page_size`. Existing calls without pagination retain their previous response shape and limits. Payout pages retain direct-settlement metadata; review pages include the average rating.
- Chart/payout reports accept date/status filters. Chart details include totals and version from the stored chart version. Booking pagination validates input and uses a stable order. CSV exports contain all matching records, with formula escaping and the existing export audit.
- `GET/PATCH me/managed-listings/{listing_uuid}/service-offerings/{id}` and `GET/PATCH me/managed-listings/{listing_uuid}/donation-purposes/{uuid}` provide scoped, typed editing and auditing. Deactivation preserves record identity and history.
- Catalogue creation now saves the editable description/availability/active/order fields through typed serializers, while retaining existing creation response shapes and blank optional-amount handling.

## Acceptance checks

1. Prepare isolated QA accounts with owner/admin and event-editor memberships, two temples, a festival, a service listing, configured catalogue records, test bank/KYC and stored charts. Never use real contacts or live money for these checks.
2. Switch listings with a catalogue or booking dialog open. Confirm the dialog closes, records/header/QR all use the newly selected UUID, and pending responses from the old listing do not reappear. Repeat across portal types.
3. Create/edit a pooja, cancel a blank add form, edit the selected record, change capacity, deactivate, block/unblock a future date and configure prasadam. Refresh and inspect the public catalogue/quote. Invalid live timing, insufficient capacity and unauthorized changes must fail without altering existing bookings.
4. Add/edit/deactivate service offerings and donation purposes. Check stable identity, blank optional amounts, Malayalam/description fields and unauthorized cross-listing attempts.
5. Filter bookings/donations and use later pages; refresh/back-navigation must retain filters. Compare exported CSV rows and totals with the same filtered records. Open chart detail/PDF and payout references for the exact listing/chart. Direct-gateway collections must remain outside platform payout batches.
6. Update a prepared QA delivery and revisit it after refresh. Verify saved courier/tracking and the deduplicated notification/audit records; a queued notification is not delivery proof.
7. Create a revision, save sections, upload test media/documents, submit, return with feedback and approve through staff. The old approved public page must remain live until publication. Submit KYC and bank versions and inspect their separate statuses.
8. Confirm/decline a requested appointment; complete/cancel/no-show an eligible confirmed appointment and inspect notes/history. Check multiple windows survive a save, blocked periods use IST, and no online payment is created.
9. Save a review reply, inspect enquiry contact links and check read-only controls. Repeat main routes on a 390px viewport and open/close mobile navigation.

## Validation evidence

- 67 frontend tests passed. Vendor files also passed ESLint with undefined/unused-variable checks; the production build completed.
- 31 vendor/Phase 2/3 backend tests passed in an isolated in-memory SQLite database. Django checks passed and the migration check reported no changes.
- A further 100 existing listing/event/booking/payment regressions passed with test-only cutoff defaults. One Unix `fcntl` cron-runner test was explicitly excluded on Windows and still needs Linux verification. No deployment settings or cron code were changed.
- Isolated headless Chrome passed interaction checks and 390px width checks across 28 vendor/festival/service routes with 186 intercepted fictional API requests. Checks included catalogue save/cancel, listing switch/modal reset, delivery, payouts, appointments, multiple working windows, review replies and read-only membership. Desktop/dialog/mobile screenshots were visually inspected.
- Live Django/PostgreSQL integration, storage, generated PDF content, notification delivery and bank/provider operations still require the acceptance checks above. Browser fixtures are UI evidence only.
