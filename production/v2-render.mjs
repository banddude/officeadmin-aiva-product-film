import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, openBrowser} from '@remotion/renderer';
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const portrait=process.argv.includes('portrait');
const kind=portrait?'portrait':'landscape';
const id=portrait?'V2PortraitVisuals':'V2LandscapeVisuals';
const maxChunks=Number(process.argv.find(a=>a.startsWith('--chunks='))?.split('=')[1]??'99');
const concurrency=Number(process.env.REMOTION_CONCURRENCY??'3');
const browserExecutable=process.env.REMOTION_BROWSER??(existsSync('/snap/bin/chromium')?'/snap/bin/chromium':undefined);
const output=path.resolve('out/v2'); const qa=path.resolve('qa/v2');
mkdirSync(output,{recursive:true});mkdirSync(qa,{recursive:true});
const required=['desktop-projects','desktop-estimate','desktop-invoice','desktop-dashboard','desktop-aiva','mobile-projects','mobile-estimate','mobile-invoice','mobile-aiva','mobile-aiva-context','mobile-invoice-paid','desktop-dashboard-financial'];
for(const n of required)if(!existsSync(`public/ui/${n}.png`))throw new Error(`Missing authentic app capture: ${n}`);
if(!existsSync('public/audio/v2/master.m4a'))throw new Error('Missing finished V2 soundtrack');
const hash=createHash('sha256');
function files(dir){return readdirSync(dir).sort().flatMap(n=>{const p=path.join(dir,n);return statSync(p).isDirectory()?files(p):[p];});}
for(const f of ['src/v2-index.tsx','src/v2-film.tsx','src/design.tsx',...files('public/ui'),...files('public/brand'),...files('public/fonts')]){hash.update(f);hash.update(readFileSync(f));}
const fingerprint=hash.digest('hex');const cache=path.join(output,'cache',`${kind}-${fingerprint.slice(0,16)}`);mkdirSync(cache,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/v2-index.tsx'),outDir:path.resolve(`build-v2-${kind}`)});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions:{gl:'angle'}});
const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser});
const chunkSize=480;const all=[];let rendered=0;let pending=false;
try {
  for(let from=0;from<composition.durationInFrames;from+=chunkSize){
    const to=Math.min(from+chunkSize-1,composition.durationInFrames-1);const file=path.join(cache,`part-${String(from).padStart(4,'0')}.mp4`);all.push(file);
    let valid=false;
    if(existsSync(file))try{const j=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}));valid=j.streams[0]?.width===composition.width&&j.streams[0]?.height===composition.height&&Number(j.streams[0]?.nb_frames)===to-from+1&&Math.abs(Number(j.format.duration)-(to-from+1)/composition.fps)<.06;}catch{}
    if(valid){console.log('CACHE OK',kind,from,to);continue;}
    if(rendered>=maxChunks){pending=true;continue;}
    console.log('RENDER',kind,from,to,new Date().toISOString());let last=-1;
    await renderMedia({composition,serveUrl,codec:'h264',outputLocation:file,frameRange:[from,to],concurrency,crf:17,x264Preset:'fast',pixelFormat:'yuv420p',colorSpace:'bt709',puppeteerInstance:browser,imageFormat:'jpeg',jpegQuality:96,muted:true,onProgress:p=>{const v=Math.floor(p.progress*5);if(v!==last){last=v;console.log(kind,from,`${v*20}%`,new Date().toISOString());}}});
    rendered++;console.log('SAVED',file);
  }
}finally{await browser.close({silent:true});}
const state={composition:id,fingerprint,kind,width:composition.width,height:composition.height,fps:composition.fps,frames:composition.durationInFrames,chunkSize,renderedThisRun:rendered,pending,cache};
writeFileSync(path.join(qa,`render-state-${kind}.json`),JSON.stringify(state,null,2)+'\n');
if(pending){console.log('MORE CHUNKS NEEDED. Re-run the same command.');process.exit(0);}
const concat=path.join(cache,'concat.txt');writeFileSync(concat,all.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const filename=portrait?'OfficeAdmin_AIVA_V2_Vertical.mp4':'OfficeAdmin_AIVA_V2_Film.mp4';
const movie=path.join(output,filename);
execFileSync('ffmpeg',['-hide_banner','-y','-f','concat','-safe','0','-i',concat,'-i',path.resolve('public/audio/v2/master.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t',String(composition.durationInFrames/composition.fps),'-movflags','+faststart','-metadata','title=OfficeAdmin + AIVA | Run the work. Not the runaround.','-metadata','comment=Actual app interface with fictional demo data. AIVA private preview.',movie],{stdio:'inherit'});
// Decode the entire delivery, not just its first frame.
execFileSync('ffmpeg',['-v','error','-i',movie,'-f','null','-'],{stdio:['ignore','ignore','pipe']});
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',movie],{encoding:'utf8'}));
const video=probe.streams.find(s=>s.codec_type==='video');const audio=probe.streams.find(s=>s.codec_type==='audio');
if(!video||!audio||Number(video.nb_frames)!==composition.durationInFrames||video.width!==composition.width||video.height!==composition.height||Math.abs(Number(probe.format.duration)-96)>.08)throw new Error('Delivery verification failed');
writeFileSync(path.join(qa,`delivery-${kind}.json`),JSON.stringify({validated:true,decodeErrors:0,fingerprint,probe},null,2)+'\n');
console.log('DELIVERY COMPLETE',movie);
