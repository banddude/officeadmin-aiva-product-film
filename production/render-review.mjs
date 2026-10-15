import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,openBrowser} from '@remotion/renderer';
import fs from 'node:fs';
const serveUrl=await bundle({entryPoint:'src/index.tsx',outDir:process.cwd()+'/build'});
const browser=await openBrowser('chrome',{browserExecutable:'/snap/bin/chromium',chromiumOptions:{gl:'angle'}});
const composition=await selectComposition({serveUrl,id:'VisualReview',puppeteerInstance:browser});
for(const frame of [403,1090,1177,1250,1408,1504,1761,2620]){
 await renderStill({composition,serveUrl,output:`qa/frame-${String(frame).padStart(4,'0')}.png`,frame,puppeteerInstance:browser,imageFormat:'png'});console.log('frame',frame);
}
await browser.close({silent:true});
