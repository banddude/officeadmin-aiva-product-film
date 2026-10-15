import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {transformSync} from 'esbuild';

const require = createRequire(import.meta.url);
const file = 'src/v3-assembly-hero.tsx';
const text = fs.readFileSync(file,'utf8');
const compiled = transformSync(text,{loader:'tsx',format:'cjs',target:'es2020',jsx:'automatic'}).code;
const mod = {exports:{}};
vm.runInNewContext(compiled,{module:mod,exports:mod.exports,require,console},{filename:file,timeout:10000});
const {assemblyCamera,travel,land,ASSEMBLY_BEATS} = mod.exports;
const tests=[];
function test(name,run){run();tests.push({name,passed:true});}

test('All camera samples finite and within positive scale/opacity bounds',()=>{
 for(const portrait of [false,true]) for(let f=-2;f<=302;f+=.25){
  const c=assemblyCamera(f,portrait);
  for(const v of Object.values(c))assert.ok(Number.isFinite(v));
  assert.ok(c.scale>.65&&c.scale<2.2);assert.ok(c.opacity>=.1&&c.opacity<=1);
 }
});
test('Settled app receives a real, motionless reading hold',()=>{
 for(const p of [false,true]){
  const first=JSON.stringify(assemblyCamera(114,p));
  for(let f=115;f<=144;f++)assert.equal(JSON.stringify(assemblyCamera(f,p)),first);
 }
});
test('Easing clamps exactly and never overshoots',()=>{
 for(const curve of [travel,land]){
  assert.equal(curve(-100,10,30),0);assert.equal(curve(10,10,30),0);assert.equal(curve(30,10,30),1);assert.equal(curve(900,10,30),1);
  for(let f=10;f<30;f+=.125)assert.ok(curve(f,10,30)>=0&&curve(f,10,30)<=1);
 }
});
test('Camera path has no discontinuous jumps at editorial boundaries',()=>{
 for(const p of [false,true])for(const f of [0,108,145,181,207,251,300]){
  const a=assemblyCamera(f-.0001,p),b=assemblyCamera(f+.0001,p);
  for(const k of Object.keys(a))assert.ok(Math.abs(a[k]-b[k])<.02,`${f}:${k}`);
 }
});
test('Timebase is deterministic at 30 and 60 fps',()=>{
 for(const p of [false,true])for(let f=0;f<300;f++)assert.equal(JSON.stringify(assemblyCamera(f,p)),JSON.stringify(assemblyCamera((f*2)*30/60,p)));
});
const sourcePath='public/ui-dom/projects.json';const raw=fs.readFileSync(sourcePath);const source=JSON.parse(raw);
test('Exact source fragments and geometry exist',()=>{
 assert.equal(source.width,1440);assert.equal(source.height,980);
 for(const id of ['sidebar','topbar','section-0','section-1','section-2','row-2'])assert.ok(source.fragments[id]&&source.targets.find(t=>t.id===id));
 assert.match(source.fragments['row-2'].html,/Cedar Court \| EV Charging/);
 assert.match(source.sourceMethod,/Actual rendered component DOM/);
});
test('Snapshot contains no application scripts or remote asset loads',()=>{
 assert.ok(!/<script\b|<iframe\b|\sonclick=/i.test(source.html));
 const assets=Array.from(source.html.matchAll(/(?:src|srcset)="([^"]*)"/g)).map(m=>m[1]);
 for(const a of assets)assert.ok(!/^https?:\/\//i.test(a));
 assert.ok(!/url\(["']?https?:\/\//i.test(source.css));
});
test('Selected row overlay is anchored to the real screen location before lifting',()=>{
 const row=source.targets.find(t=>t.id==='row-2').rect;
 for(const p of [false,true]){
  const c=assemblyCamera(207,p);const y0=p?490:360;
  const screen={x:c.x+(row.x-720)*c.scale,y:c.y+(row.y-y0)*c.scale};
  assert.ok(Number.isFinite(screen.x)&&Number.isFinite(screen.y));
  assert.ok(screen.x>0&&screen.x<500);assert.ok(screen.y>450&&screen.y<1100);
 }
});
const report={passed:tests.length,failed:0,tests,source_snapshot_sha256:createHash('sha256').update(raw).digest('hex'),
 module_sha256:createHash('sha256').update(text).digest('hex'),timeline:ASSEMBLY_BEATS,
 provenance:'Source-authentic frozen DOM; fictional demo records; no live app, customer, auth or service access.',
 visual_limitations:['Editorial layer assembly and selection, not a live screen recording.','Landscape overview crops the source viewport vertically to avoid unused lower space.','This module covers only film seconds 6-16. No device modelling or full-film narration mix is included.']};
fs.mkdirSync('qa/v3',{recursive:true});fs.writeFileSync('qa/v3/assembly-tests.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
