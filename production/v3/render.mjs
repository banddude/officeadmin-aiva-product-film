// Deterministic, resumable V3 renderer. Cache is tied to source/visual assets.
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
const portrait=process.argv.includes('portrait'),kind=portrait?'portrait':'landscape';
const chunkLimit=Number(process.argv.find(x=>x.startsWith('--chunks='))?.split('=')[1]||'99');
const concurrency=Number(process.env.REMOTION_CONCURRENCY||'3');
const qa=path.resolve('qa/v3'),out=path.resolve('out/v3');fs.mkdirSync(qa,{recursive:true});fs.mkdirSync(out,{recursive:true});
function files(dir){return fs.readdirSync(dir).sort().flatMap(n=>{const f=path.join(dir,n);return fs.statSync(f).isDirectory()?files(f):[f]})}
const sources=['src/v3-index.tsx','src/v3-film.tsx','src/v3-dom.tsx','src/v3-assembly-hero.tsx','src/design.tsx',...files('public/ui-dom'),...files('public/brand'),...files('public/fonts')];
const hash=createHash('sha256');for(const f of sources){hash.update(f);hash.update(fs.readFileSync(f))}const fingerprint=hash.digest('hex');
const cache=path.join(out,'cache',kind+'-'+fingerprint.slice(0,16));fs.mkdirSync(cache,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/v3-index.tsx'),outDir:path.resolve('build-v3-'+kind)});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER||'/snap/bin/chromium',chromiumOptions:{gl:'angle'}});
const composition=await selectComposition({serveUrl,id:portrait?'V3VerticalVisuals':'V3Visuals',puppeteerInstance:browser});
if(composition.durationInFrames!==2700||composition.fps!==30)throw Error('Unexpected V3 duration');
const parts=[];const chunkSize=300;let rendered=0,pending=false;
try{for(let from=0;from<2700;from+=chunkSize){const to=Math.min(2699,from+chunkSize-1);const target=path.join(cache,`part-${String(from).padStart(4,'0')}.mp4`);parts.push(target);let valid=false;
 if(fs.existsSync(target)){try{const p=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames,color_space','-show_entries','format=duration','-of','json',target],{encoding:'utf8'}));valid=p.streams[0].width===composition.width&&p.streams[0].height===composition.height&&Number(p.streams[0].nb_frames)===to-from+1&&p.streams[0].color_space==='bt709'&&Math.abs(Number(p.format.duration)-(to-from+1)/30)<.04;}catch{}}
 if(valid){console.log('CACHE',kind,from,to);continue;}if(rendered>=chunkLimit){pending=true;continue;}
 console.log('RENDER',kind,from,to,new Date().toISOString());let progress=-1;
 await renderMedia({composition,serveUrl,codec:'h264',outputLocation:target,frameRange:[from,to],muted:true,concurrency,crf:17,x264Preset:'fast',colorSpace:'bt709',pixelFormat:'yuv420p',imageFormat:'jpeg',jpegQuality:96,puppeteerInstance:browser,timeoutInMilliseconds:120000,onProgress:p=>{const step=Math.floor(p.progress*5);if(step!==progress){progress=step;console.log(kind,from,step*20+'%',new Date().toISOString())}}});rendered++;console.log('SAVED',target);
}}finally{await browser.close({silent:true})}
const state={kind,fingerprint,frames:2700,fps:30,width:composition.width,height:composition.height,chunkSize,renderedThisRun:rendered,pending,cache};fs.writeFileSync(path.join(qa,`render-state-${kind}.json`),JSON.stringify(state,null,2)+'\n');
if(pending){console.log('PENDING: resume with the same command.');process.exit(0)}
if(!fs.existsSync('public/audio/v3/master.m4a'))throw Error('Missing finished soundtrack');
const concat=path.join(cache,'concat.txt');fs.writeFileSync(concat,parts.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const movie=path.join(out,portrait?'OfficeAdmin_AIVA_V3_Motion_Vertical.mp4':'OfficeAdmin_AIVA_V3_Motion_Film.mp4');
execFileSync('ffmpeg',['-hide_banner','-y','-f','concat','-safe','0','-i',concat,'-i',path.resolve('public/audio/v3/master.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','90','-movflags','+faststart','-metadata','title=OfficeAdmin + AIVA | Your business. In motion.','-metadata','comment=Actual rendered app elements. Fictional demo data. Editorial animation. AIVA private preview.',movie],{stdio:'inherit'});
const decoded=execFileSync('ffmpeg',['-v','error','-i',movie,'-f','null','-'],{stdio:['ignore','ignore','pipe']});
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',movie],{encoding:'utf8'}));
const video=probe.streams.find(x=>x.codec_type==='video'),audio=probe.streams.find(x=>x.codec_type==='audio');
if(!video||!audio||Number(video.nb_frames)!==2700||video.width!==composition.width||video.height!==composition.height||Number(audio.channels)!==2||Math.abs(Number(probe.format.duration)-90)>.05)throw Error('Delivery probe failed');
fs.writeFileSync(path.join(qa,`delivery-${kind}.json`),JSON.stringify({validated:true,fullDecode:true,fingerprint,probe},null,2)+'\n');console.log('DELIVERY COMPLETE',movie);
