# Product capability map

OfficeAdmin and AIVA were researched as one connected operating environment, with an important distinction between public business software and the platform owner's private assistant capabilities. This inventory reports observed documentation and registry defaults, not an assertion that every feature was independently end-to-end tested.

## What the product is

OfficeAdmin combines contractor operations with a genuine accounting system. Customers, projects, takeoffs, estimates, change orders, invoices, payments, bills, time, documents, inventory, and financial reporting share organizational context. Its records are not only dashboard summaries: the workflows create linked business objects and financial entries.

AIVA adds a context-aware assistant surface and a broader connected-tool environment. Its assistant and conversation interfaces are currently owner-only/alpha. The owner's broader AIVA installation can access communication, calendars, knowledge, documents, devices, development tools, and machine capabilities. Those connections belong to the configured owner environment; they are not automatically included for every paying OfficeAdmin tenant.

## The distinctions that matter in a product story

**Contacts are public; the separate CRM deal board is beta.** It would be misleading to treat all CRM views as equally released. The film uses the customer/project record, not an unrestricted CRM pipeline promise.

**Takeoff is public; AI extraction and automated electrical plans are not.** Manual measurement and counting, generated draft estimates, and linked quantity refresh are strong present-day workflows. The private AI visual takeoff, site-plan automation, and one-line builder belong to separately gated preview capabilities.

**Time tracking and crew scheduling are public; full payroll is beta.** Approved timecards and exports should not be advertised as proof of a generally released payroll engine. GPS capture is distinct from beta geofence enforcement.

**Customer payments are not OfficeAdmin billing.** A tenant's customer pays that tenant's configured Stripe account. No product demonstration should imply that OfficeAdmin's own subscription account is a fallback destination for customer money.

**Recorded conversations are not ambient omniscience.** AIVA summaries and extracted action items depend on available recordings and connected sources. The film visibly ties the actions to an example recording and project sources.

**The assistant can act, but the review boundary is part of the value.** Drafts are drafts until approved. AIVA's broader machine and communications permissions are powerful, but they should not be marketed as unlimited autonomous authority over customers, books, or devices.

**A feature flag is not a security boundary.** Organization and user scoping, site-admin guards, and public release policy are separate questions. Registry defaults can be overridden in a deployment and do not certify performance or readiness.

## Why the film is selective

A 112-second film cannot responsibly explain 78 registry entries, all connector actions, and every configured AIVA skill. The central story uses the workflows with the clearest cross-product continuity. The rest of this inventory is retained for future focused feature films, landing-page copy, and launch planning.

The reviewed registry has 39 production-default entries, 21 beta-default entries, and 18 alpha-default entries. The sections below list every parsed entry, including unpromoted and owner-only capabilities. The canonical public-feature-boundary document still governs tenant promises, and persisted runtime overrides may differ.


## Core

**Dashboard overview** · PROD default · `dashboard_overview`

The org landing dashboard with KPIs and widgets (/dashboard). Shipped core.

**Global search** · PROD default · `global_search`

App-wide command palette search across records and pages. Shipped core.

**Notifications** · PROD default · `notifications`

Notification center, bell badges, and push delivery (/notifications). Shipped core.

**Documents** · PROD default · `documents`

Org file manager with role-scoped folder visibility (/documents). Shipped core.

## AIVA

**AIVA chat** · ALPHA default · `aiva_chat`

Canonical AIVA conversation (/aiva/chat) with the nested CAO/tmux Live Session (/aiva/session). Owner cockpit.

**Voice conversations** · ALPHA default · `aiva_conversations`

Voice transcripts with speaker ID, the recorder, people directory, and contact merges (/aiva/conversations, /aiva/record, /aiva/people).

**Action items & drafts** · ALPHA default · `aiva_action_items`

AI-extracted action items plus the reply-draft review queue (/aiva/action-items, /aiva/drafts).

**Tasks** · ALPHA default · `aiva_tasks`

The owner task manager fed by AIVA, a tab in the AIVA strip (/tasks).

## Phone & Messages

**Business phone** · ALPHA default · `business_phone`

WebRTC dialer on the business line with history and favorites (/phone). Telephony carries per-line cost.

**Voicemail** · ALPHA default · `phone_voicemail`

Voicemail inbox with transcription and unread badges (/phone/voicemail).

**Business texts (SMS)** · ALPHA default · `business_texts`

Business-line SMS in the unified Messages UI (/aiva/messages, /messages/aiva). SMS carries per-message cost.

**Team chat** · BETA default · `team_chat`

Live team messaging over websockets (/messages/team). REVIEW: offer to tenant orgs?

**Email & calendar (owner)** · ALPHA default · `email_calendar`

The owner Gmail mailbox and read-only Apple calendars (/email, /calendar). Single-mailbox data, permanently owner-scoped.

**In-app video calls** · ALPHA default · `in_app_video_calls`

In-app video calls with recording + transcription, needs scoping (#1133).

## Projects

**Project hub** · PROD default · `job_costing`

The project hub itself: overview, files, notes, team, related activity, settings (/projects). Shipped core.

**Project tasks** · PROD default · `projects_tasks`

Per-project task board with due dates and overdue badges (/projects/[id]/tasks).

**Milestones** · PROD default · `projects_milestones`

Per-project milestone tracking (/projects/[id]/milestones).

**Punch list** · PROD default · `projects_punch_list`

Closeout punch list driving a job to done and final billing (#824) (/projects/[id]/punch-list).

**Change orders** · PROD default · `projects_change_orders`

Change-order lifecycle incl. client signing links (/projects/[id]/change-orders, /sign/co).

**Job costing detail** · PROD default · `projects_costing`

Job costs and margins, the Costing tab (supervisor+) (/projects/[id]/costing).

**Daily reports** · PROD default · `daily_reports`

Field daily logging, org-wide and per project (/daily-reports, /projects/[id]/daily-reports).

**Field captures** · PROD default · `project_captures`

Capture feed: photos/receipts/docs stamped who/when/where (#1201). OCR inside it stays behind receipts_ocr_capture.

**Nightly project-status pass** · ALPHA default · `project_status_pass`

Nightly LLM pass that rewrites each job's status, who-owes-what-next line, and notes from the last 24h of email/messages/calls/documents (#1924). Reads and writes the record only; never sends anything. Alpha while the conclusions are being checked against reality.

## Field Tools

**Takeoff (Plans)** · PROD default · `takeoff_plans`

Measure and count from a plan set to build an estimate (#622). Shipped.

**LiDAR / MagicPlan 3D scan** · BETA default · `lidar_scan`

Capture a room/site with the iPhone LiDAR scanner and export a floor plan (#1099/#1140).

**Live splat streaming** · ALPHA default · `splat_live_streaming`

Progressive real-time rendering of a Gaussian splat as the laptop reconstructs it, streamed over the realtime channel (#202). Falls back to the finished-file viewer if the stream drops.

**Receipts & OCR capture** · BETA default · `receipts_ocr_capture`

Field capture OCR: snap a receipt/document and auto-extract line items for review (#913-#917).

**Site-plan / single-line automation** · ALPHA default · `site_plan_automation`

Automated site-plan + single-line-diagram generation, experimental (#1138/#1098).

**Plan markup (alpha)** · ALPHA default · `plan_markup_alpha`

In-house plan markup over takeoff plan PDFs: draw / highlight / stamp plus calibrated measure (distance / area), rendered through the shared pdf.js viewer with a Konva overlay and persisted per plan file. Alpha; #1511 Phase 1.

**AI visual-takeoff assist (alpha)** · ALPHA default · `takeoff_ai_assist_alpha`

Private, reviewed AI-assisted draft device counting from plan regions or an approved fixture list. Accepted counts become visible plan marks; results are not automatically committed. Owner-only authorization remains separate from the alpha release flag.

**Single-line diagram builder** · ALPHA default · `single_line_diagram_builder`

Permit-ready electrical one-line diagram builder for the service chain (utility -> meter/main -> panels -> loads) with E/N tags and a license-block PDF export. The manual editor; distinct from the automated site_plan_automation flag. Field ask (Zak, 7/16).

**Offline-first field mode** · BETA default · `offline_mode`

Work jobs with no signal and sync when back online. Ship to beta first, then prod (#1199).

**NEC calculators** · PROD default · `nec_calculators`

Electrician calculators: load, conduit fill, wire sizing, voltage drop, panel schedule (/tools).

**AIVA Voice Bridge** · ALPHA default · `aiva_voice_bridge`

AIVA-initiated voice calls: she rings the phone through the app (CallKit), an on-device voice agent (default-voice TTS, on-device speech recognition, Foundation Models glue) converses from a briefing pack, streams gathered answers back, and can ask AIVA mid-call. Zero cloud audio (#1521).

## Sales

**Estimates & quotes** · PROD default · `estimates`

Estimate/quote builder with one-tap estimate -> invoice. Shipped core.

**Invoicing & AR** · PROD default · `invoicing`

Invoice lifecycle, PDF, reminders, and accounts receivable (payments, credit notes, recurring). Shipped core.

**Bids pipeline** · PROD default · `bids_pipeline`

Lead -> estimating -> bid-sent board with awarded tracking (#459) (/bids, /sales/bids).

**Follow-ups** · BETA default · `follow_ups`

Stale-bid chaser with ready-to-send drafts in the owner's voice (/follow-ups). REVIEW: tenant-ready?

**A-Z EV estimate builder** · BETA default · `az_ev_estimate_builder`

EV-vertical estimate builder (make-ready, DCFC, bollards), Shaffer/EV-specific (#921).

## Client Portal

**Client portal & pay links** · PROD default · `client_portal`

Token-based client portal (invoices, quotes, payments, statements) and Stripe pay links (/portal, /pay).

**E-signature** · PROD default · `esignature`

Token-based signing for quotes and change orders (/sign).

## Purchases

**Bills & AP** · PROD default · `bills_ap`

Accounts-payable core with recurring bills (/purchases).

**Expenses** · PROD default · `expenses`

Expense tracking incl. recurring expenses (/purchases/expenses).

**Purchase orders** · PROD default · `purchase_orders`

POs with requisitions and landed costs bundled (/purchases/orders, /purchases/requisitions, /purchases/landed-costs). REVIEW: split bundling?

## Accounting

**General ledger** · PROD default · `general_ledger`

Journal, chart of accounts, period close, fiscal years, opening balances, tags and cost centers (/accounting).

**Bank feeds** · PROD default · `banking_feeds`

Bank connections, imports, rules and auto-categorization, payment batches (/accounting/banking).

**Bank reconciliation** · PROD default · `bank_reconciliation`

Statement reconciliation incl. the guided flow and integrity diagnostics (/accounting/banking/[id]/reconcile).

**Budgets** · PROD default · `budgets`

Budgeting with budget-vs-actual reporting (/accounting/budgets).

**Fixed assets & loans** · BETA default · `fixed_assets_loans`

Asset and loan registers with schedules (/accounting/fixed-assets, /accounting/loans). REVIEW: tenant-ready?

**Revenue recognition & accruals** · BETA default · `revenue_recognition`

Revenue schedules and accrual automation (/accounting/revenue-schedules, /accounting/accruals). REVIEW: tenant-ready?

## Taxes

**Sales tax center** · PROD default · `sales_tax_center`

Rates, periods, sales-tax filing view and lookup; VAT/BAS/currencies bundled (/tax/*). REVIEW: split international?

**Income tax workspace** · BETA default · `income_tax_workspace`

Entity return checklists (1040/1065/1120/1120-S, Schedule C) and tax documents (/tax). REVIEW: tenant-ready?

## Reports

**Standard reports** · PROD default · `reports_standard`

Statements, aging, spend analytics and job profitability: the shipped report pack (/reports).

**Cash flow forecast** · BETA default · `cash_flow_forecast`

Forward-looking cash projection (/reports/cash-flow-forecast). REVIEW: model confidence?

**Custom report builder** · BETA default · `custom_report_builder`

Ad-hoc report builder (/reports/custom). REVIEW: mature enough for prod?

**Multi-org consolidation** · ALPHA default · `consolidation_multi_org`

Cross-org consolidation and activity (/reports/consolidation, /accounting/cross-org-activity). Only the owner runs multiple orgs today.

## Contacts & CRM

**Contacts directory** · PROD default · `contacts_directory`

The CRM-of-record with per-contact activity, financial and file tabs (/contacts).

**CRM pipelines** · BETA default · `crm_pipelines`

Deal board with analytics and pipeline configuration (/crm, /settings/pipelines). Dark on prod pending the decision to retire CRM; still visible on alpha/beta.

## Inventory

**Items & stock** · PROD default · `inventory_items`

Item catalog with lots, serials, variants, categories and low-stock alerts (/inventory).

**Price book** · PROD default · `price_book`

Contractor pricing database feeding estimates (/inventory/price-book).

**Warehouse operations** · PROD default · `warehouse_ops`

Warehouses, transfers, stock takes and valuation (/inventory/warehouses, /transfers, /stock-takes, /valuation). REVIEW: valuation coverage?

**BOM & assemblies** · BETA default · `bom_assembly`

Bills of materials and assembly builds (/inventory/bom, /inventory/assembly). REVIEW: used in anger yet?

## Scheduling & Time

**Time clock** · PROD default · `time_clock`

Punch clock and one-submit crew entry (/time/clock, /time/crew). Geofence enforcement stays behind field_crew_accountability.

**Timecards & entries** · PROD default · `timecards`

Per-employee weekly review and the filter/edit/audit entry list (/time/cards, /time/entries).

**Crew scheduling** · PROD default · `crew_scheduling`

Week-view shift builder (/scheduling, /time/schedule; collision handling hardened in #1255).

**Time reports** · PROD default · `time_reports`

Hours by project and employee plus labor reports (/time/reports).

**Field-crew accountability** · BETA default · `field_crew_accountability`

Geofenced clock-in enforcement and crew-accountability tooling (#1027/#1030).

## Payroll

**Workforce records** · BETA default · `payroll_workforce`

Employees, contractors, compensation reviews and the self-service portal (/payroll/employees, /contractors, /compensation, /self-service).

**Payroll runs** · BETA default · `payroll_runs`

Run engine, payslips, export and analytics (/payroll/runs). REVIEW: real run validated end to end?

**Time & leave** · BETA default · `payroll_time_leave`

Timesheet approval and leave tracking feeding runs (/payroll/time-leave, /timesheets, /leave).

**Payroll tax forms** · BETA default · `payroll_tax_forms`

W-2/1099 generation and the 1099 prep report (/payroll/tax-forms, /reports/1099-prep). REVIEW: validated against real forms?

**Gusto payroll integration** · ALPHA default · `payroll_gusto`

Connected Gusto account as the payroll engine: OAuth connect, approved-hours push, payroll journal pull (/settings/integrations/gusto). Also env-gated on GUSTO_CLIENT_ID/SECRET; dark on prod.

## Platform & Settings

**Members, roles & teams** · PROD default · `org_members_roles`

Membership, roles, advisor access, sessions, audit trail and crew teams (/settings/members, /settings/roles, /teams).

**Workflows & approvals** · BETA default · `workflows_approvals`

Approval chains and the automation engine (/settings/approval-workflows, /settings/workflows). REVIEW: used beyond experiments?

**API & webhooks** · BETA default · `api_webhooks`

API keys plus outbound and inbound webhooks (/settings/api-keys, /settings/webhooks). REVIEW: contract stable enough to sell?

**Email delivery & templates** · PROD default · `email_delivery`

Outbound email (invoices, reminders) and document templates (/settings/integrations/email, /settings/document-templates).

**Import, export & backups** · PROD default · `data_import_export`

CSV import/export, org backups and trash restore (/settings/import-export, /settings/backups, /settings/trash).

**QuickBooks migration** · BETA default · `quickbooks_migration`

The QuickBooks import wizard (/settings/migrate-quickbooks). REVIEW: fidelity proven on a real QB file?

## Broader AIVA environment

The read operating guidance organizes AIVA into communication, calendar, files, memory, business operations, development, system, and capability toolboxes. The connected environment includes email; iMessage and other configured messengers; Apple and Google calendars; notes and reminders; contextual people/project knowledge and commitments; OfficeAdmin estimating and operations; repository and app-development workflows; browser automation; transcription; remote machine commands and file transfer; device-related capabilities; and task-to-tool routing.

These are configured assistant capabilities, not a separately verified commercial entitlement catalog. Connection state, permissions, machine availability, authentication, and installed skills determine what can actually run. In particular, the source lists read/write and send capabilities that must not be represented as silently acting without authorization. The film uses only the project-context, recorded-conversation, draft-review, and authorized-action portion of that broader story.

## Sources

The public boundary, feature registry, user-journey documents, README, style tokens, and AIVA operating/capability guidance are identified in `claims-and-provenance.md`. The raw, date-stamped registry snapshot is `feature-registry-snapshot.json`. Broad claims are not drawn from the connector's action count alone.
