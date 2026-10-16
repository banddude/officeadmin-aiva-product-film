// V5 delivery render (laptop only): one capture tab, lossless PNG frames, system FFmpeg, BT.709.
// Per section: capture -> encode -> verify -> delete that section's PNGs. Stops if free disk < 6 GiB.
// Resumable: verified section MP4s are reused. Usage: node production/v5/render.mjs landscape|portrait [--chunks=N]
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderFrames} from '@remotion/renderer';
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
const kind=process.argv.includes('portrait')?'portrait':'landscape';
const limit=Number(process.argv.find(x=>x.startsWith('--chunks='))?.split('=')[1]||'99');
const qa=path.resolve('qa/v5'),out=path.resolve('out/v5');fs.mkdirSync(qa,{recursive:true});fs.mkdirSync(out,{recursive:true});
const browserExecutable=process.env.REMOTION_BROWSER||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'/snap/bin/chromium');
const gl='swangle',pipeline='v5-lossless-single-tab-system-ffmpeg-v1',FPS=30;
const TL=JSON.parse(fs.readFileSync('production/v5/timeline.json','utf8')),TOTAL=Math.round(TL.duration*FPS);
const width=kind==='portrait'?1080:1920,height=kind==='portrait'?1920:1080,id=kind==='portrait'?'V5VerticalVisuals':'V5Visuals';
function files(dir){return fs.readdirSync(dir).sort().flatMap(n=>{const p=path.join(dir,n);return fs.statSync(p).isDirectory()?files(p):[p]})}
const hash=createHash('sha256').update(pipeline).update(gl);
for(const f of[...files('src/v5'),'production/v5/timeline.json','production/v5/narration.json',...files('public/ui-dom-v5'),...files('public/ui-v5'),...files('public/brand/v4'),'public/brand/oa-dark-trim.png',...files('public/fonts-v5')])hash.update(f).update(fs.readFileSync(f));
const fingerprint=hash.digest('hex'),cache=path.join(out,'cache',`${kind}-${fingerprint.slice(0,16)}`),framesDir=path.join(cache,'frames');fs.mkdirSync(framesDir,{recursive:true});
for(const d of fs.readdirSync(path.join(out,'cache')))if(d.startsWith(kind+'-')&&path.join(out,'cache',d)!==cache){console.log('REMOVE SUPERSEDED CACHE',d);fs.rmSync(path.join(out,'cache',d),{recursive:true,force:true})}
const frameFile=f=>path.join(framesDir,`${String(f).padStart(4,'0')}.png`);
const freeGiB=()=>{const o=execFileSync('df',['-k',out],{encoding:'utf8'}).trim().split('\n').pop().split(/\s+/);return Number(o[3])/1048576};
function validPng(file){try{const d=fs.readFileSync(file);return d.length>100&&d.subarray(0,8).toString('hex')==='89504e470d0a1a0a'&&d.readUInt32BE(16)===width&&d.readUInt32BE(20)===height&&d.subarray(-12).toString('hex')==='0000000049454e44ae426082'}catch{return false}}
function probe(file){return JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,nb_frames,color_space,color_primaries,color_transfer,pix_fmt','-show_entries','format=duration','-of','json',file],{encoding:'utf8'}))}
function validVideo(file,count){try{const p=probe(file),s=p.streams[0];return s.width===width&&s.height===height&&Number(s.nb_frames)===count&&s.color_space==='bt709'&&s.color_primaries==='bt709'&&s.color_transfer==='bt709'&&s.pix_fmt==='yuv420p'&&Math.abs(Number(p.format.duration)-count/FPS)<.04}catch{return false}}
const bundleDir=fs.mkdtempSync(path.resolve(`build-v5-${kind}-`));
const serveUrl=await bundle({entryPoint:path.resolve('src/v5/index.tsx'),outDir:bundleDir,enableCaching:false});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions:{gl}});
let rendered=0,pending=false,stopped=false;const chunks=[];
try{
 const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser});
 if(composition.durationInFrames!==TOTAL||composition.width!==width||composition.height!==height)throw Error('Unexpected V5 composition');
 for(let start=0;start<TOTAL;start+=300){
  const end=Math.min(start+299,TOTAL-1),count=end-start+1,file=path.join(cache,`part-${String(start).padStart(4,'0')}.mp4`);chunks.push(file);
  if(validVideo(file,count)){console.log('VERIFIED SECTION',kind,start,end);continue}
  if(rendered>=limit){pending=true;continue}
  const free=freeGiB();console.log('FREE GiB',free.toFixed(2));
  if(free<6){console.log('STOP: free disk under 6 GiB');stopped=true;pending=true;break}
  const missing=[];for(let f=start;f<=end;f++)if(!validPng(frameFile(f)))missing.push(f);
  console.log('CAPTURE',kind,start,end,'missing',missing.length,new Date().toISOString());
  if(missing.length){
   const batch=fs.mkdtempSync(path.join(cache,'capture-'));
   await renderFrames({composition,serveUrl,frames:missing,outputDir:batch,imageFormat:'png',concurrency:1,muted:true,puppeteerInstance:browser,timeoutInMilliseconds:180000,onStart:()=>{},onFrameUpdate:n=>{if(n%60===0||n===missing.length)console.log('FRAMES',kind,start,n+'/'+missing.length,new Date().toISOString())}});
   for(const name of fs.readdirSync(batch)){const m=name.match(/^element-(\d+)\.png$/);if(m){const f=Number(m[1]);if(!missing.includes(f))throw Error('Unexpected frame '+f);fs.renameSync(path.join(batch,name),frameFile(f))}}
   fs.rmSync(batch,{recursive:true,force:true});
  }
  for(let f=start;f<=end;f++)if(!validPng(frameFile(f)))throw Error('Incomplete lossless frame '+f);
  const candidate=file+'.in-progress.mp4';
  execFileSync('ffmpeg',['-v','error','-y','-framerate','30','-start_number',String(start),'-i',path.join(framesDir,'%04d.png'),'-frames:v',String(count),'-vf','scale=out_color_matrix=bt709:out_range=tv,format=yuv420p,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv','-c:v','libx264','-crf','16','-preset','medium','-threads','4','-x264-params','colorprim=bt709:transfer=bt709:colormatrix=bt709','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-video_track_timescale','90000',candidate],{stdio:'inherit'});
  if(!validVideo(candidate,count))throw Error('Section encode verification failed '+start);
  fs.renameSync(candidate,file);
  for(let f=start;f<=end;f++)fs.rmSync(frameFile(f),{force:true}); // section verified: drop its PNGs
  rendered++;console.log('SECTION SAVED',kind,start,end,new Date().toISOString());
 }
}finally{await browser.close({silent:true});fs.rmSync(bundleDir,{recursive:true,force:true})}
const state={kind,pipeline,gl,concurrency:1,fingerprint,frames:TOTAL,fps:FPS,width,height,chunkSize:300,renderedThisRun:rendered,pending,stopped,cache};
fs.writeFileSync(path.join(qa,`render-state-${kind}.json`),JSON.stringify(state,null,2)+'\n');
if(pending){console.log(stopped?'STOPPED LOW DISK':'PENDING: resume with the same command.');process.exit(stopped?4:0)}
const concat=path.join(cache,'concat.txt');fs.writeFileSync(concat,chunks.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join('\n')+'\n');
const filename=kind==='portrait'?'OfficeAdmin_AIVA_V5_914PM_Vertical.mp4':'OfficeAdmin_AIVA_V5_914PM_Film.mp4';
const final=path.join(out,filename),candidate=path.join(cache,'delivery-in-progress.mp4');
execFileSync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',concat,'-i',path.resolve('public/audio/v5/master.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t',String(TL.duration),'-movflags','+faststart','-metadata','title=OfficeAdmin with AIVA | 9:14 PM','-metadata','comment=Actual app interface. Fictional business, customer and data. Illustrated story. AIVA is in private preview.',candidate],{stdio:'inherit'});
if(!validVideo(candidate,TOTAL))throw Error('Full film verification failed');
execFileSync('ffmpeg',['-v','error','-i',candidate,'-f','null','-'],{stdio:['ignore','ignore','pipe']});
fs.renameSync(candidate,final);
fs.writeFileSync(path.join(qa,`delivery-${kind}.json`),JSON.stringify({...state,validated:true,filename,bytes:fs.statSync(final).size,sha256:createHash('sha256').update(fs.readFileSync(final)).digest('hex')},null,2)+'\n');
console.log('DELIVERY COMPLETE',final);
