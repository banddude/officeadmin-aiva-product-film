# V4 contractor-story production notes

## Story

The 90-second cut starts with a contractor managing three active projects that need different kinds of follow-through. Juniper Café is a commercial tenant improvement, Garcia Residence is a residential service/panel upgrade, and Cedar Court is an EV installation approaching inspection and closeout. The audience is shown how OfficeAdmin connects the work, rather than being given a list of feature names.

The timeline is 0, 7, 18, 31, 43, 55, 62, 77, 84 and 90 seconds. It contains nine scenes: the three jobs; the assembled workspace; commercial estimating and approval; the panel crew and mobile job details; invoicing/payment/reporting; AIVA's character reveal; a cross-project context question and drafted updates; the connected workflow; and the final brand promise. Widescreen and portrait use separate layouts on the same timeline.

The revised 102-word narration occupies approximately 40.01 seconds. It gives a new viewer an explicit explanation of the software while leaving time for interface motion, recognition, music and the character moment.

## Actual interface and editorial motion

The source captures come from the existing isolated client-component harness and a private OfficeAdmin checkout. `production/capture4/isolation-manifest.json` and `qa/v4/dom-export.json` record capture provenance and boundaries. Eleven desktop/mobile rendered DOM snapshots live under `public/ui-dom-v4/`. They are not screen illustrations and they do not contain application JavaScript. Measured element and fragment geometry is generated into `src/v4-geometry.ts`.

The film animates the actual sidebar, topbar, project rows, estimate lines, total, schedule/shift elements, invoice payment panel, reporting cards, chart SVG paths, native chat bubbles and composer. These animations are editorial treatment, not a claim that the application has a built-in cinematic assembly effect or that an assistant executed live actions while filming.

Every visible company, person, site address, amount, date, schedule and message is fictional. The capture harness resolves business reads to in-memory fixtures, blocks outside browser requests and rejects business writes. No project, estimate, invoice, payment, accounting record, real customer message or production application source was changed to create this cut. The full private compiled application bundle and generated application CSS remain local intermediates and are excluded from the public package.

The three projects use an active status consistent with their scheduled and in-progress work. The project row selected by the camera is the same Juniper record used in the estimate and invoice. The panel shift shown in close-up belongs to Garcia, and the contextual AIVA answer references all three jobs.

## Financial example

The fictional commercial estimate is $20,800, comprising $8,400 lighting and power rough-in, $4,950 panel/feeder modifications, $5,600 devices/lighting trim/controls, and $1,850 permit/inspection coordination. Each line has quantity one. Source money and quantities use the application's integer-hundredths conventions.

The estimate issue, acceptance, invoice and payment occur on separate dates in the fictional record. The animated settlement explicitly represents a later payment. Total stays fixed at $20,800 while paid and due progress together and remain complementary. The subsequent reporting cards are a separate company-wide illustration, not the economics of this one job or a forecast of customer results.

The film does not imply that accepting an estimate automatically creates a charge, that all pricing is autonomous, or that the software guarantees profitability, tax compliance, construction compliance or business outcomes.

## AIVA character and branding

No replacement bunny was drawn. The character is separated from the original supplied robot, O and A masks. The two square pupils are their original connected image components. At rest, the separately composed layers match `aiva-dark-complete.png` exactly, with zero pixel difference. `qa/v4/character-provenance.json` records the derivation, dimensions, pupil origins and asset hashes.

The O and A glasses arrive together as a rigid piece. The original pupils close beneath them, so the logo letters themselves are not squashed into eyelids. A short highlight crosses the glasses. The reveal blinks at 58.40 and 59.50 seconds; the closing peeking character blinks at approximately 86.23 and 87.13 seconds. These align to the original synthesized sounds within one video frame. The final composition presents AIVA peeking over the OfficeAdmin mark, not a static side-by-side logo pair.

Prepared layers are loaded with Remotion image components and awaited before capture. There is no asynchronously loaded CSS mask used for the character animation. The regular OfficeAdmin and AIVA marks elsewhere remain the supplied official artwork.

The phone is an original dimensional front study using the iPhone 17 Pro-style proportions documented in the earlier cut. Actual responsive app content sits below the device status area and Dynamic Island and above its home indicator. It is not a physical-device recording or a claim about an iPhone 18 design.

## Sound

`narration.py` synthesizes the `af_heart` preset through Kokoro. AIVA uses explicit `ˈeɪvə` phonemes, AY-vuh. EV uses explicit letter phonemes, E V. No person's voice was cloned. Cue timing, text, phonemes and speed are recorded in `narration.json`; captions retain the product spelling.

`score.py` generates an original 120 BPM synth score, including bass, percussion, harmonic textures, a recurring melodic figure, scene transitions and soft glasses/blink accents. It contains no recorded commercial song or stock music sample. `mix.py` applies voice-aware ducking and two-pass loudness mastering. Final delivery verification measures the encoded mix and checks that both movies contain exactly the master AAC packets. Raw cues and lossless stems remain editable and are packaged without models or font binaries.

No human listening review is claimed. Automated audio checks confirm the measured signal and delivery properties, not subjective musical taste or a human's pronunciation judgment.

## Visual corrections and quality gates

The final pass corrected the source sidebar escaping its cropped viewport by establishing a transform-containing native canvas. It padded the actual estimate total to prevent rounded-corner clipping, separated the portrait invoice identity and payment panel so payment remains visible, moved the phone clear of captions, reduced ghosted text behind the lifted project row, used the real fragment sizes for the AIVA messages, and retained time for the complete context response before moving to the next request.

Source tests verify snapshot checksums, absence of executable scripts/fonts in snapshots, data consistency, arithmetic, schedule/crew identity, typed-versus-captured message consistency, the original character pixels, motion timebase, pronunciation tokens, cue fit, stereo audio and character/sound synchronization. Representative frames and transition moments are inspected in both aspect ratios. Completed MP4s are fully decoded and checked for dimensions, 2,700 frames, 30 fps, 90-second duration, Rec.709 H.264, stereo 48 kHz AAC, exact soundtrack identity and fast-start metadata. A downsampled temporal scan flags single-frame impulses for visual inspection; it is not a universal proof that no visual defect is possible.

The release preserves V1, V2 and V3. V4 uses its own isolated snapshot folder and source modules so changing the fictional V4 story does not retarget the older cuts.

## Delivery

The release contains both full movies, captions, audio stems, posters, review sheets and verification records. The Photos helper creates/reuses the dedicated V4 album on the intended laptop, checks existing filenames before import, leaves duplicate checking enabled and verifies the imported dimensions. Photos media identifiers and machine-local import receipts are private and never included in the GitHub release.

AIVA remains labeled private preview. The contextual updates are explicitly not sent and require review. Availability varies by release and account; owner-only capabilities are not represented as general tenant entitlements.
