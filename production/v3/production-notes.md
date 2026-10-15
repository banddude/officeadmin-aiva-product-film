# Version 3 production notes

## Editorial intention

The change from V2 is structural. V2 primarily moved pictures of interfaces. V3 moves the source interface elements themselves. The 90-second cut treats the connected workflow as choreography: separated work becomes one workspace, a particular project leads into estimate lines and totals, payment becomes visible, the interface travels into a phone, reporting builds into a financial picture, and AIVA turns project context into a reviewed draft.

The film is not a feature inventory. Narration contains 10 short cues and approximately 20.09 seconds of speech. Visual recognition, motion, music and a few short headlines carry the remaining story. Both 16:9 and 9:16 compositions are authored directly; the vertical film is not a center crop of the widescreen export.

## Cut and movement

0-6 seconds: source-authentic project, estimate, payment and metric fragments move independently around the opening statement. The official OfficeAdmin mark provides the transition.

6-16 seconds: `AssemblyHero` assembles the actual sidebar, header, project groups and rows with separate depth and timing. The source layout gets a brief settled hold. The camera then follows selection of the same Cedar Court row, which lifts from its real screen position into a readable close-up. Camera paths use bounded quintic easing. The dedicated scene tests cover continuity, source geometry and 30/60 fps timing.

16-29 seconds: line-item rows arrive separately. The displayed subtotal/total accumulates from their supplied values, then settles at $18,450. Acceptance is represented separately, followed by a macro view of the total. Mobile uses the actual responsive estimate layout and scrolling, not the desktop table squeezed into a phone-sized rectangle.

29-37 seconds: accepted work, invoicing and a later payment are distinct editorial states. The invoice's payment bar and values animate together. The film expressly labels the later payment state rather than implying that accepting an estimate automatically charges the customer.

37-47 seconds: the phone's hardware layers assemble around the responsive source interface. The native project view gives way to the invoice, and its actual scroll container moves through the document.

47-58 seconds: reporting cards assemble on individual planes. Their numbers count to the supplied fictional totals; bars fill and source SVG chart paths draw. The cash-flow panel moves to the foreground without changing its underlying financial data.

58-62 seconds: the complete official AIVA mark is introduced, with a deliberate musical pullback and moving context lines.

62-78 seconds: the actual composer types a project question. The native outgoing bubble travels into place, AIVA's answer reveals its words, a follow-up request is prepared, and the draft appears. The draft is explicitly not sent. Earlier messages move out of the focal area instead of overlapping the new draft.

78-84 seconds: a quick connected-workspace montage brings the desktop and mobile elements together.

84-90 seconds: the official marks, product names, promise and site close the film with a resolved musical tail.

## Source authenticity and isolation

The underlying OfficeAdmin client source is revision `e31b3829ca4a956056ca1045c3de56387f396a13` of `banddude/officeadmin-books`. The existing static capture harness imports the real visible application components and styles with fictional in-memory data. It does not run a Next development server or build/deploy the production application.

V3 exports the resulting rendered DOM, computed visual styles, text and SVGs into `public/ui-dom/`. Independently addressable fragments retain their measured source geometry. Scripts, event handlers, navigation links and application runtime data are removed. Only public product image assets are embedded; font binaries are not embedded or published. At render time, scoped shadow roots prevent styles and SVG identifiers from conflicting between elements.

The source's initial chart animation is allowed to complete before export. The fixture's calendar date remains fixed while its animation clock is advanced. This prevents exporting an offscreen chart's initial zero-width reveal clip. The film then applies its own deterministic path/area animation to the completed source SVG.

Native chat bubbles originally use a white pseudo-element to cut out their tails. When those same bubbles appear on the dark film stage, that source geometry is converted to an alpha mask. The original bubble fill and tail dimensions are preserved; no new chat design or product mark is substituted.

Unused style rules are pruned per fragment for rendering efficiency. Matching before/after render hashes were checked on the invoice/payment and chat scenes after this optimization. That operation changes neither the source data nor the final pixels of those checked frames.

All API reads remain fixture-only. Outside browser requests and business mutations are blocked. No production project, invoice, payment, accounting entry, message, customer contact or application source was changed to make this film. Camera moves, highlights, layer assembly, number transitions and typing are editorial animation. They are not claims that the app itself contains these transitions or that a real assistant performed actions during capture.

## Fictional records and arithmetic

Northline Electric, Alex Lee, Cedar Court, Jordan Morgan, all addresses, all other projects and all messages are demonstration data. Email addresses use example.com. The estimate is $18,450: $7,950 make-ready infrastructure, six installations at $1,125, $2,400 testing/commissioning and $1,350 permit/inspection coordination. The source uses integer hundredths for both quantities and money. Final line prices are not changed by the animation.

The example estimate is issued October 8, accepted October 9, invoiced October 10 and paid October 12. The final invoice shows $18,450 paid and $0 due. Reporting cards show a separate fictional company snapshot, not the profitability of that project and not a performance claim. AIVA's contextual answer and draft remain explicitly fictional and unsent.

## Brand and device

V3 uses the same complete official marks documented by `production/v2-brand-provenance.json`. OfficeAdmin's transparent padding was trimmed; AIVA's body/O/A assets retain the application's exact theme treatments. No replacement bunny was drawn.

The device is an original dimensional CSS front study using the documented iPhone 17 Pro proportions from V2. It is not a physical-device recording or a claim about an unreleased iPhone 18. Its responsive application content comes from the actual source interface.

## Sound

`score.py` produces an original 90-second, 120 BPM arrangement from seeded synthesis. It uses changing kick/bass patterns, layered snare/clap, variable hats, an eight-chord cycle, a recurring motif, stereo reflections and scene-specific dynamics. There are no commercial song samples or stock recordings.

`narration.py` uses the Kokoro `af_heart` preset, not a cloned person. The product name uses explicit `ˈeɪvə` phonemes, pronounced AY-vuh. Captions retain the spelling AIVA. `mix.py` balances the short voice cues, ducks the score smoothly and adds restrained original interface sounds. The finished AAC mix measured -16.05 LUFS integrated and -1.47 dBTP before video muxing. Final delivery checks verify that the exported movies contain the exact soundtrack packets.

The test record does not claim a human listening review. The lossless stems and generation scripts are preserved so the sound remains editable.

## Verification

Source tests validate all nine rendered UI snapshots, independent fragments, completed chart paths, arithmetic, explicitly unsent draft, explicit pronunciation, composition duration, absence of runtime scripts and embedded fonts, and audio properties. Separate assembly tests validate bounded camera movement and anchoring. Representative and transition frames are rendered in both layouts. Delivery validation fully decodes each completed MP4 and checks frame count, dimensions, runtime, Rec.709 metadata, stereo AAC, fast-start structure, audio packet identity, loudness and true peak.

These checks are specific to their recorded inputs. They do not establish that a future application revision, recapture, new font, different browser or re-edit will be identical. No claim of universal assistant access, unsupervised sending, automatic pricing, guaranteed ROI or compliance is made. AIVA remains identified as private preview.

## Photos delivery

Rendering and publishing are separate from importing into Photos. The import helper uses a dedicated V3 album and the two exact V3 filenames, leaves duplicate checking enabled, checks existing items before importing, and verifies each imported movie by filename and dimensions. It must run on the intended laptop, not a different Mac's Photos library. A successful film render does not imply a successful Photos import.
