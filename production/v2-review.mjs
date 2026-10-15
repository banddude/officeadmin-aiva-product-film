import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';import path from 'node:path';
const kinds=process.argv.includes('portrait')?['portrait']:process.argv.includes('landscape')?['landscape']:['landscape','portrait'];
const selected=process.argv.find(a=>a.startsWith('--frames='));const frames=selected?selected.split('=')[1].split(',').map(Number):[75,300,555,840,1140,1395,1635,1845,2100,2340,2565,2775];
const serveUrl=await bundle({entryPoint:path.resolve('src/v2-index.tsx'),outDir:path.resolve('build-v2-review')});
const browser=await openBrowser('chrome',{browserExecutable:process.env.REMOTION_BROWSER||(existsSync('/snap/bin/chromium')?'/snap/bin/chromium':undefined),chromiumOptions:{gl:'angle'}});
const out=path.resolve('qa/v2');mkdirSync(out,{recursive:true});const results=[];
try{for(const kind of kinds){const composition=await selectComposition({serveUrl,id:kind==='portrait'?'V2PortraitVisuals':'V2LandscapeVisuals',puppeteerInstance:browser});for(const frame of frames){const file=path.join(out,`${kind}-${String(frame).padStart(4,'0')}.png`);await renderStill({composition,serveUrl,frame,output:file,puppeteerInstance:browser,imageFormat:'png'});console.log('STILL',kind,frame);results.push({kind,frame,file});}}}finally{await browser.close({silent:true});}
writeFileSync(path.join(out,'review-stills.json'),JSON.stringify(results,null,2)+'\n');
