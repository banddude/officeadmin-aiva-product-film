// Export the actual application's rendered vector DOM, not a screenshot or app bundle.
// Runs against the existing isolated fictional-data capture harness only.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const film=process.cwd(),app=process.env.OFFICEADMIN_SOURCE||'/home/ubuntu/code/officeadmin-books';
const require=createRequire(import.meta.url),{chromium}=require(require.resolve('@playwright/test',{paths:[app]}));
fs.mkdirSync('public/ui-dom',{recursive:true});fs.mkdirSync('qa/v3',{recursive:true});
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://local').pathname);let root=app+'/public',rel=p;if(p==='/'){root=film+'/production/capture2';rel='/index.html';}else if(['/index.html','/bundle.js','/styles.css','/fixtures.js'].includes(p))root=film+'/production/capture2';else if(p.startsWith('/fonts/'))root=film+'/public';const f=path.resolve(root,'.'+rel);if(!f.startsWith(root+'/')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:'/home/ubuntu/.agent-browser/chrome-current',headless:true,args:['--no-sandbox']});
const manifest=[];
try{for(const spec of (process.argv[2]||'projects,estimate,invoice,dashboard,aiva,mobile-projects,mobile-estimate,mobile-invoice,mobile-aiva').split(',')){
 const mobile=spec.startsWith('mobile-'),screen=spec.replace('mobile-',''),width=mobile?402:1440,height=mobile?790:980;
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,colorScheme:'light',timezoneId:'America/Los_Angeles'}),errors=[],blocked=[];
 page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(origin+'/')||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();blocked.push(u);return r.abort();});
 await page.goto(`${origin}/?screen=${screen}`,{waitUntil:'networkidle'});await page.waitForTimeout(1600);await page.evaluate(()=>document.fonts.ready);
 if(screen==='dashboard'){
  // Allow the source chart's own animation clock to finish while it is visible.
  // The fixture calendar date stays fixed; no business data is changed.
  await page.evaluate(()=>{const base=Date.now(),begin=performance.now();Date.now=()=>base+performance.now()-begin;});
  await page.mouse.move(1080,650);await page.mouse.wheel(0,950);await page.waitForTimeout(2400);
  await page.mouse.wheel(0,-4000);await page.waitForTimeout(400);
 }

 const snapshot=await page.evaluate(({screen,width,height})=>{
  const targets=[],used=new Set();
  function mark(el,id,kind){if(!el||used.has(el))return;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;el.setAttribute('data-motion',id);used.add(el);targets.push({id,kind,rect:{x:r.x,y:r.y,width:r.width,height:r.height},text:el.textContent||''});}
  const side=document.querySelector('[data-sidebar="sidebar"]');mark(side,'sidebar','shell');
  mark(document.querySelector('[data-app-topbar]'),'topbar','shell');
  Array.from(document.querySelectorAll('[data-sidebar="sidebar"] a')).forEach((el,i)=>mark(el,`nav-${i}`,'nav'));
  Array.from(document.querySelectorAll('main h1,main h2,main thead')).forEach((el,i)=>mark(el,`heading-${i}`,'heading'));
  Array.from(document.querySelectorAll('main tbody tr')).forEach((el,i)=>mark(el,`row-${i}`,'row'));
  Array.from(document.querySelectorAll('main [data-slot="badge"]')).forEach((el,i)=>mark(el,`badge-${i}`,'badge'));
  Array.from(document.querySelectorAll('main button')).filter(el=>/Convert to Invoice|New Project|Send|View/.test(el.textContent||'')).forEach((el,i)=>mark(el,`button-${i}`,'button'));
  const headings=Array.from(document.querySelectorAll('h3'));
  if(screen==='dashboard'){
   for(const [i,h] of headings.entries()){if(/Revenue vs Expenses|Aging Summary|Cash Flow Forecast/.test(h.textContent||'')){let el=h.parentElement;while(el&&parseFloat(getComputedStyle(el).borderTopLeftRadius)===0)el=el.parentElement;mark(el,`chart-${i}`,'chart');}}
   Array.from(document.querySelectorAll('main p')).filter(el=>/^(Revenue|Expenses|Net Income|Receivables|Payables)$/i.test(el.textContent||'')).forEach((el,i)=>{let p=el.parentElement;while(p&&parseFloat(getComputedStyle(p).borderTopLeftRadius)===0)p=p.parentElement;mark(p,`metric-${i}`,'metric')});
  }
  Array.from(document.querySelectorAll('main h2')).filter(el=>el.parentElement?.classList.contains('space-y-2')).forEach((el,i)=>mark(el.parentElement,`section-${i}`,'section'));
  const exact=(text)=>Array.from(document.querySelectorAll('main *')).find(el=>el.children.length===0&&(el.textContent||'')===text);
  const totalLabel=exact('Total');if(totalLabel)mark(totalLabel.parentElement.parentElement,'total','total');
  const note=Array.from(document.querySelectorAll('main span')).find(el=>(el.textContent||'').startsWith('Accepted and signed by'));if(note)mark(note.parentElement,'acceptance','acceptance');
  const payment=Array.from(document.querySelectorAll('main *')).find(el=>el.children.length===0&&/^(payment status)$/i.test(el.textContent||''));
  if(payment){let p=payment.parentElement;while(p&&parseFloat(getComputedStyle(p).borderTopLeftRadius)===0)p=p.parentElement;mark(p,'payment','payment')}
  const bubbles=Array.from(document.querySelectorAll('[class*="ios-tail-"]'));
  bubbles.forEach((el,i)=>{mark(el,`message-${i}`,'message');mark(el.parentElement.parentElement,`message-wrap-${i}`,'message-wrap')});
  if(document.querySelector('textarea')){let p=document.querySelector('textarea').parentElement;while(p){const r=p.getBoundingClientRect();if(r.width<460&&r.height>650){mark(p,'chat-shell','chat');break;}p=p.parentElement;}}
  mark(document.querySelector('textarea'),'composer','composer');
  if(document.querySelector('textarea'))mark(document.querySelector('textarea').closest('form')||document.querySelector('textarea').parentElement.parentElement,'composer-bar','composer-bar');
  Array.from(document.querySelectorAll('main *')).filter(el=>el.children.length===0&&/^\$[\d,]+(?:\.\d{2})?$/.test(el.textContent||'')).forEach((el,i)=>mark(el,`number-${i}`,'number'));
  Array.from(document.querySelectorAll('main svg path.recharts-curve,main svg path.recharts-area-area')).forEach((el,i)=>mark(el,`plot-${i}`,'plot'));
  Array.from(document.querySelectorAll('main div')).filter(el=>el.className&&typeof el.className==='string'&&/h-1\.5|h-2|h-2\.5/.test(el.className)&&getComputedStyle(el).backgroundColor!=='rgba(0, 0, 0, 0)').forEach((el,i)=>mark(el,`bar-${i}`,'bar'));
  // Export only the rendered DOM. Strip links, handlers, application data, scripts.
  const css=[],styleIndex=new Map();let index=0;
  const exclude=/^(animation|transition|cursor|caret-color|scrollbar|overscroll|scroll-snap|scroll-behavior|view-timeline|animation-timeline|timeline-scope)/;
  function rules(el,pseudo=''){
   const computed=getComputedStyle(el,pseudo||null);if(pseudo&&(computed.content==='none'||computed.content==='normal'))return null;
   const pairs=[];
   for(const prop of computed){if(prop.startsWith('--')||exclude.test(prop))continue;let val=computed.getPropertyValue(prop);if(prop==='font-family')val=val.replaceAll('CaptureInter','FilmInter');if(prop==='content'&&!pseudo)continue;if(val)pairs.push(prop+':'+val);}
   if(!pseudo&&computed.display.includes('flex')&&computed.flexWrap==='wrap'){const rows=Array.from(el.children).map(c=>c.getBoundingClientRect()).filter(r=>r.width&&r.height).map(r=>r.y+r.height/2);if(rows.length>1&&Math.max(...rows)-Math.min(...rows)<2)pairs.push('flex-wrap:nowrap');}
   const body=pairs.join(';');let id=styleIndex.get(body);if(!id){id='d'+index++;styleIndex.set(body,id);css.push('.'+id+(pseudo||'')+'{'+body+'}');}return id;
  }
  function clone(el){
   if(['SCRIPT','STYLE','LINK','NOSCRIPT','META'].includes(el.tagName))return null;
   const isSvg=el.namespaceURI==='http://www.w3.org/2000/svg';let out=isSvg?document.createElementNS(el.namespaceURI,el.tagName):document.createElement(el.tagName.toLowerCase()==='body'?'div':el.tagName.toLowerCase());
   const styleClass=rules(el);out.setAttribute('class',styleClass);
   for(const a of el.attributes){if(/^(d|viewBox|width|height|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|points|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|stroke-dashoffset|transform|xmlns|preserveAspectRatio|pathLength|clip-path|mask|id|offset|stop-color|stop-opacity|type|placeholder|rows|cols|data-motion|data-film-word)$/i.test(a.name))out.setAttribute(a.name,a.value);}
   if(el.tagName==='IMG'){out.setAttribute('src',el.currentSrc||el.src);out.setAttribute('alt',el.alt||'');}
   if(el.tagName==='INPUT')out.setAttribute('value',el.value);
   for(const pseudo of ['::before','::after']){const s=rules(el,pseudo);if(s&&s!==styleClass){const rule=css.find(x=>x.startsWith('.'+s+pseudo+'{'));if(rule)css.push(rule.replace('.'+s+pseudo,'.'+styleClass+pseudo));}}
   for(const child of el.childNodes){if(child.nodeType===3)out.appendChild(document.createTextNode(child.textContent));else if(child.nodeType===1){const c=clone(child);if(c)out.appendChild(c);}}
   if(el.scrollTop||el.scrollLeft){out.setAttribute('data-scroll-y',String(el.scrollTop));out.setAttribute('data-scroll-x',String(el.scrollLeft));}
   return out;
  }
  // Split the actual message text into independently revealable word spans.
  for(const bubble of bubbles){let n=0;const walker=document.createTreeWalker(bubble,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const frag=document.createDocumentFragment();for(const part of node.textContent.split(/(\s+)/)){if(!part)continue;if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));}else{const span=document.createElement('span');span.dataset.filmWord=String(n++);span.textContent=part;frag.appendChild(span);}}node.replaceWith(frag);}}
  const original=document.body;const root=clone(original);root.setAttribute('data-ui-root','');
  const fragments={};
  for(const t of targets){if(!['row','metric','chart','message','shell','badge','section','total','acceptance','payment','chat','composer-bar'].includes(t.kind))continue;const el=root.querySelector(`[data-motion="${t.id}"]`);if(!el)continue;let html=el.outerHTML;let wrapper='div';if(el.tagName==='TR')html='<table style="width:'+t.rect.width+'px;border-collapse:collapse;table-layout:fixed"><tbody>'+html+'</tbody></table>';else if(el.tagName==='THEAD')html='<table style="width:'+t.rect.width+'px;border-collapse:collapse">'+html+'</table>';fragments[t.id]={html,width:t.rect.width,height:t.rect.height};}
  return {width,height,screen,html:root.outerHTML,css:css.join('\n'),targets,fragments,mutations:window.__filmMutationAttempts,sourceMethod:'Actual rendered component DOM and computed visual styles. No application JavaScript.'};
 },{screen,width,height});
 function asset(url){if(url.startsWith('data:'))return url;const u=new URL(url,origin),p=decodeURIComponent(u.pathname);const full=path.resolve(app+'/public','.'+p);if(!full.startsWith(app+'/public/')||!fs.existsSync(full))throw Error('Unresolved UI asset '+p);const mime=({'.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.ico':'image/x-icon'})[path.extname(full)];if(!mime)throw Error('Unapproved embedded asset '+p);return 'data:'+mime+';base64,'+fs.readFileSync(full).toString('base64');}
 // Embedded PNG/SVG product assets only. Never embed fonts or runtime code.
 let text=JSON.stringify(snapshot);text=text.replace(/https?:[^\s"<>\\]*?\/[^\s"<>\\]*/g,m=>m.startsWith(origin)?asset(m):m);
 const out=JSON.parse(text);fs.writeFileSync(`public/ui-dom/${spec}.json`,JSON.stringify(out));
 const file=`public/ui-dom/${spec}.json`;const entry={name:spec,sourceRevision:'e31b3829ca4a956056ca1045c3de56387f396a13',file,bytes:fs.statSync(file).size,sha256:createHash('sha256').update(fs.readFileSync(file)).digest('hex'),targets:out.targets.map(t=>({id:t.id,kind:t.kind,rect:t.rect})),errors,blocked,mutations:out.mutations};manifest.push(entry);
 await page.screenshot({path:`qa/v3/source-${spec}.png`});console.log(spec,entry.bytes,'bytes',out.targets.length,'motion targets',errors,blocked);
 await page.close();
}}finally{await browser.close();server.close()}
fs.writeFileSync('qa/v3/dom-export.json',JSON.stringify({fictionalData:true,noAppRuntime:true,exports:manifest},null,2));
if(manifest.some(x=>x.errors.length||x.blocked.length||x.mutations.length))throw Error('Capture isolation error');
