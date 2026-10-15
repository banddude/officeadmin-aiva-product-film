import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,openBrowser} from '@remotion/renderer';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const browserExecutable=process.env.REMOTION_BROWSER || (existsSync('/snap/bin/chromium')?'/snap/bin/chromium':undefined);
const target=path.resolve('out');mkdirSync(target,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.tsx'),outDir:path.resolve('build-final')});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions:{gl:'angle'}});
const composition=await selectComposition({serveUrl,id:'VisualReview',puppeteerInstance:browser});
const chunks=[];const chunkSize=840;const concurrency=Number(process.env.REMOTION_CONCURRENCY || 2);
for(let from=0;from<composition.durationInFrames;from+=chunkSize){
 const to=Math.min(from+chunkSize-1,composition.durationInFrames-1);
 const file=path.join(target,`part-${from}.mp4`);chunks.push(file);
 let complete=false;
 if(existsSync(file)){try{const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_format','-of','json',file],{encoding:'utf8'}));complete=Math.abs(Number(probe.format.duration)-(to-from+1)/composition.fps)<.05;}catch{}}
 if(complete){console.log(`KEEP ${from}-${to}`,new Date().toISOString());continue;}
 console.log(`RENDER ${from}-${to}`,new Date().toISOString());let prev=-1;
 await renderMedia({composition,serveUrl,codec:'h264',outputLocation:file,frameRange:[from,to],concurrency,crf:18,x264Preset:'fast',pixelFormat:'yuv420p',puppeteerInstance:browser,imageFormat:'jpeg',jpegQuality:93,muted:true,onProgress:p=>{const step=Math.floor(p.progress*10);if(step!==prev){prev=step;console.log(`CHUNK ${from} ${step*10}%`,new Date().toISOString());}}});
 console.log('SAVED',file);
}
await browser.close({silent:true});
writeFileSync(path.join(target,'concat.txt'),chunks.map(f=>`file '${f.replaceAll("'","'\\''")}'`).join('\n'));
const movie=path.join(target,'officeadmin-aiva-film.mp4');
execFileSync('ffmpeg',['-hide_banner','-y','-f','concat','-safe','0','-i',path.join(target,'concat.txt'),'-i',path.resolve('public/audio/master.wav'),'-map','0:v:0','-map','1:a:0','-vf','scale=in_range=full:out_range=limited:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-crf','17','-preset','fast','-threads','2','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-video_track_timescale','90000','-c:a','aac','-b:a','256k','-ar','48000','-movflags','+faststart','-t','112',movie],{stdio:'inherit'});
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',movie],{encoding:'utf8'}));
writeFileSync(path.resolve('qa/final-media-probe.json'),JSON.stringify(probe,null,2));
console.log('FILM COMPLETE',movie,new Date().toISOString());
