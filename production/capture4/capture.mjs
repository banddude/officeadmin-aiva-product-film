import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const require=createRequire(import.meta.url);
const here=path.dirname(new URL(import.meta.url).pathname),film=path.resolve(here,'../..');
const app=process.env.OFFICEADMIN_SOURCE||'/home/ubuntu/code/officeadmin-books';
const {chromium}=require(require.resolve('@playwright/test',{paths:[app]}));
const server=http.createServer((req,res)=>{
  const p=decodeURIComponent(new URL(req.url,'http://local').pathname);
  let root=app+'/public',relative=p;
  if(p==='/'){root=here;relative='/index.html';}
  else if(['/index.html','/bundle.js','/styles.css','/fixtures.js'].includes(p))root=here;
  else if(p.startsWith('/fonts/'))root=film+'/public';
  const f=path.resolve(root,'.'+relative);
  if(!f.startsWith(path.resolve(root)+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}
  const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'}[path.extname(f)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':type});fs.createReadStream(f).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CAPTURE_BROWSER||'/home/ubuntu/.agent-browser/chrome-current',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const outcomes=[];
const variants={
  'dashboard-financial':{base:'dashboard',scroll:540,only:'desktop'},
  'invoice-paid':{base:'invoice',scroll:590,only:'mobile'},
  'aiva-context':{base:'aiva-context'},
};
const screens=process.argv[2]?process.argv[2].split(','):['projects','estimate','invoice','dashboard','schedule','aiva','aiva-context','dashboard-financial','invoice-paid'];
try {
  for(const screen of screens)for(const mobile of [false,true]){
    const config=variants[screen]||{base:screen};
    if((mobile&&screen==='dashboard')||(mobile&&config.only==='desktop')||(!mobile&&config.only==='mobile'))continue;
    const name=`${mobile?'mobile':'desktop'}-${screen}`,width=mobile?402:1440,height=mobile?790:980,scale=mobile?3:2;
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:scale,isMobile:mobile,hasTouch:mobile,timezoneId:'America/Los_Angeles',colorScheme:'light'});
    const errors=[],blocked=[];
    page.on('pageerror',e=>errors.push(e.stack||e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(origin+'/')||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();blocked.push(u);return r.abort();});
    await page.goto(`${origin}/?screen=${config.base}`,{waitUntil:'networkidle',timeout:90000});
    await page.waitForTimeout(2500);await page.evaluate(()=>document.fonts.ready);
    if(config.scroll){await page.mouse.move(mobile?250:1080,500);await page.mouse.wheel(0,config.scroll);await page.waitForTimeout(700);}
    const text=await page.locator('body').innerText();
    const mutationAttempts=await page.evaluate(()=>window.__filmMutationAttempts);
    const scroll=await page.evaluate(()=>({window:window.scrollY,elements:Array.from(document.querySelectorAll('*')).filter(x=>x.scrollTop>0).map(x=>({tag:x.tagName,top:x.scrollTop}))}));
    const file=`public/ui-v4/${name}.png`;await page.screenshot({path:path.join(film,file)});
    const result={name,file,viewport:[width,height],pixels:[width*scale,height*scale],errors,blocked,mutationAttempts,interaction:config.scroll?{type:'read-only wheel scroll',deltaY:config.scroll,scroll}:null,headings:await page.locator('h1,h2').allTextContents(),topbar:await page.locator('[data-app-topbar]').count(),text,sha256:createHash('sha256').update(fs.readFileSync(path.join(film,file))).digest('hex')};
    outcomes.push(result);console.log(JSON.stringify({name,errors,blocked,mutationAttempts,scroll,headings:result.headings},null,2));await page.close();
  }
}finally{await browser.close();server.close();}
const manifestPath=film+'/qa/v4/capture4-results.json';
const previous=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')).screenshots:[];
const merged=new Map(previous.map(s=>[s.name,s]));for(const s of outcomes)merged.set(s.name,s);
const manifest={...JSON.parse(fs.readFileSync(here+'/isolation-manifest.json','utf8')),screenshots:[...merged.values()].sort((a,b)=>a.name.localeCompare(b.name)),liveRecording:false,fictionalDemoData:true,realCustomerData:false,aivaAvailability:'Private preview',captureDate:'2026-10-14',network:'Loopback static assets only; API reads resolved in memory, all business mutations rejected'};
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
if(outcomes.some(o=>o.errors.length||o.blocked.length||o.mutationAttempts.length||o.topbar!==1||o.text.length<80))process.exitCode=1;
