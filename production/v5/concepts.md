# OfficeAdmin + AIVA V5: story concepts

Status: concepts only. Nothing built or rendered. Waiting for AIVA's go.

Format (Mike, 10/15 8:13 PM): an **animated story of about 2 minutes** (90-150 s). Widescreen first (1920x1080), vertical cut second (1080x1920). It follows one contractor through one whole job, from the first client text to getting paid. Every major OfficeAdmin feature shows up **at the moment it saves him**, plus AIVA catching what he'd forget, with the contractor approving. Someone Mike sends it to should finish it knowing the whole app and feeling excited. It should be fun, with real stakes and a payoff, and it should not feel like a tour.

## What V4 got wrong (watched it; 14 frames pulled from 1 s to 87 s)

- **No person, so no stakes.** "Three jobs. One business." is a category claim. Nobody wants anything, so nothing is at risk.
- **Slogans carried the film; the UI was wallpaper.** Most frames are a two-line headline next to a small, tilted screenshot you can't read. "Bid it. With context." "Right crew. Right job." "Know where you stand." Those are feature bullets with nothing happening.
- **Nothing changes state.** The estimate is already finished, the schedule already full, the books already counted. The viewer never sees the app *do* anything.
- **AIVA's payoff was empty.** The bubbles read "Juniper: lighting" and "Three." Her best moment was the logo blink.
- **It was a tour.** Scope, estimate, crew, books, and follow-ups ran in feature order across three jobs, so no single job had a beginning, a middle, or an end.

V5 rule: **one contractor, one job, one problem per scene, and the app solves it on screen in a way you can read.** Every feature earns its entrance by rescuing him from something.

## Verified feature list (source: `officeadmin-books@e31b3829`, `lib/flags/registry.ts` defaults, checked 10/15)

| Feature | Registry key | Channel | Used as |
|---|---|---|---|
| Takeoff from plans | `takeoff_plans` | prod | scope |
| Estimates / quotes, one-tap estimate to invoice | `estimates` | prod | price |
| Price book | `price_book` | prod | material and labor pricing |
| E-signature (quotes and change orders) | `esignature` | prod | client approval |
| Client portal and Stripe pay links | `client_portal` | prod | deposit and final payment |
| Crew scheduling (week view) | `crew_scheduling` | prod | staffing |
| Time clock | `time_clock` | prod | crew on site |
| Field captures (photos stamped with who, when, and where) | `project_captures` | prod | field photos |
| Daily reports, PDF with client-visible photos | `daily_reports` | prod | client update |
| Change orders with signing link | `projects_change_orders` | prod | surprise in the wall |
| Punch list | `projects_punch_list` | prod | closeout |
| Invoicing, AR, reminders | `invoicing` | prod | final bill |
| Bank feeds with auto-categorization | `banking_feeds` | prod | books |
| Job costing | `projects_costing` | prod | margin on the job |
| Standard reports (P&L, job profitability) | `reports_standard` | prod | books |
| AIVA business texts | `business_texts` | **alpha** | client texts in |
| AIVA action items and draft review queue | `aiva_action_items` | **alpha** | drafts that the contractor approves |
| Nightly project-status pass ("who owes what next") | `project_status_pass` | **alpha** | AIVA's catch |

**Not claimed:** AI visual takeoff (alpha, private), so the contractor does the takeoff himself. Receipt OCR (beta). Payroll (beta). Geofencing (beta). Offline mode (beta). No automatic supplier-quote ingestion. No time-saved or revenue numbers. Customer money goes to the contractor's own Stripe account. **Disclosure on screen: "AIVA is in private preview."**

## Shared cast, style, and rules

- **Tony Vela**, owner of Vela Electric (fictional). Crew: **Ray Ochoa** and **Sam Lin**. Client: **Jen Calder**, kitchen remodel plus EV charger. Tony's kid: **Mia**. All names are fictional and were checked against the owner's contact list for collisions.
- **Animation style:** bold flat-vector 2D characters (geometric shapes, few parts, expressive poses, snappy squash and stretch) in simple illustrated locations: couch, truck, kitchen, roof, ball field. The **real OfficeAdmin UI** lives inside animated phones and laptops and pushes in to full frame when it's the hero, so it's legible. Characters are drawn in Remotion as SVG. No stock footage and no AI-generated people.
- **AIVA** is the official glasses mark from `public/brand/v4`. She slides her glasses on and blinks whenever she catches something, which becomes the film's recurring visual signature. She's pronounced "AY-vuh" (`qa/v4/pronunciation.json`).
- **AIVA never sends on her own.** Every outbound message shows a readable draft, then Tony's thumb on **Approve**, then **Sent**. That approve tap is a recurring beat, not a disclaimer.
- A narrator VO (Kokoro, warm and wry) carries the explanation, AIVA has short lines, and captions are burned in.
- End card: the official OfficeAdmin mark, the AIVA glasses blink, "AIVA is in private preview," and officeadmin.io.

---

## Concept 1 (RECOMMENDED): "9:14 PM"

**Spine: a race against the clock, chaptered by timestamps.** Every scene opens on a big animated clock card ("9:14 PM", "7:42 AM", "Day 3, 10:05 AM"). The stakes escalate from *win the job*, to *don't eat the surprise*, to *don't leave money on the table*.

**Logline:** At 9:14 PM a homeowner texts that she's picking a contractor in the morning. Tony is pinned under his sleeping kid on the couch. Over the next two weeks he wins the job from that couch, survives what the crew finds inside the wall, and gets paid in full, because his office never clocks out.

**Hook line (0-3 s):** a phone buzzes in the dark: *"Hey Tony! Picking a contractor tomorrow AM. Any chance you can price the kitchen + EV charger tonight?"*

**End line:** **"Your office never clocks out."** On the card: "OfficeAdmin, with AIVA."

**Two devices that make it clear to a first-time viewer:**
- **Say what it is early.** Right after the 9:31 PM **Sent** (about 38 s), the camera pulls out of Tony's phone into a one-line title moment. The narrator says: *"That's OfficeAdmin. One app that runs a contracting business, from the first text to the final payment. AIVA is the assistant inside it."* The OfficeAdmin mark lands, and the glasses blink. From then on the viewer knows what they're watching.
- **The toolbelt.** Tony's animated tool belt sits in the lower corner. Each time a feature saves him, a labeled badge snaps onto it with a satisfying clack and a small pitch-rising chime: *Takeoff, Estimate, E-sign, Deposit, Schedule, Time clock, Photos, Daily report, Change order, Punch list, AIVA catch, Invoice, Bank feed, Job costing, Reports.* At the end card the full belt spins into frame as a recap, and a friend can name the whole app from it. The belt is also the score's rhythm: the chime climbs a step with each badge, so the film literally builds.

### Beat sheet (about 128 s)

| Time | Chapter | Problem, then the save | Feature on screen | Narrator / caption |
|---|---|---|---|---|
| 0-6 | **9:14 PM** | Text lands. Second text: "Got 2 other quotes coming 🙃". | AIVA Messages thread (alpha) | "Meet Tony. Electrician. Dad. Currently pinned under a sleeping six-year-old." |
| 6-12 | | Plans are at the office, pricing is in an email, he can't move. | (animated chaos: papers, sticky notes) | "Whoever answers first usually wins. Tony can't reach his laptop." |
| 12-16 | | Glasses slide on, blink. | AIVA mark | AIVA: "I've got her plans from Tuesday. Want a price?" |
| 16-24 | | Counts from Tuesday's walk-through roll up: cans, GFCIs, the EV circuit. | **Takeoff** on the Calder Kitchen plan sheet | "He counted it on site Tuesday. It's all still here." |
| 24-32 | | Lines build from the takeoff and price the job. Total counts up to $8,940. | **Estimate** + **Price book** + labor rate | "Price book costs. His labor rate. Every line from the takeoff." |
| 32-38 | | Draft reply with the estimate link. Thumb on **Approve**, then **Sent 9:31 PM**. | **Draft review** (alpha) | "AIVA drafts it. Tony decides." |
| 38-44 | **7:42 AM** | Notification: signed. The pay link shows the deposit paid. | **E-signature** + **Client portal / pay link** | "Signed before breakfast. Deposit in his own account." |
| 44-54 | **Monday** | Two crews, three jobs, one week. Tony drags Calder Kitchen onto Ray and Sam's Wednesday. Their phones light up, then they punch in at the site. | **Crew schedule** + **Time clock** | "The crew sees the job the second it's booked." |
| 54-66 | **Day 1, 4:30 PM** | Jen at work, anxious: "How's it going over there??" Ray's photos drop in, stamped. A daily report assembles from them, with client-visible photos only. AIVA drafts the update, Tony approves, sent. Jen beams. | **Field captures** + **Daily report PDF** + draft review | "The work gets photographed, and the client gets a report she'll actually read." |
| 66-82 | **Day 3, 10:05 AM** | **The turn.** Sam opens the wall and finds old cloth-wrapped wiring that has to go. Dramatic music sting. Without paperwork, this is a fight or a loss. Tony builds a change order from the photos, $1,240, and Jen signs it on her phone at her desk. | **Change order** + **signing link** | "Surprises happen. Arguments don't have to. It's in writing, and it's signed before anyone pulls a wire." |
| 82-92 | **Day 9** | Punch list items check off. Inspection passes. | **Punch list** | "Last items checked. Inspection: passed." |
| 92-102 | **Day 9, 11:48 PM** | **AIVA's catch.** While Tony sleeps, the nightly pass flags: "Change order #1 is approved but isn't on any invoice." Glasses blink. Next morning, a card reads "You'd have left $1,240 on the table." | **Nightly project-status pass** (alpha) + action item | "AIVA reads the whole job every night and catches what he'd forget." |
| 102-110 | **Day 10, 8:02 AM** | One tap turns the estimate into an invoice, with the change order included. Draft, Approve, Sent with pay link. Jen pays. The invoice stamps **PAID**. | **Invoice** + pay link | "Estimate to invoice in one tap. Paid the same morning." |
| 110-120 | | The payment lands in the bank feed and categorizes itself. Job costing shows Calder Kitchen's margin. The P&L ticks up. Tony is at Mia's ball game. | **Bank feeds** + **Job costing** + **Reports** | "The books already know. Tony's at the game." |
| 120-126 | **Kicker** | Jen texts: "Who runs your office?? So organized. Also... can you do the bathroom?" Tony looks at his phone. AIVA blinks. A new lead lands. | Projects / bids pipeline | (laugh beat) |
| 126-132 | **End card** | OfficeAdmin mark, glasses blink. "Your office never clocks out." "AIVA is in private preview." officeadmin.io | | VO: "OfficeAdmin, with AIVA." |

**Every feature, in order:** client text, takeoff, estimate, price book, approval/e-sign, deposit/pay link, crew schedule, time clock, field photos, daily report, change order, punch list, AIVA's catch, invoice, payment, bank feed, job costing, P&L. That's the whole app in the order a real job uses it.

**Why recommended:** it has the strongest stakes ladder (win it, then protect it, then collect it), a clock that keeps energy high for two minutes, a mid-film crisis everyone in construction has lived, and an AIVA catch with a dollar figure attached. The approve tap repeats three times, so "AIVA drafts, you decide" becomes something viewers learn without a lecture.

### Vertical cut

Reframe each chapter around the phone, which is the natural hero in vertical. The clock cards stay. It runs about 75-90 s by tightening the bridges between chapters.

---

## Concept 2: "Two Tonys"

**Spine: a split-screen parallel universe.** The same job, the same day, and the same surprises hit two versions of Tony at once. **Left Tony** runs on texts, paper, and memory. **Right Tony** runs on OfficeAdmin and AIVA. The comedy comes from the contrast, and the app is shown by what it prevents.

**Logline:** One kitchen job, two Tonys. One wins it, schedules it, survives the wall, and gets paid. The other is still at the kitchen table at 11 PM trying to find the photo of the panel.

**Hook line:** both phones buzz at the same moment with Jen's 9:14 PM text. Left Tony: "...tomorrow." Right Tony: AIVA blinks.

**End line:** **"Same job. Better ending."**

| Time | Beat | Left Tony (the old way) | Right Tony (OfficeAdmin) |
|---|---|---|---|
| 0-8 | Hook | Puts the phone down. | AIVA: "Want a price?" |
| 8-26 | Estimate | Morning: digs for plans, spreadsheet math, sends at 2 PM. Jen signed with someone else at 9 AM. (Rewind: for the story, she gives him one more shot.) | Takeoff, then estimate from the price book, then Approve and Sent at 9:31 PM. Signed and deposit paid by 7:42 AM. |
| 26-40 | Schedule | Group-text roulette. Ray shows up at the wrong job. | The week-view schedule. The crew's phones are updated and they're clocked in on site. |
| 40-54 | Field | Photos are lost in Ray's camera roll. Jen calls twice. | Captures, then the daily report PDF, then Approve and Sent. Jen sends a heart. |
| 54-72 | Wall surprise | Verbal "yeah just do it." It becomes a dispute at the final bill. | Change order from the photos, signed on Jen's phone. |
| 72-86 | Forgotten money | Forgets the change order entirely. | The nightly AIVA catch: "Change order #1 isn't on any invoice." |
| 86-100 | Invoice | Invoice is Net 30, then 47 days and three awkward texts. | One tap to invoice, Approve, Sent with pay link, paid the same morning. |
| 100-114 | Books | 11 PM, shoebox of receipts, the shoebox wins. | Bank feed, job costing, P&L. At Mia's ball game. |
| 114-122 | Merge | The screen wipes left to right and Left Tony *becomes* Right Tony. | |
| 122-128 | End card | | |

**Strength:** it's the most instantly understandable pitch ("oh, *that's* what it fixes"), and it has strong comedy.
**Weakness:** half the screen is spent on the *problem* instead of the product, so the UI is smaller on screen. It's a familiar ad trope. On vertical, the split screen has to become alternating cuts.

---

## Concept 3: "Behind the Curtain"

**Spine: the client's story, with a backstage reveal.** Jen narrates her experience hiring "the most organized contractor in LA." Every polished thing she gets (a fast estimate, a sign link, a schedule heads-up, a daily report, a clean change order, an invoice with a pay link) is followed by a pull-back that shows the backstage: Tony on a roof, in traffic, or at a ball game, with OfficeAdmin and AIVA doing the work and Tony approving with one thumb.

**Logline:** A homeowner is convinced her electrician has a full office staff. He doesn't. He has OfficeAdmin and a pair of blinking glasses.

**Hook line:** Jen, to camera, holding her phone: *"I texted three electricians at 9 PM. One sent me a real estimate before my show ended."*

**End line:** **"Look like a big outfit. Stay a small one."**

| Time | Jen sees (front of house) | Pull-back to Tony (backstage) | Feature |
|---|---|---|---|
| 0-14 | An estimate arrives at 9:31 PM. | Tony on the couch, Mia asleep. AIVA blinks, then the takeoff, the estimate, Approve. | Texts, takeoff, estimate, price book, draft review |
| 14-26 | "I signed, paid the deposit, done." | Tony is asleep and the notification lands. | E-sign, pay link |
| 26-38 | "They told me exactly who's coming Wednesday." | Tony in the truck drags a shift. Ray's phone pings. | Crew schedule, time clock |
| 38-54 | "Every day I got a report with photos." | Ray snaps photos, the daily report assembles, Tony approves from a ladder. | Captures, daily report |
| 54-72 | "They found old wiring. The change order was so clear I signed it in a meeting." | Tony builds the change order from Sam's photos. | Change order, signing link |
| 72-86 | "They even reminded me the change order would be on the final bill." | **AIVA's catch:** the nightly pass flags the uninvoiced change order, and Tony approves the fix. | Status pass, action item |
| 86-100 | "Paid it from my phone." | Invoice from the estimate, Approve, Sent, Paid. | Invoice, pay link |
| 100-112 | "I figured he has, like, an accountant and three office people." | Tony at the ball game. The bank feed, job costing, and P&L are already done. | Bank feeds, job costing, reports |
| 112-122 | **Twist:** "Can I meet your office team?" Tony turns his phone around. The glasses blink and wave. | | AIVA |
| 122-128 | End card | | |

**Strength:** it sells the *client-facing* result (why contractors win more jobs and look professional), the twist ending is a great share moment, and it's the most charming of the three.
**Weakness:** Tony's own stakes are lighter because we're in Jen's head, and the crisis beat (the wall) lands softer since she's watching it calmly.

---

## Recommendation: Concept 1, "9:14 PM"

It's the only spine where the stakes climb all the way through (win it, then protect it, then collect it), and that climb is what keeps a two-minute film fun instead of long. Every feature appears exactly when the job needs it, in real job order, so a friend watching learns the whole app as a story. It borrows the best piece of Concept 3 as its kicker ("Who runs your office??"). Concepts 2 and 3 work well as follow-up spots with the same cast.

## Build plan after go (summary)

- New compositions `V5Wide` (1920x1080, about 128 s) and `V5Vertical` (1080x1920) under `src/v5/`. V3 and V4 stay untouched.
- Flat-vector character and location kit in `src/v5/characters/` (Tony, Jen, Ray, Sam, Mia, couch, truck, kitchen, wall, ball field) as SVG with Remotion spring rigs.
- Extend `production/capture4` with fixtures and surfaces for AIVA Messages, project Takeoff, Draft approvals, Captures, Daily report, Change order, Punch list, Invoice (paid), Job costing, and Bank feed, plus the existing Estimate, Schedule, Dashboard, and Projects. Captures are written to `public/ui-dom-v5`.
- Brand layers come from `public/brand/v4`, using the glasses slide-on and blink as the recurring "catch" motif.
- Narration is Kokoro VO with AIVA pronounced AY-vuh. Captions are burned in. The score is original, in `production/v5/score.py`.
- Render only on the laptop through `oa-mac exec`, using the single-tab lossless PNG plus system FFmpeg pipeline, with BT.709 tags and disk watched. Frames are inspected by eye before anything is reported.

---

## GO received (AIVA, 10/15): Concept 1. Behavior-verified beat revisions

AIVA required every on-screen *behavior* to be verified in code, not just its flag. I checked `officeadmin-books@e31b3829`. Results and beat changes:

| Behavior | Code finding | Beat change |
|---|---|---|
| Takeoff to estimate | REAL. `projects/[id]/takeoff/[workspaceId]/generate-quote` prices counted markups with price-book assemblies, which carry labor hours. | Keep. |
| Estimate deposit and pay link | REAL. `lib/quotes/portal-deposit*`: a signed estimate creates a deposit invoice with a pay URL. | Keep. Signing and paying are now separate beats. |
| Draft approval | REAL for **iMessage, email, and team chat** (`commitment-draft.ts:49`). Approve queues the send, and the UI says queued is not sent. | Drafts are shown as **iMessage**. After Approve, the UI shows the real queued state, then the message lands on Jen's phone. |
| Crew notified on shift create | **NOT REAL.** Creating a shift only writes the audit log. | Changed: no push. Ray opens the app in the morning and sees "Today's shifts: Calder Kitchen 7:00 AM" (real iOS ScheduleView and Today's shifts widget), then punches in on the **time clock**. |
| Daily report client-visible photos | PARTIAL. There is a per-photo "shared with client" toggle, and the **client portal** shows only shared photos. The PDF includes all photos, there's no send action, and photos aren't sourced from field captures. | Changed: Ray adds photos to the day's **daily report** and toggles the panel photos to shared (the receipt stays private). Jen sees them in her **client portal** project page. AIVA drafts a short iMessage saying the photos are in the portal, and Tony approves. No PDF send is shown, and field captures are not shown. |
| Estimate to invoice includes approved change orders | **NOT REAL.** | Changed: the final bill is the estimate's **Convert to invoice** plus the approved change order's own **Convert to invoice** button (`change-orders/[id]/convert-to-invoice`, real), which shows the "Invoiced" badge. |
| Nightly pass flags uninvoiced change order | **NOT REAL.** Change orders aren't a signal source. | **Replaced.** The pass reads invoices (status, amount due) and scheduled shifts, and writes the "who owes what next" card. New catch, **Sunday 11:48 PM**: the crew starts Monday at 7, and the signed job's **$2,682 deposit is still unpaid**. The project's status card shows "Waiting on Jen Calder: deposit," and AIVA drafts a friendly iMessage reminder with the pay link. Tony approves. Jen pays at 6:51 AM, and Ray punches in at 7:00. This is the "forgotten deposit" from Mike's original list. |
| Bank payment matched | REAL. `bank-auto-reconcile` matches bank lines to invoices with recorded payments. | Keep. |
| Punch list, change-order signing link, job costing | REAL. | Keep. |

**Revised order:** 9:14 PM text, then takeoff, estimate with 30% deposit, iMessage draft, Approve. 7:42 AM: signed. Friday: Tony schedules the crew. **Sunday 11:48 PM: AIVA catches the unpaid deposit**, then Approve, then paid at 6:51 AM, then Ray punches in at 7:00. Day 1: daily-report photos are shared to the portal. Day 3: the wall surprise becomes a change order, which Jen signs. Day 9: punch list and inspection. Day 10: the final invoice and change-order invoice are created and paid. Then the bank feed match, job costing, and P&L, and the kicker.

Narration wording: AIVA "flags" and "drafts". The nightly pass is never described as sending or drafting by itself, and Tony approves every outbound message.

## Build-time claim corrections (from the capture agents' code reads, 10/15)

- **Client portal project page is disabled in the real app** (`CLIENT_PORTAL_PROJECTS_ENABLED = false`, pending privacy review). The film no longer says Jen sees daily-report photos in her portal. The daily report beat now says the crew logs photos so Tony knows where the job stands. The "Client portal" feature appears where it is real: Jen reviewing the estimate ("Deposit due at signing: $2,682.00"), signing, and paying.
- **The internal estimate page shows no deposit until accepted.** The deposit is shown in Jen's portal view and, after signing, as INV-01477 on the estimate.
- **Phone estimate sheet clips Qty/Amount at 402px** (real app layout). The film uses the mobile estimate detail lines instead.
- **Time clock running card renders for supervisors.** Ray is the crew's foreman in the story.
