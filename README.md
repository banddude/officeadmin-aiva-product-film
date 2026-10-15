# OfficeAdmin + AIVA

## Your business. In motion.

Version 3 is a **90-second UI motion film**, delivered as a 1920 x 1080 widescreen film and a separately composed 1080 x 1920 vertical reel. Both use 30 fps H.264 video and stereo AAC audio.

[Widescreen film](https://github.com/banddude/officeadmin-aiva-product-film/releases/download/v3.0.0/OfficeAdmin_AIVA_V3_Motion_Film.mp4) · [Vertical reel](https://github.com/banddude/officeadmin-aiva-product-film/releases/download/v3.0.0/OfficeAdmin_AIVA_V3_Motion_Vertical.mp4) · [Release assets](https://github.com/banddude/officeadmin-aiva-product-film/releases/tag/v3.0.0)

### What moves

The opening assembles the real application's navigation, header, project groups and rows on independent depth planes. The camera selects the Cedar Court project and brings that same row forward into a readable close-up. Estimate lines enter separately and accumulate into the total. The invoice payment bar and values progress together. The mobile interface scrolls within a dimensional phone. Reporting cards assemble, values count up, bars fill and the application's actual chart paths draw. AIVA's native composer types, messages move into place, and response text appears word by word.

These are **actual rendered application elements**, not redesigned screens. The exported markup contains the source component DOM, text, SVGs and computed styles. Remotion animates the elements independently in scoped shadow roots. The film uses fictional records and editorial choreography; it is not a recording of production actions or of new built-in app animations.

The complete official OfficeAdmin and AIVA artwork is retained. The voice uses explicit **AY-vuh** phonemes. The revised original score has a 120 BPM arrangement with scene-specific dynamics, syncopated bass, percussion, a recurring motif and tactile interface sounds. Narration occupies about 20 seconds of the 90-second film.

## Open and render

Requirements: Node.js 22 or newer, FFmpeg, FFprobe and a compatible Chromium installation. Python 3 is used for optional packaging and delivery validation.

```sh
npm ci
npm run fonts
npm run typecheck
npm test
npm run studio

npm run render
npm run render:vertical
npm run test:delivery
```

The font command retrieves Inter from its public upstream repository. Font binaries are not included in Git or the release archives.

The production renderer creates nine resumable 10-second sections per format. Its cache includes the visual source and asset fingerprints. Completed sections are reused only when their source fingerprint, frame count, dimensions and color tagging match. The final video uses the finished AAC soundtrack without another audio encode.

```sh
# Render a bounded batch, then safely resume.
node production/v3/render.mjs landscape --chunks=3
node production/v3/render.mjs portrait --chunks=3

# Select an installed browser or set rendering concurrency.
REMOTION_BROWSER=/path/to/chrome REMOTION_CONCURRENCY=3 npm run render

# Inspect chosen frames in both layouts.
node production/v3/review.mjs 220,370,650,1000,1690,2220,2600
```

The resulting files are `out/v3/OfficeAdmin_AIVA_V3_Motion_Film.mp4` and `out/v3/OfficeAdmin_AIVA_V3_Motion_Vertical.mp4`.

## Editable source

`src/v3-film.tsx` contains the full cut, device presentation and separate wide/vertical layouts. `src/v3-assembly-hero.tsx` is the independently tested 6-16 second interface assembly and project-selection scene. `src/v3-dom.tsx` loads the source-authentic elements and applies frame-driven row, value, chart, composer and text animation. `src/v3-index.tsx` registers the four delivery/review compositions.

`public/ui-dom/` contains the rendered UI snapshots, target geometry and independent fragments. These files contain **no application JavaScript, auth state or live customer records**. `public/brand/` retains the original official marks and their documented deterministic preparations. `public/audio/v3/master.m4a` is the final soundtrack used by the film.

`production/v3/score.py`, `narration.py` and `mix.py` reproduce the original score, explicit-pronunciation narration and final mix. The release audio archive contains lossless stems, individual voice cues, captions and production notes. Voice models remain an optional separate setup, as in V1/V2; no person's voice was cloned.

### Optional UI recapture

Normal film rendering does not require the OfficeAdmin source repository. To recapture after actual application changes, use a compatible private checkout and the existing isolated capture harness:

```sh
OFFICEADMIN_SOURCE=/path/to/officeadmin-books npm run capture:build
OFFICEADMIN_SOURCE=/path/to/officeadmin-books npm run capture:dom
```

The harness imports the real visible client components. Only data/auth/native-service boundaries and unopened dialogs are isolated. It binds to loopback, blocks outside requests and rejects business mutations. `export-dom.mjs` exports the resulting visual tree and strips runtime scripts and handlers. The dashboard's own initial chart animation is allowed to finish before its paths are exported. Compiled private application bundles and generated app CSS remain local intermediates and are excluded from publication.

## Accuracy and validation

Cedar Court, Northline Electric, Alex Lee, Jordan Morgan and all records/messages are fictional. The estimate arithmetic totals $18,450. Acceptance, invoicing and payment represent separate points in the demonstration, not an automatic charge after acceptance. The AIVA draft is explicitly unsent and ready for review. AIVA is labeled private preview; the film does not imply universal access to owner-only capabilities.

`production/v3/production-notes.md` documents the editorial map and data boundaries. `qa/v3/dom-registry.json` records every delivered UI snapshot and its hash. Source tests, independent assembly tests, frame reviews, full delivery probes and audio measurements accompany the production. Test results describe the checked properties, not a guarantee of subjective quality or a human listening review.

The Photos import helper imports only the finished V3 filenames into a dedicated V3 album on the target Mac. Photos delivery requires a reachable Mac and is separate from rendering or publishing the movies.

## Previous cuts

V1 and V2 remain preserved. Use `npm run studio:v1` or `npm run studio:v2`, and their corresponding render/review commands. `production/v2-readme.md` preserves the previous instructions. Existing source research, feature-boundary notes, asset provenance and notices remain available; their feature snapshots are historical, not a promise of current public availability.

See `NOTICE.md` and the production provenance documents for product-mark, model and dependency notices.
