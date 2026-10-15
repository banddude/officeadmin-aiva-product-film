import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
const film=process.cwd(),app='/home/ubuntu/code/officeadmin-books';
const require=createRequire(import.meta.url);const {chromium}=require(require.resolve('@playwright/test',{paths:[app]}));
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://local').pathname);let root=app+'/public',rel=p;if(p==='/'){root=film+'/production/capture2';rel='/index.html';}else if(['/index.html','/bundle.js','/styles.css','/fixtures.js'].includes(p))root=film+'/production/capture2';else if(p.startsWith('/fonts/'))root=film+'/public';const f=path.resolve(root,'.'+rel);if(!f.startsWith(root+'/')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/home/ubuntu/.agent-browser/chrome-current',headless:true,args:['--no-sandbox']});
try{for(const screen of ['projects','estimate','invoice','dashboard','aiva']){
 const page=await browser.newPage({viewport:{width:1440,height:980},deviceScaleFactor:1});await page.route('**/*',r=>r.request().url().startsWith(origin+'/')||r.request().url().startsWith('data:')?r.continue():r.abort());
 await page.goto(`${origin}/?screen=${screen}`,{waitUntil:'networkidle'});await page.waitForTimeout(1400);await page.evaluate(()=>document.fonts.ready);
 const elements=await page.evaluate(()=>Array.from(document.querySelectorAll('body *')).flatMap(el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);if(r.width<30||r.height<14||r.top>1300||cs.display==='none')return[];if(!(el.matches('tr,thead,tbody,h1,h2,h3,textarea,input,[data-sidebar],[data-app-topbar],[data-slot="card"],[data-slot="card-content"],[data-message-id]')||el.children.length===0||el.getAttribute('role')==='row'))return[];return[{tag:el.tagName,slot:el.getAttribute('data-slot'),side:el.getAttribute('data-sidebar'),cls:el.className?.baseVal??el.className,rect:[r.x,r.y,r.width,r.height].map(v=>Math.round(v)),text:(el.textContent||'').slice(0,180),parent:el.parentElement?.className?.baseVal??el.parentElement?.className}]}));
 fs.writeFileSync(`qa/v3/dom-${screen}.json`,JSON.stringify(elements,null,2));console.log(screen,JSON.stringify(elements));await page.close();
}}finally{await browser.close();server.close()}
