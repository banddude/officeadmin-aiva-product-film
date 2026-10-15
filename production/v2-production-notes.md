# Version 2 production notes

## Editorial direction

A 96-second marketing introduction, not a feature inventory. OfficeAdmin is presented as a connected home for customers, projects and money. AIVA is introduced through project context and a reviewed next step. The closing benefit is less switching and chasing: “Run the work. Not the runaround.” The revised narration has 105 words and approximately 35 seconds of speech. The vertical composition uses its own layouts rather than cropping the landscape film.

The cuts are at 0, 6, 14, 24, 34, 42, 50, 58, 64, 74, 82 and 88 seconds, ending at 96. The scenes cover the opening benefit; workspace reveal; project continuity; estimate to invoice; payment visibility; mobile work; financial visibility; AIVA reveal; contextual answer; reviewed draft; connected products; and final promise.

## Actual interface, fictional data

Application checkout: `banddude/officeadmin-books`, revision `e31b3829ca4a956056ca1045c3de56387f396a13`. This identifies the source captured, not necessarily the production deployment. No application source, production service or database was modified.

The existing demo login did not work. Instead, the capture harness imports the actual application's client pages, components and CSS into an isolated static fixture environment. These are not authenticated production recordings. The harness does not start a Next dev server or build/deploy the OfficeAdmin app.

Visible source includes `app/(dashboard)/projects/page.tsx`, the estimate `quote-detail-client.tsx`, the invoice `invoice-detail-client.tsx`, `dashboard-client.tsx`, `AppSidebar`, `Topbar`, `ChatLayer`, its shared chat surface, and the existing message/composer components. Desktop AIVA uses the actual in-flow right dock. Mobile uses the actual single Sheet below the app top bar. The canonical AIVA avatar identity renders the complete official mark.

Only data/auth/native-service hooks, realtime/prefetch services and unopened dialogs are isolated. Visible screens are not replaced by visual approximations. `capture2/isolation-manifest.json` lists the exact boundaries. The private application bundle and generated CSS are local intermediates excluded from the public repository.

Desktop viewports are 1440 × 980 at 2× density. Mobile viewports are 402 × 790 at 3× density. The film adds the phone's status/hardware/home-indicator regions around the actual responsive app image. Invoice and dashboard detail captures are produced by read-only scrolling in the real component tree. Camera moves and view transitions are editorial animation, not evidence of live user input.

Northline Electric, Alex Lee, Cedar Court, Jordan Morgan, the other projects and all business records/messages are fictional. Addresses use “Example”; emails use `example.com`. The loopback-only server provides static assets, all API reads resolve in memory, external browser requests are blocked, and all business mutations reject. No customer was contacted and no invoice, payment, project, ledger entry or real message was changed.

## Arithmetic and chronology

The estimate totals $18,450: $7,950 make-ready, six installations at $1,125, $2,400 commissioning, and $1,350 permit/inspection coordination. Both source quantity and money fields use hundredths. Six units therefore use quantity 600, not 6. The source tests check every line and total.

The estimate is issued October 8, accepted October 9, invoiced October 10 and paid October 12. The invoice shows $18,450 paid and $0 due. The edit does not claim that accepting an estimate instantly charges the customer. The reporting dashboard is a fictional whole-company snapshot, not the economics of this single job or a performance promise. The fixture has no monthly sparkline history; supplied reporting charts and full financial totals remain visible.

## Official marks and device rendition

OfficeAdmin uses the application's supplied PNGs, trimmed only to remove transparent padding. AIVA combines the original robot, O and A masks with the exact `AivaChatAvatar` theme colors: body #737373/#a3a3a3, O #0a0a0a/#fafafa, A #3BA4E0. No bunny or replacement logo was drawn. `v2-brand-provenance.json` records source hashes and transformations.

The phone is an original CSS front-view study, not an Apple photograph or physical-device recording. Its proportions follow the iPhone 17 Pro specification: 71.9 × 150 mm body, 1206 × 2622 pixel display. The film uses a 434 × 906 body with a 402 × 874 display, Dynamic Island, slim bezel, side controls and depth. No unverified iPhone 18 design is claimed. Primary reference: https://support.apple.com/en-au/125090

## Pronunciation and music

Kokoro's default phonemization of “Ava” was `ˈɑːvə`. Version 2 supplies `ˈeɪvə` explicitly to `Kokoro.create` with `is_phonemes=True` in both AIVA cues. Captions retain the spelling AIVA. The synthetic preset is `af_heart`; no human voice was cloned.

`v2-audio.py` composes an original 120 BPM score from synthesis: syncopated plucked tones, rounded bass, dry percussion, stereo detail and restrained transition sounds. There are no recorded song samples or stock tracks. The AIVA reveal reduces percussion; the ending resolves with more space. The lossless master measures -16.00 LUFS integrated and -1.50 dBTP before AAC encoding. The final AAC/video mix is checked separately.

The release stem package preserves the 13 raw cues, narration, music/sound, premaster and lossless master. `v2-narration.json` records text, timings, phonemes and voice settings. The committed AAC is enough to render the film without a TTS engine.

Regeneration, after preparing the original audio requirements and Kokoro weights:

```sh
python production/v2-audio.py
python production/master-audio.py public/audio/v2/premaster.wav public/audio/v2/master.wav --overwrite
ffmpeg -i public/audio/v2/master.wav -c:a aac -b:a 320k -ar 48000 -movflags +faststart public/audio/v2/master.m4a
```

Engine and model references: https://github.com/thewh1teagle/kokoro-onnx and https://huggingface.co/hexgrad/Kokoro-82M. Existing model, dependency and product-mark notices continue to apply. No font binaries are included.

## Validation and limits

The source suite checks screenshot hashes/dimensions, zero browser errors, one actual top bar, network/write isolation, financial arithmetic/chronology, official asset hashes, narration slots and explicit pronunciation, AAC properties and composition duration. Scenes in both aspect ratios are rendered for visual review. Cropped financial values, the original off-screen desktop chat, phone/label collisions and low-contrast overlapping disclosures were corrected during that review.

Visual source and assets are hashed to prevent stale render-chunk reuse. The renderer uses explicit Rec.709 H.264 sections, concatenates without another color conversion, and muxes the finished AAC without another audio encode. It fully decodes and probes each final delivery for dimensions, audio, frame count and runtime. Source tests, capture provenance, visual-review records, delivery probes and loudness records accompany the handoff.

AIVA remains labeled private preview. Feature availability varies by release. No universal assistant access, unsupervised sending, automatic pricing, guaranteed ROI or compliance claim is made. The example draft is explicitly unsent and ready for review. The original public-feature-boundary research and feature snapshot remain historical context, not a promise that every owner-only or alpha/beta capability is publicly available.

## Final encoded delivery results

Both 96-second exports passed a complete decode with zero errors. Each has 2,880 frames at 30 fps, correctly tagged Rec.709 H.264 video, stereo 48 kHz AAC, and fast-start metadata. Audio packet hashes match the finished soundtrack exactly in both files. The encoded mix measures -16.04 LUFS integrated and -1.40 dBTP. Final delivered frames from all 12 scenes were reviewed in both aspect ratios. These checks do not claim a subjective human listening review.

`v2-delivery-test.py` reproduces the file-level validation and retains it in `qa/v2/final-delivery-validation.json`. The optional Photos import script was compiled against the installed Photos dictionary without executing an import on the validation host. Photos delivery is a separate operation and is not implied by the video validation.
