// Deterministic, resumable V4 renderer. Visual chunks are keyed to source and asset hashes.
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, selectComposition} from '@remotion/renderer';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const portrait = process.argv.includes('portrait');
const kind = portrait ? 'portrait' : 'landscape';
const chunkLimit = Number(process.argv.find(value => value.startsWith('--chunks='))?.split('=')[1] ?? '99');
const concurrency = Number(process.env.REMOTION_CONCURRENCY ?? '3');
const browserExecutable = process.env.REMOTION_BROWSER ?? (fs.existsSync('/snap/bin/chromium') ? '/snap/bin/chromium' : undefined);
const qa = path.resolve('qa/v4');
const output = path.resolve('out/v4');
fs.mkdirSync(qa, {recursive: true});
fs.mkdirSync(output, {recursive: true});

function files(directory) {
  return fs.readdirSync(directory).sort().flatMap(name => {
    const file = path.join(directory, name);
    return fs.statSync(file).isDirectory() ? files(file) : [file];
  });
}

const sources = [
  'src/v4-index.tsx',
  'src/v4-film.tsx',
  'src/v4-dom.tsx',
  'src/v4-geometry.ts',
  'src/design.tsx',
  ...files('public/ui-dom-v4'),
  ...files('public/brand'),
  ...files('public/fonts'),
];
const hash = createHash('sha256');
for (const file of sources) {
  hash.update(file);
  hash.update(fs.readFileSync(file));
}
const fingerprint = hash.digest('hex');
const cache = path.join(output, 'cache', `${kind}-${fingerprint.slice(0, 16)}`);
fs.mkdirSync(cache, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/v4-index.tsx'), outDir: fs.mkdtempSync(path.resolve(`build-v4-${kind}-`))});
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
const composition = await selectComposition({
  serveUrl,
  id: portrait ? 'V4VerticalVisuals' : 'V4Visuals',
  puppeteerInstance: browser,
});
if (composition.durationInFrames !== 2700 || composition.fps !== 30) throw new Error('Unexpected V4 duration');

const parts = [];
const chunkSize = 300;
let rendered = 0;
let pending = false;
try {
  for (let from = 0; from < composition.durationInFrames; from += chunkSize) {
    const to = Math.min(composition.durationInFrames - 1, from + chunkSize - 1);
    const target = path.join(cache, `part-${String(from).padStart(4, '0')}.mp4`);
    parts.push(target);
    let valid = false;
    if (fs.existsSync(target)) {
      try {
        const probe = JSON.parse(execFileSync('ffprobe', [
          '-v', 'error', '-select_streams', 'v:0',
          '-show_entries', 'stream=width,height,nb_frames,color_space',
          '-show_entries', 'format=duration', '-of', 'json', target,
        ], {encoding: 'utf8'}));
        valid = probe.streams[0]?.width === composition.width
          && probe.streams[0]?.height === composition.height
          && Number(probe.streams[0]?.nb_frames) === to - from + 1
          && probe.streams[0]?.color_space === 'bt709'
          && Math.abs(Number(probe.format.duration) - (to - from + 1) / composition.fps) < 0.04;
      } catch {
        valid = false;
      }
    }
    if (valid) {
      console.log('CACHE', kind, from, to);
      continue;
    }
    if (rendered >= chunkLimit) {
      pending = true;
      continue;
    }
    console.log('RENDER', kind, from, to, new Date().toISOString());
    let previous = -1;
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: target,
      frameRange: [from, to],
      muted: true,
      concurrency,
      crf: 17,
      x264Preset: 'fast',
      colorSpace: 'bt709',
      pixelFormat: 'yuv420p',
      imageFormat: 'jpeg',
      jpegQuality: 96,
      puppeteerInstance: browser,
      timeoutInMilliseconds: 120000,
      onProgress: progress => {
        const step = Math.floor(progress.progress * 5);
        if (step !== previous) {
          previous = step;
          console.log(kind, from, `${step * 20}%`, new Date().toISOString());
        }
      },
    });
    rendered++;
    console.log('SAVED', target);
  }
} finally {
  await browser.close({silent: true});
}

const state = {
  kind,
  fingerprint,
  frames: composition.durationInFrames,
  fps: composition.fps,
  width: composition.width,
  height: composition.height,
  chunkSize,
  renderedThisRun: rendered,
  pending,
  cache,
};
fs.writeFileSync(path.join(qa, `render-state-${kind}.json`), JSON.stringify(state, null, 2) + '\n');
if (pending) {
  console.log('PENDING: resume with the same command.');
  process.exit(0);
}

const soundtrack = path.resolve('public/audio/v4/master.m4a');
if (!fs.existsSync(soundtrack)) throw new Error('Missing finished V4 soundtrack');
const concat = path.join(cache, 'concat.txt');
fs.writeFileSync(concat, parts.map(file => `file '${file.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
const filename = portrait ? 'OfficeAdmin_AIVA_V4_Contractor_Story_Vertical.mp4' : 'OfficeAdmin_AIVA_V4_Contractor_Story_Film.mp4';
const movie = path.join(output, filename);
execFileSync('ffmpeg', [
  '-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', concat, '-i', soundtrack,
  '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy', '-t', '90',
  '-movflags', '+faststart',
  '-metadata', 'title=OfficeAdmin + AIVA | Built for contractors',
  '-metadata', 'comment=Actual rendered app elements. Fictional contractor data. Editorial animation. AIVA private preview.',
  movie,
], {stdio: 'inherit'});

execFileSync('ffmpeg', ['-v', 'error', '-threads', '2', '-i', movie, '-f', 'null', '-'], {stdio: ['ignore', 'ignore', 'pipe']});
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', movie], {encoding: 'utf8'}));
const video = probe.streams.find(stream => stream.codec_type === 'video');
const audio = probe.streams.find(stream => stream.codec_type === 'audio');
if (!video || !audio
  || Number(video.nb_frames) !== 2700
  || video.width !== composition.width
  || video.height !== composition.height
  || Number(audio.channels) !== 2
  || Math.abs(Number(probe.format.duration) - 90) > 0.05) {
  throw new Error('V4 delivery probe failed');
}
fs.writeFileSync(path.join(qa, `delivery-${kind}.json`), JSON.stringify({validated: true, fullDecode: true, fingerprint, probe}, null, 2) + '\n');
console.log('DELIVERY COMPLETE', movie);
