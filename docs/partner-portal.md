# Partner portal

The partner screens follow `old-code/TA-prototype/templeaddress/src/pages/partners.jsx`, the partner requirements in `docs/TA_Phase_1_and_2_Release_Requirements.docx`, and the workspace Phase 2/3 checklist. Prototype balances, rates, contact details, and download placeholders are not used as live data.

| Route | Behaviour |
| --- | --- |
| `/partner` | Available/pending/withdrawn balances, affiliate points, transaction filters, server pagination, CSV export, selected transaction details, referred sales and frozen commission rules, withdrawal history, confirmed point conversion and bank withdrawal requests. |
| `/partner/profile` | Apply, edit a pending application, correct/resubmit a returned application, edit account name/email, upload private KYC documents, inspect actual review statuses, submit a new bank version and download an active partner ID. |
| `/partner/listings` | Search/filter submitted or attributed listings, open the correct temple/festival/service public route, edit accessible submissions, and open sponsorship checkout with the partner referral code. |
| `/partner/share` | Choose general sponsorship or a published listing, select sponsorship/public destination, copy or share a referral URL, and download its QR as SVG. |
| `/partner/submit` | Create a real listing draft, then continue through the existing listing revision editor. |
| `/partner/submissions` | Review draft/review/returned statuses and staff feedback, then open the exact submission for correction/resubmission. |

## API additions

- `GET me/partner/transactions`: authenticated active-partner ledger, scoped to the current user's wallet. Supports `page`, `page_size`, `search`, `direction=credit|debit`, `type`, ISO dates `from`/`to` in IST, and `sort=newest|oldest|amount|amount_desc`. `export=csv` exports every matching row with spreadsheet-formula escaping.
- `GET me/partner/sales`: optional pagination plus source UUID and referred order/product details. Calls without page parameters retain the existing array response and limit.
- `GET me/withdrawals`: optional pagination; the existing summary response additionally includes the configured withdrawal minimum and TDS rate.
- `PATCH me/partner-application`: edit the current user's pending application's address, referral source, dealer code, PAN suffix and/or bank. Saves an audit event; approval status and identity remain unchanged. Returned applications still use the existing POST resubmission workflow.
- Application reads include the authenticated user's profile/address/PAN suffix. Dashboard listing reads include an edit-access flag. Account numbers remain masked.

Sponsorship login now preserves the selected listing, referral code and purchase kind. Payment creation, confirmation, commission calculation/release, KYC approval, withdrawal processing and model schemas retain their existing rules.

## Acceptance checks

1. Apply with a mobile-verified QA account and a saved fictional `.invalid` email. Confirm the same partner code after refresh and after editing a pending application. Try an invalid dealer code. Approve/return through the existing staff workflow; verify returned feedback and resubmission.
2. Upload a test PDF/JPG/PNG, including a rejected file over 5 MB. Inspect the recorded document status after reload; application approval alone must not label documents or bank accounts verified.
3. Use an approved QA partner with a verified bank. Compare wallet summaries with records, search/filter a ledger containing more than 50 entries, visit later pages, inspect details, and export the filtered statement. An unrelated/disabled account must not read this ledger.
4. Compare sales product/order identity and rule versions with the paid source. Pending earnings become available only through the existing scheduled release job.
5. Request a valid test withdrawal. Inspect its gross, TDS, net and subsequent status after refresh. Try below-minimum/insufficient-balance/unverified-bank failures. Replace the bank and confirm old withdrawal records retain the original bank version.
6. Select a subset of affiliate points, inspect the rate and estimated credit, cancel once, then confirm. Reconcile point deductions, conversion history and actual wallet credit. The server applies the rate effective at confirmation.
7. Share each listing type and the general sponsorship page. Check copied URL/QR identity. Open a referral checkout while signed out and confirm the code/listing survive login. Opening a share action alone must not award commission.
8. Create a draft, complete its existing editor, submit for review, return with feedback, correct and approve. Confirm the correct public listing remains live during revision review. Attribution alone must not grant operational ownership or editing permission.

## Boundaries

- Billing App licence/activation/installer delivery has no backend workflow in this checkout. The prototype's fake installer is not exposed. Statement import was also a prototype file-selection toast; partners cannot import files to alter the authoritative wallet. Bank-result imports remain with the existing finance workflow.
- The existing dashboard returns up to 200 listings; point history shows the latest 50 entries and 20 conversions. Wallet, earnings and withdrawal tables use server pagination.
- Commerce availability, active plans, configured rewards/conversion rates, private storage, verified bank accounts and scheduled jobs remain deployment prerequisites. No environment settings are changed by this UI work.
- Backend regression tests use an isolated in-memory SQLite database. A production build is not authenticated-browser, PostgreSQL, document-storage, provider-delivery or bank-processing proof.
- A headless browser also exercises all six routes with intercepted fictional API responses: ledger and sales details, withdrawals, point conversion, referral selection, editing permissions and new/pending applications. These fixtures do not prove a deployed integration.
- Vendor/dealer UI redesign is outside this partner change.

## Validation on 5 November 2026

- 62 frontend tests and 24 Phase 2/3 backend tests passed.
- Frontend lint and production build passed; the build logged expected public-catalogue fetch warnings while the local Django server was offline.
- Django system checks passed and `makemigrations --check --dry-run` reported no changes.
- Headless Chrome passed fixture-based interactions across all six routes, with every route constrained to a 390px mobile viewport. Wallet, profile and sharing screenshots were visually inspected.
- Authenticated integration against a running Django/PostgreSQL deployment, private document storage and real providers remains an acceptance step.
