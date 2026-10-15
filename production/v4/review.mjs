import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
fs.mkdirSync('qa/v4',{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/v4-index.tsx'),outDir:path.resolve('build-v4-review-'+Date.now())});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER||'/snap/bin/chromium',chromiumOptions:{gl:'angle'}});
const frames=(process.argv[2]||'45,115,205,330,455,600,760,920,1100,1280,1450,1620,1850,1980,2160,2340,2520,2640').split(',').map(Number);
const kinds=process.argv.includes('--landscape')?['landscape']:process.argv.includes('--portrait')?['portrait']:['landscape','portrait'];
try{
 for(const kind of kinds){
  const composition=await selectComposition({serveUrl,id:kind==='portrait'?'V4VerticalVisuals':'V4Visuals',puppeteerInstance:browser});
  for(const frame of frames){
   const file=`qa/v4/${kind}-${String(frame).padStart(4,'0')}.png`;
   await renderStill({serveUrl,composition,frame,output:file,puppeteerInstance:browser,imageFormat:'png',timeoutInMilliseconds:90000});
   console.log('STILL',kind,frame);
  }
 }
}finally{await browser.close({silent:true})}
