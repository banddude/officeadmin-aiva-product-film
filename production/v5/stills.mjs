// Render V5 style-frame stills on the laptop (single tab). Usage: node production/v5/stills.mjs hook aiva end
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
import fs from 'node:fs';import path from 'node:path';
const shots=process.argv.slice(2);if(!shots.length)throw Error('Name at least one shot');
const browserExecutable=process.env.REMOTION_BROWSER||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':'/snap/bin/chromium');
const outDir=path.resolve('out/v5/stills');fs.mkdirSync(outDir,{recursive:true});
const bundleDir=fs.mkdtempSync(path.resolve('build-v5-stills-'));
const serveUrl=await bundle({entryPoint:path.resolve('src/v5/index.tsx'),outDir:bundleDir,enableCaching:false});
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions:{gl:'swangle'}});
try{
 for(const shot of shots){
  const film=shot.match(/^(v?)film:(\d+)$/);
  const id=film?(film[1]?'V5VerticalVisuals':'V5Visuals'):'V5Still',name=shot.replace(/^v:/,''),props=film?{vertical:!!film[1]}:{shot:name};
  const composition=await selectComposition({serveUrl,id,inputProps:props,puppeteerInstance:browser});
  const output=path.join(outDir,`${shot.replace(':','-')}.png`);
  await renderStill({composition,serveUrl,output,inputProps:props,frame:film?Number(film[2]):0,puppeteerInstance:browser,imageFormat:'png',overwrite:true,timeoutInMilliseconds:180000});
  console.log('STILL',output,fs.statSync(output).size);
 }
}finally{await browser.close({silent:true});fs.rmSync(bundleDir,{recursive:true,force:true})}
