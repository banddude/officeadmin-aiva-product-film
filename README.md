# OfficeAdmin with AIVA

## Three jobs. One business. Keep it moving.

**V4 is the full 90-second contractor-story film**, with separately composed widescreen and vertical versions.

[Watch the widescreen film](https://github.com/banddude/officeadmin-aiva-product-film/releases/download/v4.0.0/OfficeAdmin_AIVA_V4_Contractor_Story_Film.mp4) · [Watch the vertical reel](https://github.com/banddude/officeadmin-aiva-product-film/releases/download/v4.0.0/OfficeAdmin_AIVA_V4_Contractor_Story_Vertical.mp4) · [Release assets](https://github.com/banddude/officeadmin-aiva-product-film/releases/tag/v4.0.0)

The story connects a commercial tenant improvement at Juniper Café, a residential panel upgrade at Garcia Residence, and EV closeout at Cedar Court. It follows an estimate into approval, a crew schedule into the field, an invoice into the books, and a question into a reviewed next step. All company, customer, project, schedule, financial and conversational records are fictional.

The interface is built from the **actual rendered OfficeAdmin components**, including their DOM, text, SVGs and computed styles, not newly drawn replacement screens. Individual rows, panels, numbers, charts, messages and the composer move independently. This is editorial motion with fixture data, not an authenticated production recording or a promise that the app itself contains these animations.

AIVA's glasses arrive as one piece while the original pupils blink beneath them. Her separate body, pupil and glasses layers are derived from the supplied app masks. The composed resting pose is pixel-identical to the official mark. The closing character peeks over the OfficeAdmin logo rather than appearing in a side-by-side logo lockup.

The original 120 BPM score includes restrained glasses and blink cues. The narration explicitly uses **AY-vuh**, /ˈeɪvə/, and pronounces EV as the two letters. The 102-word script occupies about 40 seconds of the 90-second film.

## Open the editable film

Node.js 22+, FFmpeg, FFprobe and a compatible Chromium installation are required. Python 3.9+ with Pillow is used by packaging and frame review; the optional audio and character-generation scripts have their own Python dependencies.

```sh
npm ci
npm run fonts
npm run typecheck
npm test
npm run studio
```

The font setup downloads Inter from its public upstream source. Font binaries are excluded from this repository and the release packages. Normal rendering requires no OfficeAdmin account, customer API, TTS API or private application bundle.

```sh
npm run render
npm run render:vertical
npm run test:delivery
```

Outputs:

```text
out/v4/OfficeAdmin_AIVA_V4_Contractor_Story_Film.mp4
out/v4/OfficeAdmin_AIVA_V4_Contractor_Story_Vertical.mp4
```

Both are 90 seconds at 30 fps. Widescreen is 1920 x 1080; vertical is 1080 x 1920. The delivery uses Rec.709 H.264, yuv420p, stereo 48 kHz AAC, and fast-start metadata. The vertical layout is independently authored rather than automatically cropped.

The renderer resumes nine 10-second sections per format. Cache keys include the visual source, source geometry, brand assets, UI snapshots and font. Each completed section is checked before reuse. The final mux copies the finished soundtrack packets instead of encoding audio again.

```sh
# Render a bounded batch, then resume with the same command.
node production/v4/render.mjs landscape --chunks=3
node production/v4/render.mjs portrait --chunks=3

# Optional host overrides.
REMOTION_BROWSER=/path/to/chrome REMOTION_CONCURRENCY=3 npm run render

# Inspect exact frames, in both layouts.
node production/v4/review.mjs 250,685,850,1030,1440,1752,2040,2220,2640
```

## Source map

`src/v4-film.tsx` contains the cut, camera choreography, wide/vertical layouts, character and device presentation. `src/v4-dom.tsx` loads the real interface elements into isolated shadow roots and animates them by frame. `src/v4-geometry.ts` records their measured source positions and fragment sizes; `production/v4/geometry.py` regenerates that file and its checksum registry. `src/v4-index.tsx` registers the two delivery compositions and their muted review variants.

`public/ui-dom-v4/` contains eleven isolated source captures. They contain no executable application scripts or font binaries. `public/brand/v4/` contains the prepared official character layers; `prepare-character.py` and `qa/v4/character-provenance.json` document and verify their exact composition. `public/audio/v4/master.m4a` is the finished render soundtrack.

The optional capture harness in `production/capture4/` imports real visible client components from a compatible private OfficeAdmin checkout. Data, auth and external-service boundaries resolve to fictional fixtures, outside requests are blocked, and business writes are rejected. The compiled application bundle and generated application CSS are local intermediates and are not published.

```sh
OFFICEADMIN_SOURCE=/path/to/officeadmin-books npm run capture:build
OFFICEADMIN_SOURCE=/path/to/officeadmin-books npm run capture:dom
python3 production/v4/geometry.py
```

Capture source provenance is recorded separately from the film revision. A recapture against a newer app may change geometry and requires new visual review before rendering. The prior V1, V2 and V3 sources and releases remain intact, with explicit `studio:v1`, `studio:v2`, `studio:v3` and corresponding render scripts.

## Audio and verification

`production/v4/narration.py`, `score.py` and `mix.py` generate the preset voice, original score and final mix. `production/audio-requirements.txt` lists the optional audio dependencies. The release stem ZIP preserves the lossless score, narration, raw voice cues, premaster and mastered WAVs, together with captions and scripts. Voice models are optional setup files, not part of this release. No person's voice was cloned.

`npm test` checks source hashes, the three-job story, estimate arithmetic, invoice balance, schedule data, exact message text, official character identity, pronunciation, audio format and blink timing. `npm run test:delivery` fully decodes both movies and verifies their actual runtime, dimensions, frame count, color metadata, audio identity, loudness, peak headroom and MP4 fast-start layout. Delivered-frame contact sheets and temporal anomaly checks are retained under `qa/v4/`. These tests describe specific verified properties, not a guarantee of subjective quality or a human listening review.

AIVA is identified as private preview. The film does not imply universal access to owner-only features, unsupervised sending, automatic payment after approval, autonomous pricing or guaranteed financial results. The example draft is explicitly not sent. See `production/v4/production-notes.md` for the cut and source boundaries, and `NOTICE.md` for existing model, dependency and brand notices.

## Photos delivery

On the intended Mac, after copying and verifying both movies:

```sh
osascript production/v4/import-to-photos.applescript /absolute/path/to/delivery-folder
```

The helper checks the dedicated `OfficeAdmin + AIVA - V4` album before importing, leaves duplicate checking enabled and verifies both imported filenames and dimensions. Photos delivery is separate from rendering and publishing. It must be verified on the target laptop, not inferred from a successful render.
