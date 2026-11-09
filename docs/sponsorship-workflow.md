# Sponsorship and referral workflow

This implementation follows BRD sections 2.1, 2.2 and the sponsorship-sale portion of 3.2, using the existing commerce, subscription, advertisement and partner ledgers. The schema remains unchanged. Existing booking, donation and NEFT accounting contracts continue to apply.

## Customer and staff routes

| Route | Behaviour |
| --- | --- |
| `/sponsor` | Backend plan/package comparison, self or third-party sponsorship, temple search, referral validation, configured payment methods and an estimated GST summary. The selected product, listing, referral and method survive sign-in; third-party details survive in session storage until the order is created. |
| `/sponsor/orders` | The signed-in buyer's orders. |
| `/sponsor/orders/{code}` | Authoritative order status, payment retry/check, configured offline instructions, subscription dates, invoice access and sponsor artwork submission/correction feedback. |
| `/sponsor/orders/{code}/invoice` | Read-only invoice from its frozen snapshot, with browser printing/save-as-PDF. |
| `/sponsor/orders/{code}/qr` | Printable QR board for a paid, approved, unexpired sponsorship whose purchased placements include `qr_board`. The QR resolves to the selected listing's actual public route. |
| `/sponsors/{placement_uuid}` | Public sponsor recognition only when the approved, paid, unexpired placement includes `sponsor_page`; billing/GSTIN and private review notes are excluded. |
| `/staff/plans` | Portal Admin creates/publishes plans and packages, links the included subscription, and edits benefits, placements, featured and one-time flags without erasing unrelated stored metadata. |
| `/staff/sponsors` | Accountant register with server pagination, search/status filters, totals across the filtered register, offline confirmation and invoice viewing. |
| `/staff/advertisements` | Moderator/Portal Admin previews artwork and approves or returns it with correction feedback. Accountants alone cannot approve artwork. |

## Payment and entitlement behaviour

The server prices each order from the available catalogue. It freezes the price/tax amounts, GST rule version, included plan/duration, package placement/duration, referral and assigned dealer in the existing TaxSnapshot metadata. Later catalogue edits cannot change those purchased terms. Packages must have an included plan configured before they are available for purchase.

The web client sends an optional `Idempotency-Key` (maximum 60 characters) when creating an order. Replaying the same buyer/key/payload returns that order; a different payload with the same key is rejected. Existing API clients without the header remain supported. An unavailable gateway leaves a recoverable unpaid order. `POST me/sale-orders/{code}/payment-order` retries setup or reuses the original known Razorpay order; it does not replace an already usable provider order.

Browser checkout results never activate an order. The existing signed webhook/payment-check/reconciliation paths use server-confirmed captured payments. Settlement validates provider order, payment identity, exact commercial order amount and currency; payment attempt, paid state, invoice, subscription and referral accrual are committed atomically. A previously failed attempt can subsequently become captured. Duplicate callbacks cannot create duplicate grants or rewards.

Offline orders stay awaiting confirmation until an Accountant records the received payment reference. The same confirmation can be repeated safely. A payment reference already used by another invoice is rejected, and the transaction rolls back. Platform sponsorship revenue stays separate from temple booking payouts.

Self sponsorship creates no sponsor advertisement. Third-party sponsorship grants its included subscription and creates an awaiting-artwork placement. Only valid JPG/PNG/WebP files up to 5 MB and 25 megapixels are accepted. Approved artwork cannot be overwritten through the correction endpoint. Public listing recognition, new receipt recognition, the QR board and sponsor page respect the purchased placement rules, approval and validity period. New receipt snapshots freeze sponsor identity and asset path; old receipts are unchanged and unavailable artwork does not block receipt access.

Paid renewals extend from the end of the existing active subscription. An explicit valid partner code takes priority; otherwise approved listing attribution, then the prior subscription's referral, can carry into the renewal. Self-referrals, inactive/expired partner codes and invalid submitted codes are rejected rather than silently discarded. The assigned dealer is recorded when the order is created. Commission rules are applied to the paid source; earnings remain pending until the existing release job runs. Affiliate points remain separate entries and are awarded once per eligible paid source. Existing conversion, withdrawal, KYC and reversal controls remain authoritative.

## Catalogue and deployment setup

The empty package message means the database has no published catalogue. No mock catalogue is substituted and this change does not enable production commerce or modify a live database.

From the backend, review `python manage.py seed_sponsorship_catalogue --dry-run`. Running it without `--dry-run` creates missing rows inactive by default and leaves existing rows untouched. It includes an internal, zero-retail-price `TEMPLE-PRO` entitlement plan; that internal plan is not a standalone checkout product. Review/publish the desired paid packages in `/staff/plans`. For older packages created before the plan link existed, explicitly select their included plan in that editor. The seed command does not repair or overwrite them automatically.

Checkout requires both `COMMERCE_ENABLED` and `COMMERCE_TAX_RULES_APPROVED`. Preserve the architecture's written pricing/tax approval before enabling them. Configure `COMMERCE_TAX_RULE_VERSION`, `SPONSORSHIP_GST_PERCENT`, and the seller name/GSTIN/address settings for invoice issuance. Bank/cheque instructions and the platform UPI ID are configured through the `SPONSORSHIP_*` variables documented in the backend `.env.example`; they are recorded on the order. When absent, the buyer is directed to support rather than shown invented payment details.

Razorpay keys, webhook configuration, private storage and scheduling of `reconcile_sale_payments` and `release_commission_accruals` are deployment requirements. Omniware and Stripe remain unavailable, consistent with the reviewed architecture's current gateway boundary. No new provider has been represented as integrated.

## Deferred scope and verification limits

The owner chose to keep the schema unchanged on 6 November 2026. Benefactor's three-temple grant is therefore visibly unavailable and rejected server-side; the existing OneToOne subscription/order relationship cannot safely fulfil it. The narrow future schema proposal is in `backend/Docs/sponsorship-subscription-schema-proposal.md`. No model or migration has been edited.

This work does not implement Billing App device licensing, physically print/ship boards or standees, provision festival domains, add a separate logo-versus-banner asset model. Those require their own approved contracts; a package benefit label is not proof that external fulfilment occurred. The current sponsor artwork is one reviewed logo/banner asset per placement. Existing one-time plan catalogue semantics are preserved.

Validation uses an isolated SQLite test database, fictional browser API fixtures and a rendered sample receipt. It is not PostgreSQL concurrency, live Razorpay, real bank reconciliation, physical printing or deployed authenticated-browser proof. The existing `run_due_jobs` test imports Linux `fcntl` and is skipped by the temporary Windows QA runner; the scheduler still needs its Linux environment check.

## Validation on 6 November 2026

- Backend: 153 passed, one existing Linux-only scheduler test skipped (154 collected). Coverage includes sponsorship/partner flows and existing booking/payment/receipt regressions.
- Frontend: all 76 unit tests passed. ESLint reported no errors and one existing unused-directive warning in ListingPhase2.jsx. Ruff and diff checks passed.
- Django system checks passed; the migration dry run reported no changes.
- An isolated production build passed, including generation of all 105 static pages. The shared development output was not used for the final browser checks.
- Headless Chrome against that production build passed fictional-data checks for offline checkout/confirmation, invoice access, artwork return/resubmission/approval, public sponsor recognition, public listing referral preservation, included-plan/placement persistence, and online payment cancellation/retry. Checkout, invoice, QR and moderation pages fit a 390px viewport.
- Invoice, QR-board and mobile checkout screenshots were inspected. A fictional sponsored receipt was rendered to PDF/PNG and visually checked on one page. No real provider payment, bank transfer or physical print was performed.


## Signup referral points

Partner sharing now offers a New user signup destination. Public listing Login links retain an explicit referral code and the current return path. Registration/login forwards the optional code from `ref` or the safe local `next` URL to the OTP request or Google signup; an external return URL cannot supply attribution. A selected listing's signup link returns to that listing with the referral still present for an explicit later sponsorship checkout.

For OTP, the server records the selected partner UUID against the issued challenge in an immutable AuditEvent. The verification request cannot insert or replace that referral. No points are credited for requesting, failing, resending or expiring an OTP. Only verification that actually creates a new public user can award signup points. Google uses the same reward service only when it creates a new user after Google identity verification; returning sign-ins and linking an existing account never qualify. Invalid, inactive or expired partner codes do not block authentication and do not award points. Mobile linking remains optional for Google users.

`affiliate_signup` is a separate administrator-controlled rule under Staff > Configuration > Commissions and bonuses. It accepts a fixed whole number of points, including zero to disable awards. There is no built-in reward amount. The rule effective at successful verification is used, and its version/amount plus the partner identity are recorded in the attribution audit. A unique `signup:{new_user_uuid}` PointEntry prevents a second reward for the same account. Missing/zero rules award nothing; adding a rule later does not retroactively reward existing accounts.

Signup points are credited to the referring partner's separate points ledger. They create no sale commission, dealer override or cash wallet entry. Existing point conversion and withdrawal controls remain in effect. Sale commissions still require an eligible paid sale and its effective commission rule. Dealer overrides must be percentages; listing-verification rewards must be fixed amounts; paid-sale and signup point rules must use whole points. Configuration validation preserves previous rule versions on failure.

No models, migrations, deployed reward amounts or production scheduler configuration were changed. Deploying this code does not create commission rules. Configure approved values in the existing admin screen. Monetary commission release remains in `release_commission_accruals`, already included in the Linux `run_due_jobs` entry point; signup points themselves are awarded at verification and do not wait for that release job. Referral attribution is explicit in these links; it does not add permanent tracking cookies or infer lifetime purchase commissions from signup attribution.


### Signup referral validation on 6 November 2026

The final regression selection collected 230 backend tests: 229 passed and the existing Linux-only scheduler test was skipped on Windows. The temporary QA runner clears cache between tests so one test's throttle history cannot affect another, while preserving within-test throttling checks. All 80 frontend unit tests, targeted ESLint, Ruff, Django checks and the migration dry run passed. An isolated production build passed without modifying the development build output.

A production-build headless browser using fictional API responses passed public Login/referral retention, Login/Register switching, OTP referral transport, nested sponsorship return paths, Google signup without mandatory mobile linking, partner signup sharing with the selected listing, administrator whole-point rule controls, and 390px layout checks. Signup sharing, configuration and registration screenshots were visually reviewed. Real OTP delivery, Google provider authentication and PostgreSQL concurrency remain deployment-level verification, not claims of these fixture tests.
