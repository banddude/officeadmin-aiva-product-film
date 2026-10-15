import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderStill, renderMedia} from '@remotion/renderer';
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

// No app server, source app build, login, downloads, or production writes.
const args = new Set(process.argv.slice(2));
const portrait = args.has('--portrait');
const kind = portrait ? 'portrait' : 'landscape';
const doVideo = args.has('--video');
const onlyVideo = args.has('--video-only');
const qa = path.resolve('qa/v3');
const out = path.resolve('out/v3');
mkdirSync(qa, {recursive:true}); mkdirSync(out, {recursive:true});
const inputs = ['src/v3-assembly-hero.tsx','src/v3-assembly-review.tsx','public/ui-dom/projects.json','public/fonts/Inter.woff2','public/audio/v3/music.wav'];
const fingerprints = Object.fromEntries(inputs.map(file => [file, createHash('sha256').update(readFileSync(file)).digest('hex')]));
const serveUrl = await bundle({entryPoint:path.resolve('src/v3-assembly-review.tsx'), outDir:path.resolve(`build-v3-assembly-${kind}`)});
const browser = await openBrowser('chrome', {browserExecutable:'/snap/bin/chromium',chromiumOptions:{gl:'angle'}});
const browserErrors = [];
const manifest = {kind,source_film_seconds:[6,16],preview_fps:60,frames:600,source_fingerprints:fingerprints,
  provenance:'Real rendered OfficeAdmin component DOM and frozen computed styles. Fictional Northline/Cedar Court data. Only source layout transforms and editorial selection cues. No product screen redraw.',
  source:'public/ui-dom/projects.json',stills:[],browserErrors};
try {
  const composition = await selectComposition({serveUrl,id:portrait?'AssemblyProofPortrait':'AssemblyProofLandscape',puppeteerInstance:browser});
  if (!onlyVideo) {
    for (const frame30 of [0,8,20,40,63,90,114,144,160,180,190,207,224,252,280,299]) {
      const file = path.join(qa,`assembly-${kind}-${String(frame30).padStart(3,'0')}.png`);
      await renderStill({serveUrl,composition,frame:frame30*2,output:file,puppeteerInstance:browser,imageFormat:'png',
        timeoutInMilliseconds:90000,onBrowserLog:log=>{if(log.type==='error')browserErrors.push(log.text);}});
      manifest.stills.push({frame30,film_seconds:6+frame30/30,file:path.relative(process.cwd(),file)});
      console.log('STILL',kind,frame30);
    }
  }
  if (doVideo || onlyVideo) {
    const raw = path.join(out,`assembly-${kind}-visuals.mp4`);
    const fingerprint = createHash('sha256').update(JSON.stringify(fingerprints)).digest('hex').slice(0,14);
    const chunks = [];
    for (let from=0;from<composition.durationInFrames;from+=150) {
      const to = Math.min(from+149,composition.durationInFrames-1);
      const file=path.join(out,`assembly-${kind}-${fingerprint}-${String(from).padStart(3,'0')}.mp4`);
      chunks.push(file);
      let cached=false;
      if(existsSync(file))try {
        const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,width,height','-of','json',file],{encoding:'utf8'}));
        cached=Number(probe.streams[0]?.nb_frames)===to-from+1&&probe.streams[0]?.width===composition.width&&probe.streams[0]?.height===composition.height;
      }catch{}
      if(cached){console.log('CACHE',kind,from,to);continue;}
      let last=-1;
      await renderMedia({serveUrl,composition,outputLocation:file,frameRange:[from,to],codec:'h264',crf:17,pixelFormat:'yuv420p',colorSpace:'bt709',
        x264Preset:'fast',imageFormat:'jpeg',jpegQuality:98,concurrency:Number(process.env.ASSEMBLY_CONCURRENCY||3),muted:true,puppeteerInstance:browser,timeoutInMilliseconds:90000,
        onBrowserLog:log=>{if(log.type==='error')browserErrors.push(log.text);},
        onProgress:p=>{const n=Math.floor(p.progress*4);if(n!==last){last=n;console.log('RENDER',kind,from,to,`${n*25}%`,new Date().toISOString());}}});
      console.log('CHUNK SAVED',file);
    }
    const concat=path.join(qa,`assembly-${kind}-concat.log`);
    writeFileSync(concat,chunks.map(file=>`file '${file}'`).join('\n')+'\n');
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',concat,'-c','copy',raw],{stdio:'pipe'});
    const movie = path.join(out,`OfficeAdmin_V3_Assembly_${portrait?'Vertical':'Landscape'}.mp4`);
    execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-ss','6','-i',path.resolve('public/audio/v3/music.wav'),
      '-map','0:v:0','-map','1:a:0','-t','10','-c:v','copy','-c:a','aac','-b:a','256k','-ar','48000',
      '-af','afade=t=in:st=0:d=0.008,afade=t=out:st=9.72:d=0.28','-movflags','+faststart',
      '-metadata','title=OfficeAdmin V3 | Interface assembly proof',
      '-metadata','comment=Film seconds 6-16. Actual interface DOM; fictional demo data; editorial motion. Music only. No narration.',movie],{stdio:'pipe'});
    execFileSync('ffmpeg',['-v','error','-i',movie,'-f','null','-'],{stdio:'pipe'});
    const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',movie],{encoding:'utf8'}));
    const video=probe.streams.find(s=>s.codec_type==='video');
    const audio=probe.streams.find(s=>s.codec_type==='audio');
    if(!video||!audio||Number(video.nb_frames)!==600||video.width!==composition.width||video.height!==composition.height||Math.abs(Number(probe.format.duration)-10)>.04)
      throw new Error('Assembly movie validation failed');
    manifest.delivery={file:path.relative(process.cwd(),movie),validated:true,full_decode_errors:0,sha256:createHash('sha256').update(readFileSync(movie)).digest('hex'),probe};
    console.log('VIDEO COMPLETE',movie);
  }
} finally {
  await browser.close({silent:true});
  writeFileSync(path.join(qa,`assembly-${kind}-manifest.json`),JSON.stringify(manifest,null,2)+'\n');
}
if(browserErrors.length)throw new Error(`Browser console errors: ${browserErrors.join('; ')}`);
console.log('ASSEMBLY REVIEW COMPLETE',kind);
