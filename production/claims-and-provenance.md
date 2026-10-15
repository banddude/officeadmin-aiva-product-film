# Claims, sources, and provenance

Research date: 14 October 2026. Source paths below belong to the user's connected repositories and their local checkouts. No copied customer documents or private message content are included in the film.

OfficeAdmin repository: `banddude/officeadmin-books`. Reviewed checkout revision: `e31b3829ca4a956056ca1045c3de56387f396a13`. AIVA checkout revision: `0f69d2e768e4eeca71337231a13ca93f792ae248`. These identify the observed checkouts, not a claim that every included document was written at that revision or that the checkout exactly matches a deployed release.

## Primary product sources

`README.md`: contractor positioning, accounting core, job costing, estimating, change orders, time, assistant, phone and device integrations.

`docs/PUBLIC-FEATURE-BOUNDARY.md`: canonical public/owner-only distinction; last reviewed in the source on 2026-08-22. Its public feature boundary takes precedence over broad marketing summaries and older journey access descriptions.

`lib/flags/registry.ts`: 78 channel-controlled entries reviewed. Registry defaults are fallback policy; persisted overrides can change live access. Alpha/beta labels are not QA certification. Site-admin and organization authorization are separate from channel flags.

`docs/user-journeys/README.md`, `projects-and-search.md`, `bids-and-estimates.md`, `takeoffs.md`, `quotes-invoices-payments.md`, `time-and-schedule.md`, `aiva-messages-phone.md`, and `dashboard.md`: grounded workflow descriptions, routes, state transitions, and important limitations.

`app/globals.css` and the repository's public brand assets: OfficeAdmin visual identity and AIVA distinctions.

AIVA `start-here`, `capabilities`, and browser/toolbox guidance: context, task/action capabilities, personal integrations, machine tools, routing, and operating boundaries. A personal assistant's connected toolbox is not automatically a feature sold to ordinary OfficeAdmin tenants.

## Boundaries preserved in the film

- AIVA is visibly a private preview, not a generally available tenant assistant.
- The application screens are illustrative, not live recordings or a promise of exact current screen layout.
- All customer, project, financial, schedule, and conversational data is fictional.
- No unsourced claims of time saved, revenue increased, absolute accuracy, guaranteed compliance, or universal autonomy appear.
- Takeoff counts connect to estimates. Unpriced actual items still require pricing; the example uses supplied prices. It does not assert that all plan extraction is automatic.
- Customer estimate acceptance precedes invoice conversion. The actual system has a separate invoice-send step. The film's later paid invoice represents a later point in the example workflow, not an immediate automatic charge after approval.
- The accounting figures are a demonstration, not business advice, a profitability promise, or an assertion that the fictional company exists.
- Draft review precedes the depicted send. The demonstration did not send a real message.
- Customer payments belong to the tenant's own Stripe account. They are not the same as OfficeAdmin subscription billing.
- GPS capture is not marketed as universal geofence enforcement. Payroll, tax-return preparation, offline behavior, AI takeoff, and advanced field scanning are not promoted as public production entitlements.

## Audio and visual provenance

Music and sound design: original synthesized composition written in `production/score.py`; no commercial song, music sample, or stock recording is used.

Narration: Kokoro ONNX with the preset `af_heart` voice, generated locally on the render host. No real person's voice was cloned. Source script and timed phrases are included. The engine wrapper is published at https://github.com/thewh1teagle/kokoro-onnx and the model source at https://huggingface.co/hexgrad/Kokoro-82M. Refer to their respective notices and model terms when regenerating or redistributing model weights. Model weights are not included.

Typography: Inter from its official upstream repository, https://github.com/rsms/inter. Font binaries are not included. `npm run fonts` retrieves the public font for rendering. Preserve the applicable upstream font license when independently redistributing a font.

Icons: Lucide React dependency. Product marks: supplied by the user's actual OfficeAdmin repository and remain the product owner's assets. No Apple logo, product trade dress asset, commercial footage, or copied advertising soundtrack is used.

Video engine: Remotion 4.0.535. Remotion has its own commercial licensing terms; review https://www.remotion.dev/license for organizational usage. This handoff does not grant licenses on behalf of dependency or brand owners.

Animation and rendering references: https://www.remotion.dev/docs/spring, https://www.remotion.dev/docs/render, https://www.remotion.dev/docs/renderer/render-media. Technical correctness was checked against installed package types, a smoke render, TypeScript checks, and rendered stills.
