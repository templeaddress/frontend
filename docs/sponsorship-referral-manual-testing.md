# Sponsorship and referral manual testing map

Checked against this checkout on 6 November 2026. This is a manual test plan, not a report that these tests have been run against your database or payment providers.

## 1. Environment and identities

Use a local or isolated staging database. These steps create financial records, invoices, entitlements and reward entries. Do not run example rates, fake payment confirmations or test bank imports against production.

- Frontend examples use `http://localhost:3000`.
- Django admin examples use `http://localhost:8000/admin/`; replace the port/origin with your backend URL.
- Use separate browser profiles for staff, the referring partner, and the buyer. Incognito windows can share a session with each other.
- Use a truly new account for every positive signup test. Logging out or clearing browser storage does not make an existing database user new.
- Use fictional display names and `.invalid` fixture emails. For OTP/Google provider tests, use identities controlled by the tester and approved test delivery settings. Never use another person's number, documents or bank account.
- Record the test date, buyer user UUID, partner code, dealer code if applicable, temple UUID/slug, order code/UUID, invoice number and starting balances. Do not put passwords, OTPs, tokens or account numbers in the test report.
- Use a published, nonarchived test temple. For a clean no-referral baseline, it must have neither partner listing attribution nor a previous referred subscription.

Frontend staff roles and Django admin access are separate. Use the appropriate Portal Admin, Accountant or Moderator frontend account. Django admin requires an active staff account with model permissions (or a superuser), password login and the configured authenticator setup/verification. A frontend JWT login does not itself log you into Django admin.

## 2. Setup before testing

| Check | Where | Expected |
| --- | --- | --- |
| Checkout enabled in this QA environment | Backend configuration | Both `COMMERCE_ENABLED` and `COMMERCE_TAX_RULES_APPROVED` are true, with approved QA pricing/tax settings. Restart the backend after configuration changes. |
| Active plan | `/staff/plans` | Positive INR price, validity days and published/active status. |
| Active single-temple package | `/staff/plans` | Positive INR price, included plan selected, duration and intended placements saved. A package without an included plan is unavailable. |
| Invoice identity and offline instructions | Backend `SPONSORSHIP_*` configuration | Seller details, GST settings and appropriate payment instructions reviewed. Missing bank/UPI instructions produce a support fallback, not invented details. |
| Active partner | `/partner/profile`; staff `/staff/kyc` > Partners & affiliates | Partner is enabled, its user is active, agreement dates are currently valid. |
| Commission and reward rules | `/staff/config` > Commissions & bonuses | Effective rules exist for the types you intend to test; installing code or seeding packages does not create these rules. |
| Point conversion | Same configuration screen | Positive effective points-per-rupee rate. |
| Online checkout, if tested | Backend/provider setup | Razorpay Test Mode keys, server-side capture checking, and signed webhook delivery configured. `PAYMENT_PROVIDER_MODE=mock` has no frontend sponsorship payment-success simulator. |

If no catalogue exists, preview the seed command before creating rows. From the repository root in PowerShell:

```powershell
Set-Location "C:\Users\achut\Desktop\vass_systems\templeaddress\backend"
& "..\.qa-python312\python.exe" manage.py seed_sponsorship_catalogue --activate --dry-run
& "..\.qa-python312\python.exe" manage.py seed_sponsorship_catalogue --activate
```

These interpreter paths apply to this checkout. Use your activated environment's `python` elsewhere. The command creates missing catalogue rows and leaves existing rows untouched; `--activate` does not repair an existing inactive package, enable commerce or configure commissions. The internal `TEMPLE-PRO` entitlement is not a standalone paid checkout product.

For partner onboarding, sign in with a mobile-verified account with an email saved, open `/partner/profile`, fill the application and optionally enter an active dealer code, then submit. Staff open `/staff/kyc`, select **Partners & affiliates**, review documents/application and enable it. In Django admin, confirm `Partner.status=active`; the assigned dealer code is in `Partner.compliance_references.dealer_code`, not a direct Partner-to-Dealer field. Partner application approval and settlement-bank verification are separate.

### Optional arithmetic fixture (QA only)

Use existing approved values if they differ. These example numbers make reconciliation easy; they are not suggested production policy.

| Item | Example |
| --- | --- |
| Standalone plan | `QA-ANNUAL`, INR 1,000, 365 days |
| Single-temple package | `QA-PATRON`, INR 5,000, 365 days, includes `QA-ANNUAL` |
| Package placements | `listing_page`, `receipt`, `qr_board`, `sponsor_page` |
| QA GST setting | 18%; package GST INR 900; buyer total INR 5,900 |
| `sale_order` rule | 10% of subtotal before GST: INR 500 |
| `dealer_override` rule | 10% of partner commission: INR 50 |
| `affiliate_points` rule | 200 whole points per eligible paid sale |
| `affiliate_signup` rule | 100 whole points per verified new signup |
| `listing_verified` rule | Zero for the core run; test separately if desired |
| Conversion rate | 10 points = INR 1 |

A third-party package with `sponsor_page` can be configured as a single-temple QA package. Do not enable Benefactor's three-temple promise to obtain this placement: that package remains unavailable under the unchanged schema.

The default commission hold is 7 days, point conversion minimum 100 points, withdrawal minimum INR 500 and withdrawal TDS setting 5%. Read the actual QA configuration/UI rather than assuming defaults. Setting `COMMISSION_HOLD_DAYS=0` is an optional isolated-QA shortcut requiring backend restart; it does not release anything until the release job runs. Do not alter production timing for testing.

## 3. How to find records in Django admin

Most of these admin pages use Django's default record forms. They do not have the frontend's search/filter controls or business-action buttons. Use admin to inspect evidence; perform payment confirmation, approval, conversion and reversal through their service-backed frontend/API workflows. Editing `SaleOrder.status` to `paid` or `CommissionAccrual.state` to `released` bypasses the required side effects and is not a valid test.

Useful query-string filters (replace placeholders, URL-encode values when needed):

```text
/admin/package/saleorder/?code=<ORDER_CODE>
/admin/package/saleorder/?uuid=<ORDER_UUID>
/admin/package/invoice/?sale_order__id__exact=<ORDER_NUMERIC_ID>
/admin/package/taxsnapshot/?sale_order__id__exact=<ORDER_NUMERIC_ID>
/admin/package/subscription/?sale_order__id__exact=<ORDER_NUMERIC_ID>
/admin/package/advertisementplacement/?sale_order__id__exact=<ORDER_NUMERIC_ID>
/admin/partners/commissionaccrual/?source_type=sale_order&source_uuid=<ORDER_UUID>
/admin/partners/pointentry/?source_key=signup%3A<NEW_USER_UUID>
/admin/partners/pointentry/?source_key=sale%3A<ORDER_UUID>
```

Open the matching sale order: its change URL contains the numeric ID, for example `/admin/package/saleorder/42/change/`. The frontend API response in browser DevTools > Network provides the order/user UUID. UUID fields marked noneditable are not generally shown in the admin form. Avoid sharing auth response bodies or headers containing credentials.

| Admin path (after backend origin) | Inspect |
| --- | --- |
| `/admin/users/user/` | Buyer/referrer identity, active status, staff permissions, mobile. This custom UserAdmin does not expose verification timestamps or UUID in its ordinary form; use the auth response/audit trail for those checks. |
| `/admin/users/otpchallenge/` | Challenge purpose, expiry, attempts and `verified_at`. `code_hash` is not a readable OTP. |
| `/admin/partners/partner/`, `/admin/partners/dealer/` | Active status, user, agreement dates and partner's assigned dealer code in compliance JSON. |
| `/admin/partners/commissionrule/` | Basis, code/version, fixed amount or rate, effective dates and approver. |
| `/admin/package/plan/`, `/admin/package/sponsorpackage/` | Active price, validity, included plan and placement configuration. |
| `/admin/package/saleorder/`, `/admin/package/saleorderline/` | Buyer, temple, status, subtotal, GST, total, currency and purchased line. |
| `/admin/package/taxsnapshot/` | Approved tax version and `lines` metadata: order kind, method, referral/dealer, referral source, frozen terms and payment instructions. |
| `/admin/package/subscription/` | Order, temple, included plan, status, start/end. |
| `/admin/package/invoice/` | One invoice per paid order, number, issued time and immutable `snapshot`, including payment reference. A blank `pdf_file` is expected when using the frontend print/save-as-PDF invoice view. |
| `/admin/package/advertisementplacement/` | Paid order, package, temple, artwork, click URL, validity and status. Review feedback is recorded in audit events rather than an editable review-note model field. |
| `/admin/partners/commissionaccrual/` | Source UUID/type, beneficiary, gross basis, amount, frozen `rule_snapshot`, `state`. |
| `/admin/partners/pointentry/` | Referrer's user, unique source key, signed points and entry type. |
| `/admin/partners/walletaccount/`, `/admin/partners/walletentry/` | Wallet owner/currency/status; immutable signed entries. Available balance is the sum of entries, not a balance field to edit. |
| `/admin/partners/pointconversionrate/`, `/admin/partners/pointconversion/` | Effective points-per-currency-unit rate; conversion's frozen rate relation, points, currency amount and linked wallet credit. |
| `/admin/payments/paymentorder/`, `/admin/payments/paymentattempt/` | Online provider order ID, linked sale order, captured attempt and amount/currency/payment ID. Offline confirmation is evidenced by the sale/invoice, not a required Razorpay attempt. |
| `/admin/payments/webhookevent/` | Provider/event identity, `signature_valid`, `processing_result` and errors. |
| `/admin/utils/auditevent/` | Signup binding/attribution, creative review, configuration, bank decisions and financial action history. |
| `/admin/partners/listingattribution/` | Approved source partner, temple and effective interval. |
| `/admin/partners/partybankaccount/`, `/admin/partners/withdrawalrequest/` | Settlement-account version/status and withdrawal's wallet, account version, amount, hold and status. |

## 4. Test A: new-user signup referral

1. As the active partner, open `/partner/share`.
2. Choose **New user signup** under **Link destination**. Copy the link; it should contain `/register?ref=<PARTNER_CODE>`. A selected temple also produces a local return path retaining that referral.
3. In a fresh buyer profile, open the link. Switch between Login and Register and confirm the referral and return path survive.
4. Request a mobile OTP. Before verification, inspect the partner's `/partner` > **Affiliate points**: nothing has been credited.
5. Verify successfully, creating a genuinely new account. For a second positive case, use a fresh controlled Google identity through the same referral link. Google signup does not require mobile linking to qualify.
6. Refresh the partner wallet. Under the example rules, each eligible new account adds 100 signup points. Cash available and sales commission remain unchanged.

Admin evidence for each new user:

- OTP route: `OtpChallenge.verified_at` is set; `AuditEvent.action=referral.signup_pending` identifies the issued challenge and bound partner UUID.
- `AuditEvent.action=referral.signup_attributed`, `target_type=user`, `target_uuid=<NEW_USER_UUID>` records the partner, provider (`mobile` or `google`), points, source key and applied rule snapshot.
- Exactly one `PointEntry`: `user=<REFERRER>`, `source_key=signup:<NEW_USER_UUID>`, `entry_type=signup_referral`, `points=100` for the fixture.
- No signup-triggered `CommissionAccrual`, dealer override or `WalletEntry`.

Use separate accounts/cases for these negative checks:

| Action | Expected |
| --- | --- |
| Wrong, expired or unverified OTP | No signup reward. |
| Request/resend OTP, then abandon | No reward; pending referral audit alone does not prove an award. |
| Sign in again, replay verification, or link an existing mobile/Google account | No second award. An existing but previously unverified database user is still not a new account. |
| Invalid, inactive or expired partner code | Authentication can succeed; referral rewards are absent. |
| No active signup rule or a zero-point rule | New account can be created; no PointEntry. A valid attribution may record zero points. Adding a rule later does not backfill it. |
| Open a signup link, then later buy without an explicit purchase code | Signup attribution alone does not establish lifetime sales commission. Listing/renewal attribution can independently apply. |

To test server protections such as changing the partner in the OTP verification request, use a controlled API test; the normal UI has no control for that. Attribution is bound when the challenge is issued, not supplied by OTP verification.

## 5. Test B: third-party offline sponsorship and paid referral

1. As the partner, generate a **Sponsorship / subscription checkout** share link for the test temple. Open it as the buyer.
2. At `/sponsor`, choose **Third-party sponsor**, select the single-temple package and confirm the temple and partner code. Click **Validate**.
3. Enter fictional sponsor branding details. Choose **Bank Transfer**, **Cheque** or **UPI / QR**. With the fixture, verify subtotal INR 5,000, GST INR 900 and total INR 5,900.
4. If logged out, sign in and confirm product, temple, referral, method and entered sponsor details survive the return.
5. Place the order. Save its code and UUID. Use `/sponsor/orders` and `/sponsor/orders/{code}` to confirm **Awaiting payment confirmation** and the configured instructions.
6. BEFORE staff confirmation, inspect admin: `SaleOrder.status=awaiting_offline_payment`; one purchased line and tax snapshot exist. There must be no invoice, subscription, advertisement, sale commission or sale-point grant for this order.
7. As Accountant/Portal Admin, open `/staff/sponsors`, search for the code and confirm the isolated QA payment using a unique reference, for example `QA-NEFT-001`. In real operation this action requires actual bank receipt; never use a fictional reference on production.
8. Refresh the buyer order. It must be **Paid**, with subscription dates and invoice access; the sponsor banner must be **awaiting creative**.

Admin evidence AFTER confirmation:

| Record | Expected for fixture |
| --- | --- |
| SaleOrder | `paid`, same buyer/temple and INR 5,000 + 900 = 5,900. |
| TaxSnapshot | Referral code, dealer code if assigned, `referral_source=code`, kind `third_party`, method and purchased terms match the created order. |
| Invoice | Exactly one for this order; snapshot has frozen amounts, buyer/sponsor/listing details and `payment_reference=QA-NEFT-001`. |
| Subscription | Exactly one for this order, correct temple and included plan, `active`, correct duration. See renewal timing below. |
| AdvertisementPlacement | One for this package line, `awaiting_creative`, correct order/temple and validity; not publicly displayed yet. |
| Partner CommissionAccrual | `source_type=sale_order`, `source_uuid=<ORDER_UUID>`, `gross_basis=5000`, `amount=500`, `state=pending`, applied rule/version snapshot saved. |
| Dealer CommissionAccrual, if linked/configured | `source_type=dealer_override`, `source_uuid=<PARTNER_ACCRUAL_UUID>`, `gross_basis=500`, `amount=50`, `state=pending`. It is calculated from the partner's commission, not INR 5,900 or INR 5,000. |
| PointEntry | Exactly one `source_key=sale:<ORDER_UUID>`, `entry_type=award`, `points=200`, owned by the referring partner's user. |
| WalletEntry | No commission credit until release. Points are not cash wallet credits. |

In `/partner` > **Sales & earnings**, open the order's row to inspect taxable basis, amount, rule/version and state. Under **Affiliate points**, verify the paid-sale award separately from signup points. The optional dealer checks its own earnings at `/dealer/wallet`.

Refresh/reopen the paid order: invoice, subscription, accrual and sale-point counts must stay unchanged. The normal UI no longer offers confirmation after payment; replaying the identical confirmation request is a separate controlled API check and must also leave counts unchanged. For a second unpaid order, try reusing `QA-NEFT-001`: it must fail without activating that second order or creating rewards. Give every legitimate separate test payment its own reference.

## 6. Test C: artwork review and public recognition

1. Buyer opens the paid order and uploads a small valid JPG, PNG or WebP; optionally use `https://example.invalid/qa-sponsor` as the QA click URL. Click **Submit for approval**.
2. Admin `AdvertisementPlacement.status` must become `pending_review`. It must still be absent from public recognition.
3. Moderator/Portal Admin opens `/staff/advertisements`, previews it, returns/rejects it with a correction note. Buyer refreshes and sees the feedback and upload control again; admin status is `awaiting_creative`.
4. Buyer corrects and resubmits. Staff approve. Admin status becomes `active`; audit history includes `advertisement.submitted`, `advertisement.rejected`, later `advertisement.submitted` and `advertisement.approved`.
5. Open `/t/{slug}` logged out. For a purchased `listing_page` placement, approved branding appears only within validity. Private correction notes and billing GSTIN must not be exposed.
6. For purchased `sponsor_page`, open the order's **Sponsor page** link (`/sponsors/{placement_uuid}`) logged out. It must show public sponsor recognition, not invoice/private billing fields.
7. For purchased `qr_board`, open **Open QR board**, print/save preview and scan the QR. It must resolve to the actual selected temple route. This checks the printable artifact, not physical printing or delivery.
8. For purchased `receipt`, create a new controlled QA booking receipt using the existing booking flow after approval. Confirm its sponsor snapshot. A receipt issued before approval must remain unchanged. An unavailable image must not prevent receipt access.
9. Approved artwork must not have a normal overwrite control. Test unsupported image types, over-5-MB files and nonimage content on separate unpaid/awaiting-artwork cases: no successful artwork activation. Some malicious-content, over-25-megapixel and unauthorized replacement checks require API tools.

Visibility requires payment, staff approval, valid dates, media and the purchased placement. Package purchase alone is insufficient. Expiry checks should use natural expiry or dedicated automated/controlled API fixtures; do not edit financial or entitlement dates on shared records to manufacture a result.

## 7. Test D: self sponsorship and renewal

- Buy the standalone plan as **Self sponsorship**, with a different eligible referring partner if testing commission. Payment must create the invoice and subscription, but no AdvertisementPlacement. Its absence is a pass.
- Try selecting a standalone plan under **Third-party sponsor**: it must not be purchasable as a sponsor package.
- Pay a second plan/package order for a temple with an existing active subscription. The new subscription must start at the existing subscription's end and end after the newly purchased duration. A future start with `status=active` is possible; inspect dates as well as status.
- A third-party package's advertisement period starts at activation; it does not wait for a queued renewal subscription to start.
- The second paid order is a distinct purchase and can earn its own commission/points. Refreshing the first order cannot create a renewal.
- Referral selection order is explicit valid code, then approved current listing attribution, then previous subscription referral. Inspect TaxSnapshot `referral_source` (`code`, `listing_attribution`, `renewal`). Use clean temples for no-referral controls.
- Invalid submitted codes and self-referral must be rejected for checkout, unlike invalid signup codes, which must not block authentication.

## 8. Test E: commission release and point conversion

There is no frontend release button. After the configured hold, run the existing job against the QA backend:

```powershell
Set-Location "C:\Users\achut\Desktop\vass_systems\templeaddress\backend"
& "..\.qa-python312\python.exe" manage.py release_commission_accruals
```

This releases all eligible accruals in that database, not one selected order. Before the hold expires it must release none of the new sale's accruals. Disabled beneficiaries remain pending. The Linux scheduler can run this automatically; the general `run_due_jobs` entry point uses Linux-specific facilities, so use the individual command for this Windows manual check.

After release:

- Partner/dealer accrual states become `released`.
- Each has exactly one WalletEntry `source_key=accrual:<ACCRUAL_UUID>`; partner entry type `commission`, dealer entry type `dealer_override`.
- Fixture credits are INR 500 to partner and INR 50 to dealer. Running the job again does not add credits.
- `/partner` available balance increases; pending earnings decrease. Signup and paid-sale points remain separate.

For conversion, open `/partner`, choose **Convert affiliate points**, enter the count, inspect the current rate and estimated wallet credit, then **Confirm conversion**.

If one fixture signup and one fixture paid sale gave 300 points, converting all 300 at 10 points per INR 1 produces INR 30:

| Admin evidence | Expected |
| --- | --- |
| PointConversion | User, `points=300`, `currency_amount=30`, linked rate and wallet entry. |
| PointEntry | Negative 300, `entry_type=conversion`, `source_key=conversion:<CONVERSION_CODE>`. |
| WalletEntry | Positive INR 30, `entry_type=points_conversion`, `source_key=points:<CONVERSION_CODE>`. |
| Frontend | Points reduce by 300; available wallet rises by INR 30; conversion history shows the applied rate. |

For this fixture, after release and conversion, partner available is INR 530 and dealer available INR 50, assuming zero starting balances and no other transactions. Conversion does not create a sales commission or dealer override. Below-minimum, fractional or excess points must not create entries. Cancelling the dialog must not create entries.

Rule timing matters: order price, tax, included duration, placements, referral and assigned dealer are frozen when the order is created. Commission and paid-sale point rules are selected when payment activates the order; signup rules at successful new-account verification; conversion rate at conversion confirmation. Later configuration versions must not rewrite already-created accrual/conversion snapshots. A later rule does not backfill earlier signups or paid orders.

## 9. Test F: Razorpay Test Mode

Run the offline flow first to establish backend business logic without provider dependencies. Then test Razorpay with its Test Mode and current [official integration instructions](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps).

1. Select Razorpay in checkout. Save the commercial order and provider order IDs.
2. Cancel/close Checkout. The sale stays `payment_pending`, with no invoice, subscription or reward. Open its detail page and choose **Retry payment**; a known usable provider order should be reused rather than creating a second sale.
3. Complete a supported test payment. Use **Check payment status** if confirmation is delayed. Browser success alone must not grant access; the backend must confirm a captured payment for the exact order, amount and currency.
4. Inspect PaymentOrder linked to the sale and PaymentAttempt with `captured` status/provider payment ID. Then repeat every paid-sale invariant from Test B.
5. Inspect signed webhook delivery, where delivered: WebhookEvent must have `signature_valid=True` and a successful `processing_result` such as `processed`. HTTP 200 alone is insufficient evidence. Payment-check/reconciliation can settle a sale independently, so a paid order by itself does not prove webhook delivery.
6. Refresh, check again, and use the provider's test webhook retry facility if available. No second invoice, subscription, accrual or sale-point grant may appear.
7. Use separate cases for declined payment and provider unavailability. The order must remain unpaid/recoverable, not grant entitlements.

Provider reconciliation, when needed, is `python manage.py reconcile_sale_payments` in the correct backend environment. It can settle multiple open orders and is not a per-order frontend action. Mock mode skips provider payment discovery. Do not send a real transfer or live card payment for this test plan.

## 10. Optional settlement and reversal tests

### Partner/dealer settlement bank

The partner submits its account at `/partner/profile`. Inspect PartyBankAccount for correct owner, increasing version, masked last four and `submitted` status. Never copy encrypted account fields into a report.

There is currently no partner/dealer-bank verification frontend screen. `/staff/bank-verification` handles temple listing accounts, not PartyBankAccount. Use the existing Portal Admin-authenticated API in your controlled test client:

```text
GET  /api/v1/admin/party-bank-accounts
POST /api/v1/admin/party-bank-accounts/{bank_uuid}
Content-Type: application/json
{"decision":"verify"}
```

Use `{"decision":"reject"}` for the separate rejection case. Verify admin status and `AuditEvent.action=party_bank.verify` or `party_bank.reject`. Do not manually change the admin status as a substitute for this workflow. Changing a bank creates a new version requiring verification; old withdrawals retain their original account version.

### Withdrawals (isolated QA only)

1. With a verified account and sufficient available balance, open `/partner` > **Withdraw**. Check gross, TDS, net and account ending before confirmation.
2. Under the example policy, withdraw INR 500 from INR 530: TDS INR 25, net INR 475, remaining available INR 30.
3. Admin must show a pending WithdrawalRequest linked to that bank version and a negative WalletEntry `withdrawal-hold:<WITHDRAWAL_CODE>` for INR 500.
4. At `/staff/withdrawals`, a different authorized Accountant approves. In a rejection case, a required reason and positive release entry restore the held amount once.
5. **Download approved NEFT Excel** exports approved requests across the database, not just a selected test row. Use only an isolated QA database and never submit its workbook to a real bank.
6. For the QA import test, fill the downloaded sheet's **Bank Transaction ID** and **Journal Number** with unique QA references. **Import completed sheet** > **Preview import** must show valid rows before any change; **Confirm and mark ... paid** applies them. Inspect WithdrawalExport/Row and WithdrawalImport/Row in admin, plus WithdrawalRequest status `paid`.
7. A repeated import must not pay a request twice or debit it twice. The original hold represents the withdrawn gross amount; import must not create a second gross debit. Missing/duplicate/invalid references must not mark a row paid.
8. For an exported bank-failure case, use **Bank failed** with a reason: status becomes `failed`, and the hold is returned once. Verify `withdrawal-release:<WITHDRAWAL_UUID>`.

### Commission reversal

On a separate sale, use `/staff/withdrawals` > **Commission earnings** > **Reverse**, with a reason. A pending accrual becomes reversed without a release credit. Reversing a released accrual creates the negative `accrual-reversal:<ACCRUAL_UUID>` WalletEntry, reverses the linked dealer accrual/credit and adds a negative paid-sale point entry `sale-reversal:<ORDER_UUID>`. Repeating must not duplicate deductions. Signup points are not that paid-sale award.

This is a commission correction; it does not refund the buyer, cancel the invoice, end the subscription or remove the sponsor grant. Check those remain consistent and test actual refunds only through their approved separate workflow.

### Partner-created listing attribution

Create a separate temple through `/partner/submit` and complete the existing listing review/publish workflow. Inspect ListingAttribution for the creating active partner. If a positive `listing_verified` rule is configured, expect one separate `CommissionAccrual` with `source_type=listing_verified`, `source_uuid=<LISTING_UUID>`. A later paid sponsorship without an explicit code can use that approved attribution. Do not count this listing-verification award as sale commission.

## 11. Regression and authorization matrix

| Case | Required result |
| --- | --- |
| Ordinary buyer opens another buyer's order/invoice or uploads its artwork | Denied; no records changed. |
| Partner tries to confirm an offline payment | Denied. |
| Moderator-only account tries payment confirmation | Denied; Accountant/Portal Admin is required. |
| Accountant-only account tries artwork approval | Denied; Moderator/Portal Admin is required. |
| Non-Portal-Admin tries catalogue/rule configuration | Denied. |
| Self, inactive, expired or unknown purchase referral code | Checkout rejected; no paid grant. |
| Benefactor/multitemple package | Unavailable in UI and rejected server-side under the unchanged schema. |
| Repeated clicks/refresh/retry for the same order | No duplicate invoice, subscription, commission or points. Deliberate new checkouts can create separate orders. |
| Same checkout idempotency key with changed payload | API test: rejected. Identical buyer/key/payload returns the original order. |
| Price/GST/package duration/placements changed after an unpaid order is created | Existing order and later invoice retain frozen purchased terms; a new order uses current values. |
| No positive commission rule | No commission accrual; eligible independently configured points may still be awarded. |
| Partner disabled before release | Its pending earnings stay pending; no release credit. |
| Sponsor asset pending/rejected/expired or placement not purchased | No public recognition for that surface. |
| Failed payment or artwork upload | Existing booking, donation and unrelated order records remain unchanged. |

Some negative cases require API/provider tooling because the UI correctly prevents selecting invalid values. A hidden button alone does not verify backend authorization.

## 12. Sign-off sheet

For each case, record:

```text
Case ID / date / environment / tester role:
Buyer UUID / partner code / dealer code:
Temple UUID / slug:
Order code / UUID / invoice number / provider test IDs if relevant:
Rule version / points rate / hold setting:
Starting points / wallet / pending commission:
Frontend action and observed result:
Admin records and exact statuses/source keys/counts:
Ending points / wallet / pending commission:
Expected vs actual / screenshot without secrets / PASS or FAIL:
```

Minimum sign-off is one new OTP referral, one fresh Google referral if enabled, one existing-account no-reward check, an offline third-party sale through artwork approval, self sponsorship, retry/no-duplication checks, commission release, point conversion and role denial checks. Add Razorpay, withdrawals and expiry proof before signing off those integrations specifically.

No model/migration change is required by this plan. Multi-temple Benefactor fulfilment, Billing App device licensing, physical board delivery and festival domain provisioning remain outside this implemented checkout workflow.
