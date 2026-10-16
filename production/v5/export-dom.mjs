// V5: export the actual application's rendered vector DOM, not a screenshot or app bundle.
// Runs against the isolated fictional-data capture harness in production/capture5 only.
// Usage: node production/capture5/build.mjs && node production/v5/export-dom.mjs [spec,spec,...]
// A spec is a screen name (desktop 1440x980) or mobile-<screen> (402x790).
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const here=path.dirname(new URL(import.meta.url).pathname),film=path.resolve(here,'../..'),capture=film+'/production/capture5';
const app=process.env.OFFICEADMIN_SOURCE||'/home/ubuntu/code/officeadmin-books';
const require=createRequire(import.meta.url),{chromium}=require(require.resolve('@playwright/test',{paths:[app]}));
const OUT='public/ui-dom-v5',QA='qa/v5';
for(const d of [OUT,QA,QA+'/proof'])fs.mkdirSync(path.join(film,d),{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://local').pathname);let root=app+'/public',rel=p;if(p==='/'){root=capture;rel='/index.html';}else if(['/index.html','/bundle.js','/styles.css','/fixtures.js','/story.js'].includes(p))root=capture;else if(p.startsWith('/fonts/')||p.startsWith('/ui-v5/'))root=film+'/public';const f=path.resolve(root,'.'+rel);if(!f.startsWith(root+'/')||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({executablePath:process.env.CAPTURE_BROWSER||'/home/ubuntu/.agent-browser/chrome-current',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim();

// Read-only UI interactions performed before a snapshot (open a sheet, nothing that writes).
const actions={
 'daily-report':async page=>{const card=page.locator('main button',{hasText:/Demo complete/}).first();if(await card.count())await card.click();else await page.locator('main [role="button"],main article').first().click();await page.waitForSelector('[data-slot="sheet-content"]');await page.waitForTimeout(1800);},
 'bank-feed':async page=>{for(const b of await page.locator('main button',{hasText:'Matched to Stripe payout'}).all())await b.click();await page.evaluate(()=>{document.querySelector('main').scrollTop=0});await page.waitForTimeout(500);},
};
// Draft review: real clicks through the actual DraftApprovals -> DraftReview -> DraftEditor flow.
const openReview=async page=>{await page.locator('main section button',{hasText:'Jen'}).first().click();await page.waitForSelector('#review-body');await page.waitForTimeout(900);};
const openConfirm=async page=>{await openReview(page);await page.getByRole('button',{name:/^Queue for delivery/}).click();await page.waitForSelector('[aria-label="Confirm decision"]');await page.waitForTimeout(400);};
const showConfirm=async page=>{await openConfirm(page);await page.evaluate(()=>document.querySelector('[aria-label="Confirm decision"]').scrollIntoView({block:'end'}));await page.waitForTimeout(300);};
const showNotice=async page=>{await queue(page);await page.evaluate(()=>Array.from(document.querySelectorAll('[role="status"]')).find(e=>/^Queued for delivery/.test(e.textContent||'')).scrollIntoView({block:'center'}));await page.waitForTimeout(300);};
const queue=async page=>{await openConfirm(page);await page.getByRole('button',{name:'Confirm queue for delivery'}).click();await page.waitForSelector('[role="status"]:has-text("Queued for delivery")');await page.waitForTimeout(500);};
for(const k of ['reply','catch'])Object.assign(actions,{[`draft-${k}-review`]:openReview,[`draft-${k}-confirm`]:showConfirm,[`draft-${k}-queued`]:showNotice});
Object.assign(actions,{
 'takeoff-estimate-preview':async page=>{await page.locator('button[aria-label^="Preview and edit estimate"]').first().click();await page.waitForSelector('[data-slot="sheet-content"]');await page.waitForTimeout(1800);},
});
const PHASE2=['invoice-deposit-paid','estimate-signed-deposit-paid','invoice-final-paid','invoice-co-paid','schedule-week','punch-list','daily-report','job-costing','bank-feed','dashboard','portal-estimate-sent'];const PHASE2_MOBILE_ONLY=['member-today','time-clock','time-clock-in'];
const PHASE1=['draft-reply-review','draft-reply-confirm','draft-reply-queued','draft-catch-review','draft-catch-confirm','draft-catch-queued','estimate-sent','estimate-signed','takeoff-list','takeoff-estimate-preview','draft-approvals-pending','draft-approvals-approved','draft-reply-pending','draft-reply-approved','draft-catch-pending','draft-catch-approved','status-card','change-orders-pending','change-orders-approved','change-orders-invoiced','aiva-chat'];
const arg=process.argv[2]||'phase1';
const specs=arg==='phase1'?PHASE1.flatMap(s=>[s,'mobile-'+s]):arg==='phase2'?[...PHASE2.flatMap(s=>[s,'mobile-'+s]),...PHASE2_MOBILE_ONLY.map(s=>'mobile-'+s)]:arg==='all'?[...PHASE1,...PHASE2].flatMap(s=>[s,'mobile-'+s]).concat(PHASE2_MOBILE_ONLY.map(s=>'mobile-'+s)):arg.split(',');
const manifest=[];
try{for(const spec of specs){
 const mobile=spec.startsWith('mobile-'),screen=spec.replace(/^mobile-/,''),width=mobile?402:1440,height=mobile?790:980;
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,colorScheme:'light',timezoneId:'America/Los_Angeles',locale:'en-US'}),errors=[],blocked=[],consoleErrors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 await page.route('**/*',r=>{const u=r.request().url();if(u.startsWith(origin+'/')||u.startsWith('data:')||u.startsWith('blob:'))return r.continue();blocked.push(u);return r.abort();});
 await page.goto(`${origin}/?screen=${screen}`,{waitUntil:'networkidle'});await page.waitForTimeout(1600);await page.evaluate(()=>document.fonts.ready);
 // Read-only: bring the active project tab into view inside the real scrollable tab strip.
 await page.evaluate(()=>{const nav=Array.from(document.querySelectorAll('main nav')).find(n=>/Overview/.test(n.textContent||''));const a=nav&&Array.from(nav.querySelectorAll('a')).find(x=>/border-foreground/.test(x.className));if(a&&(a.offsetLeft+a.offsetWidth>nav.clientWidth-24))nav.scrollLeft=Math.min(nav.scrollWidth-nav.clientWidth,a.offsetLeft-nav.clientWidth/2+a.offsetWidth/2);});
 if(actions[screen])await actions[screen](page,mobile);
 await page.mouse.move(1,1);

 // Visible-text hygiene. App copy with a spaced em dash is rewritten to a comma; a bare
 // separator node (code, dash, name) becomes a middle dot, as the app uses elsewhere
 // (recorded per snapshot). Data glitches are recorded and fail the run.
 const hygiene=await page.evaluate(()=>{
  const subs=[],glitches=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const n of nodes){const t=n.textContent||'';if(t.includes('\u2014')){const next=/^\s*\u2014\s*$/.test(t)?t.replace('\u2014','\u00b7'):t.replace(/\s+\u2014\s+/g,', ');subs.push({from:t.trim(),to:next.trim()});n.textContent=next;if(next.includes('\u2014'))glitches.push('bare em dash: '+t.trim());}}
  const vis=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'};
  const text=document.body.innerText+'\n'+Array.from(document.querySelectorAll('input,textarea')).map(e=>e.value).join('\n');
  for(const re of [/\bundefined\b/,/\bNaN\b/,/Invalid Date/,/\[object Object\]/])if(re.test(text))glitches.push('text matches '+re);
  // $0.00 is a glitch unless the app is truthfully reporting an empty figure (allowlisted labels).
  const zeroOk=/(\d+-\d+ days|91\+ days|Labor \(time entries\)|Approved Change Orders|Amount due|Due|Balance due|Tax|Unbilled)\s*$/i;const zeros=[];
  for(const m of text.matchAll(/\$0\.00/g)){const before=text.slice(Math.max(0,m.index-60),m.index);zeros.push(before.replace(/\s+/g,' ').trim()+' $0.00');if(!zeroOk.test(before))glitches.push('unexpected $0.00 after: '+before.replace(/\s+/g,' ').trim());}
  const skeletons=Array.from(document.querySelectorAll('[data-slot="skeleton"],.animate-pulse')).filter(vis).length;
  const spinners=Array.from(document.querySelectorAll('.animate-spin')).filter(vis).length;
  const toasts=Array.from(document.querySelectorAll('[data-sonner-toast]')).map(t=>t.textContent);
  return {subs,glitches,skeletons,spinners,toasts,zeros};
 });

 const snapshot=await page.evaluate(({screen,width,height})=>{
  const targets=[],used=new Set();
  function mark(el,id,kind){if(!el||used.has(el)||el.hasAttribute('data-motion'))return;const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;el.setAttribute('data-motion',id);used.add(el);targets.push({id,kind,rect:{x:r.x,y:r.y,width:r.width,height:r.height},text:(el.textContent||'').trim().slice(0,400)});}
  const visible=el=>{if(!el)return false;const r=el.getBoundingClientRect();return r.width>1&&r.height>1&&getComputedStyle(el).visibility!=='hidden'};
  const leaves=(re,scope=document)=>Array.from(scope.querySelectorAll('*')).filter(el=>el.children.length===0&&re.test((el.textContent||'').trim())&&visible(el));
  const leaf=(re,scope)=>leaves(re,scope)[0];
  const card=el=>{let p=el;while(p&&p!==document.body&&!(parseFloat(getComputedStyle(p).borderTopLeftRadius)>0&&getComputedStyle(p).borderTopWidth!=='0px'))p=p.parentElement;return p===document.body?null:p};
  const up=(el,pred)=>{let p=el;while(p&&p!==document.body&&!pred(p))p=p.parentElement;return p===document.body?null:p};
  const buttons=(re,scope=document)=>Array.from(scope.querySelectorAll('button,a')).filter(b=>visible(b)&&re.test(((b.textContent||'')+' '+(b.getAttribute('title')||'')+' '+(b.getAttribute('aria-label')||'')).trim()));
  const mainEl=document.querySelector('main');

  // ---- V5 semantic targets (marked first, so they own their element) ----
  if(screen.startsWith('estimate-')){const pi=leaf(/^INV-01477$/,mainEl);if(pi){const b=pi.parentElement?.querySelector('[data-slot="badge"]');mark(b,'deposit-invoice-status','badge');}
   const header=leaf(/^EST-01231$/);if(header){const row=header.parentElement;mark(row?.querySelector('[data-slot="badge"]'),'status-badge','badge');}
   const table=Array.from(document.querySelectorAll('main table')).find(t=>visible(t)&&/Description/.test(t.querySelector('thead')?.textContent||''));
   if(table){mark(table.querySelector('thead'),'lines-head','heading');Array.from(table.querySelectorAll('tbody tr')).forEach((tr,i)=>mark(tr,`line-${i}`,'line'));}
   else{const list=Array.from(document.querySelectorAll('main ul')).find(u=>visible(u)&&u.querySelectorAll(':scope > li').length>=8);if(list)Array.from(list.children).forEach((li,i)=>mark(li,`line-${i}`,'line'));}
   for(const [re,id] of [[/^Subtotal$/,'subtotal'],[/^Total$/,'total'],[/^Invoiced$/,'invoiced'],[/^Remaining$/,'remaining']]){const l=leaf(re,mainEl);if(l)mark(l.parentElement,id,'total');}
   const totals=leaf(/^Subtotal$/,mainEl);if(totals)mark(totals.parentElement.parentElement,'totals','totals');
   const sig=Array.from(document.querySelectorAll('main span')).find(s=>/^Accepted and signed by/.test(s.textContent||''));if(sig)mark(sig.parentElement,'signature','signature');
   const signedDt=leaf(/^Signed by$/,mainEl);if(signedDt)mark(signedDt.nextElementSibling,'signed-by','signature');
   const inv=leaf(/^INV-01477$/,mainEl);if(inv){mark(inv.closest('button'),'deposit-invoice','deposit');mark(card(inv),'deposit-card','deposit');}
   const bs=leaf(/^Billing schedule$/,mainEl);if(bs)mark(card(bs),'billing-schedule','deposit');
   const details=leaf(/^Details$/,mainEl);if(details)mark(details.parentElement,'details','section');
   const cust=leaf(/^Jen Calder$/,mainEl);if(cust)mark(cust.parentElement,'customer','section');
   for(const [re,id] of [[/^Accept$/,'accept-button'],[/^Decline$/,'decline-button'],[/^Convert to Invoice$/,'convert-button'],[/^Progress bill$/,'progress-button']]){const b=buttons(re,mainEl)[0];mark(b,id,'button');}
  }
  if(screen.startsWith('takeoff-')){
   const ws=leaf(/^Calder Kitchen \| Sheet E-1$/,mainEl);if(ws){const row=up(ws,p=>p.parentElement?.classList.contains('divide-y'));mark(row,'workspace-row','row');}
   mark(buttons(/^Generate estimate$/,mainEl)[0],'generate-button','button');
   mark(buttons(/Preview and edit estimate EST-01231/,mainEl)[0],'workspace-estimate-button','button');
   const estRow=Array.from(document.querySelectorAll('main tr')).find(tr=>/EST-01231/.test(tr.textContent||''));mark(estRow,'estimate-row','row');
   const sheet=document.querySelector('[data-slot="sheet-content"]');
   if(sheet&&visible(sheet)){
    mark(sheet,'estimate-sheet','sheet');
    mark(sheet.querySelector('[data-slot="sheet-header"]'),'sheet-header','heading');
    const rows=Array.from(sheet.querySelectorAll('textarea')).map(t=>up(t,p=>p.parentElement&&p.parentElement.classList.contains('rounded-lg')&&p.parentElement.classList.contains('border')));
    rows.forEach((r,i)=>mark(r,`sheet-line-${i}`,'line'));
    leaves(/^price book budget$/,sheet).forEach((b,i)=>mark(b,`provenance-${i}`,'badge'));
    const tot=Array.from(sheet.querySelectorAll('span')).find(s=>(s.textContent||'').trim()==='Total');if(tot)mark(tot.parentElement,'sheet-total','total');
    mark(buttons(/Open full estimate/,sheet)[0],'open-estimate-button','button');
   }
  }
  if(screen.startsWith('draft-')){
   const list=Array.from(document.querySelectorAll('main section button')).filter(b=>b.querySelector('p'));
   list.forEach((b,i)=>{const key=/deposit/i.test(b.textContent||'')?'catch':'reply';mark(b,`draft-${key}`,'draft');mark(b.querySelector('[data-slot="badge"]'),`draft-${key}-status`,'badge');mark(b.querySelector('p.line-clamp-2'),`draft-${key}-body`,'draft-body');});
   const dlg=document.querySelector('[role="dialog"]');
   if(dlg&&visible(dlg)){const key=/deposit/i.test(dlg.textContent||'')?'catch':'reply';mark(dlg,'review-dialog','dialog');
    mark(dlg.querySelector('#review-body'),'proposed-reply','textarea');mark(dlg.querySelector('#review-body')?.parentElement,'proposed-reply-field','field');
    mark(buttons(/^Queue for delivery/,dlg)[0],'queue-button','button');
    const conf=dlg.querySelector('[aria-label="Confirm decision"]');mark(conf,'confirm-panel','confirm');mark(buttons(/^Confirm queue for delivery$/,dlg)[0],'confirm-button','button');
    mark(Array.from(dlg.querySelectorAll('[role="status"]')).find(e=>/^Queued for delivery/.test(e.textContent||'')),'notice','notice');
    mark(dlg.querySelector('[data-slot="badge"]'),'review-status','badge');
    const dl=dlg.querySelector('dl');mark(dl,'review-meta','section');}
   const h=document.getElementById('draft-approvals-title');if(h)mark(h.parentElement.parentElement,'drafts-header','heading');
  }
  if(screen==='status-card'){
   const next=leaf(/^Next$/,mainEl);const c=next&&card(next);if(c){mark(c,'status-card','status');const ps=Array.from(c.querySelectorAll('p'));mark(ps.find(p=>/^Waiting on/.test(p.textContent||'')),'who-owes-next','status-line');mark(ps.find(p=>/^Needs you/.test(p.textContent||'')),'needs-you','status-line');}
  }
  if(screen.startsWith('change-orders-')){
   const num=leaf(/^CO-001$/,mainEl);
   if(num){const row=up(num,p=>p.parentElement?.classList.contains('divide-y'));mark(row,'co-row','row');
    if(row){for(const b of row.querySelectorAll('[data-slot="badge"]')){const t=(b.textContent||'').trim();mark(b,{Sent:'co-status',Approved:'co-status',Signed:'co-signature','Sig pending':'co-signature',Invoiced:'co-invoiced'}[t]||'co-badge','badge');}
     const amt=leaves(/^\$1,240\.00$/,row)[0];mark(amt,'co-amount','number');
     mark(row.querySelector('button[title="Convert to invoice"]'),'convert-button','button');mark(row.querySelector('button[title="Approve"]'),'approve-button','button');}}
   for(const [re,id] of [[/^Original Contract$/,'contract-original'],[/^Approved Change Orders$/,'contract-change-orders'],[/^Revised Contract Total$/,'contract-revised']]){const l=leaf(re,mainEl);if(l)mark(card(l),id,'metric');}
  }
  if(screen.startsWith('invoice-')){
   const tbl=Array.from(document.querySelectorAll('main table')).find(t=>visible(t)&&/Description/i.test(t.querySelector('thead')?.textContent||''));
   if(tbl)Array.from(tbl.querySelectorAll('tbody tr')).forEach((tr,i)=>mark(tr,`line-${i}`,'line'));else{const list=Array.from(document.querySelectorAll('main ul')).find(u=>visible(u)&&u.children.length>=1&&/\$/.test(u.textContent||''));if(list)Array.from(list.children).forEach((li,i)=>mark(li,`line-${i}`,'line'));}
   const num=leaf(/^INV-014\d\d$/,mainEl);if(num)mark(num.parentElement?.querySelector('[data-slot="badge"]')||leaf(/^paid$/i,mainEl),'status-badge','badge');
   const ps=leaf(/^payment status$/i,mainEl);if(ps)mark(card(ps),'payment','payment');
   const ph=leaf(/^payment history$/i,mainEl);if(ph)mark(card(ph),'payment-history','payment');
   for(const [re,id] of [[/^Subtotal$/,'subtotal'],[/^Total$/,'total']]){const l=leaf(re,mainEl);if(l)mark(l.parentElement,id,'total');}
  }
  if(screen==='schedule-week'){
   let n=0;for(const leafEl of leaves(/Calder Kitchen \| Remodel|Brightwater Cafe \| Lighting|Okafor Garage \| 100A/,mainEl)){let c=leafEl;while(c.parentElement){const r=c.getBoundingClientRect(),pr=c.parentElement.getBoundingClientRect();if(r.height>40&&parseFloat(getComputedStyle(c).borderTopLeftRadius)>0)break;if(pr.height>220||pr.width>520)break;c=c.parentElement;}const cal=/Calder/.test(leafEl.textContent||'');mark(c,`${cal?'calder-':''}shift-${n++}`,'shift');}
   leaves(/^(Ray Ochoa|Sam Lin)$/,mainEl).forEach((el,i)=>mark(el,`crew-${i}`,'crew'));
  }
  if(screen==='member-today'||screen.startsWith('time-clock')){const st=Array.from(document.querySelectorAll('main p')).find(p=>/^You.re on the clock/.test(p.textContent||''));mark(st,'clocked-in-status','status-line');
   const ts=leaf(/^Today.s shifts$/i,mainEl);if(ts){const c=card(ts);mark(c,'todays-shifts','widget');mark(c?.querySelector('li'),'calder-shift','shift');}
   const clock=leaf(/^(Not clocked in|Currently on the clock)$/,mainEl);if(clock)mark(card(clock),'clock-widget','widget');
   mark(buttons(/^Clock In$/,mainEl)[0],'clock-in-button','button');mark(buttons(/^Clock Out$/,mainEl)[0],'clock-out-button','button');
   const h2=Array.from(document.querySelectorAll('main h2')).find(h=>/is clocked in/.test(h.textContent||''));if(h2){mark(card(h2),'running-card','widget');mark(h2,'clocked-in-heading','heading');mark(h2.parentElement.querySelector('[data-slot="badge"]'),'elapsed','badge');}
  }
  if(screen==='punch-list'){const items=leaves(/^(Verified|Done|Open)$/,mainEl).map(b=>card(b)).filter(Boolean);items.forEach((c,i)=>mark(c,`punch-${i}`,'row'));const pl=Array.from(document.querySelectorAll('main p')).find(p=>/verified/.test(p.textContent||'')&&/remaining/.test(p.textContent||''));if(pl)mark(pl.parentElement,'punch-progress','metric');}
  if(screen==='daily-report'){const sh=document.querySelector('[data-slot="sheet-content"]');if(sh&&visible(sh)){mark(sh,'report-sheet','sheet');Array.from(sh.querySelectorAll('button[aria-label^="Open "]')).forEach((b,i)=>mark(b,`photo-${i}`,'photo'));const wp=leaf(/^Work performed$/i,sh);if(wp)mark(wp.parentElement,'work-performed','section');const cr=leaf(/^Crew on site$/i,sh);if(cr)mark(cr.closest('section'),'crew-on-site','section');const note=Array.from(sh.querySelectorAll('p')).find(p=>/shown on the customer portal/.test(p.textContent||''));mark(note,'shared-note','status-line');}}
  if(screen==='job-costing'){for(const [re,id] of [[/^Revised Contract$/i,'metric-contract'],[/^Revenue$/i,'metric-revenue'],[/^Total Cost$/i,'metric-cost'],[/^Gross Profit$/i,'metric-profit']]){const l=leaf(re,mainEl);if(l)mark(card(l),id,'metric');}const cc=leaf(/^Cost by Cost Center$/,mainEl);if(cc)mark(card(cc),'cost-centers','section');const bv=leaf(/^Budget vs\. Cost$/,mainEl);if(bv)mark(card(bv),'budget-vs-cost','section');}
  if(screen==='bank-feed'){Array.from(document.querySelectorAll('main button')).filter(b=>/Matched to Stripe payout/.test(b.textContent||'')).forEach(b=>{const id=(b.textContent.match(/po_vela_(\d+)/)||[])[1];const row=up(b,p=>/group flex flex-col/.test(p.className||''));mark(row,`deposit-${id}`,'row');mark(b,`match-${id}`,'badge');});}
  if(screen==='dashboard'){
   for(const [re,id] of [[/^Revenue$/i,'metric-revenue'],[/^Expenses$/i,'metric-expenses'],[/^Net Income$/i,'metric-net-income'],[/^Receivables$/i,'metric-receivables'],[/^Payables$/i,'metric-payables']]){const l=leaves(re,mainEl).find(e=>card(e)&&card(e).getBoundingClientRect().height<200);if(l)mark(card(l),id,'metric');}
   for(const [re,id] of [[/^Revenue vs Expenses$/i,'chart-revenue-vs-expenses'],[/^Aging Summary$/i,'chart-aging'],[/^Cash Flow Forecast$/i,'chart-cash-flow']]){const l=leaf(re,mainEl);if(l)mark(card(l),id,'chart');}
   const hero=leaf(/^Rise and shine|^Good (morning|afternoon|evening)/,mainEl);if(hero)mark(card(hero)||hero.parentElement,'greeting','section');
  }
  if(screen==='portal-estimate-sent'){const dep=Array.from(document.querySelectorAll('p')).find(p=>/^Deposit due at signing/.test(p.textContent||''));mark(dep,'deposit-due','deposit');}
  if(mainEl){const nav=Array.from(mainEl.querySelectorAll('nav')).find(n=>/Overview/.test(n.textContent||''));if(nav){mark(nav,'project-tabs','shell');Array.from(nav.querySelectorAll('a')).forEach((a,i)=>mark(a,`project-tab-${(a.textContent||'').trim().toLowerCase().replace(/[^a-z]+/g,'-')}`,'tab'));}
   const h1=mainEl.querySelector('h1');if(h1&&/Calder Kitchen/.test(h1.textContent||''))mark(h1.parentElement,'project-header','heading');}

  // ---- V4 generic targets (unchanged identification rules) ----
  const side=document.querySelector('[data-sidebar="sidebar"]');mark(side,'sidebar','shell');
  mark(document.querySelector('[data-app-topbar]'),'topbar','shell');
  Array.from(document.querySelectorAll('[data-sidebar="sidebar"] a')).forEach((el,i)=>mark(el,`nav-${i}`,'nav'));
  Array.from(document.querySelectorAll('main h1,main h2,main thead')).forEach((el,i)=>mark(el,`heading-${i}`,'heading'));
  Array.from(document.querySelectorAll('main tbody tr')).forEach((el,i)=>mark(el,`row-${i}`,'row'));
  Array.from(document.querySelectorAll('main [data-slot="badge"]')).forEach((el,i)=>mark(el,`badge-${i}`,'badge'));
  Array.from(document.querySelectorAll('main h2')).filter(el=>el.parentElement?.classList.contains('space-y-2')).forEach((el,i)=>mark(el.parentElement,`section-${i}`,'section'));
  const bubbles=Array.from(document.querySelectorAll('[class*="ios-tail-"]'));
  bubbles.forEach((el,i)=>{mark(el,`message-${i}`,'message');mark(el.parentElement.parentElement,`message-wrap-${i}`,'message-wrap')});
  const composer=Array.from(document.querySelectorAll('textarea')).find(t=>!t.closest('main')&&!t.closest('[data-slot="sheet-content"]')&&!t.closest('[role="dialog"]'));
  if(composer){let p=composer.parentElement;while(p){const r=p.getBoundingClientRect();if(r.width<460&&r.height>650){mark(p,'chat-shell','chat');break;}p=p.parentElement;}mark(composer,'composer','composer');mark(composer.closest('form')||composer.parentElement.parentElement,'composer-bar','composer-bar');}
  Array.from(document.querySelectorAll('main *, [data-slot="sheet-content"] *')).filter(el=>el.children.length===0&&/^\$[\d,]+(?:\.\d{2})?$/.test((el.textContent||'').trim())).forEach((el,i)=>mark(el,`number-${i}`,'number'));
  Array.from(document.querySelectorAll('main div')).filter(el=>el.className&&typeof el.className==='string'&&/h-1\.5|h-2|h-2\.5/.test(el.className)&&getComputedStyle(el).backgroundColor!=='rgba(0, 0, 0, 0)').forEach((el,i)=>mark(el,`bar-${i}`,'bar'));

  // ---- Serialize: rendered DOM + computed styles only. No links, handlers, scripts or app data. ----
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
   for(const a of el.attributes){if(/^(d|viewBox|width|height|x|y|x1|y1|x2|y2|cx|cy|r|rx|ry|points|fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|stroke-dasharray|stroke-dashoffset|transform|xmlns|preserveAspectRatio|pathLength|clip-path|mask|id|offset|stop-color|stop-opacity|type|placeholder|rows|cols|data-motion|data-film-word|disabled|checked|selected)$/i.test(a.name))out.setAttribute(a.name,a.value);}
   if(el.tagName==='IMG'){out.setAttribute('src',el.currentSrc||el.src);out.setAttribute('alt',el.alt||'');}
   if(el.tagName==='INPUT'){out.setAttribute('value',el.value);out.setAttribute('data-film-value',el.value);}
   if(el.tagName==='SELECT'){for(const o of el.options)if(o.selected)out.setAttribute('data-selected',o.value);}
   for(const pseudo of ['::before','::after']){const s=rules(el,pseudo);if(s&&s!==styleClass){const rule=css.find(x=>x.startsWith('.'+s+pseudo+'{'));if(rule)css.push(rule.replace('.'+s+pseudo,'.'+styleClass+pseudo));}}
   if(el.tagName==='TEXTAREA'){out.textContent=el.value;out.setAttribute('data-film-value',el.value);return out;}
   for(const child of el.childNodes){if(child.nodeType===3)out.appendChild(document.createTextNode(child.textContent));else if(child.nodeType===1){const c=clone(child);if(c)out.appendChild(c);}}
   if(el.tagName==='OPTION'&&el.selected)out.setAttribute('selected','');
   if(el.scrollTop||el.scrollLeft){out.setAttribute('data-scroll-y',String(el.scrollTop));out.setAttribute('data-scroll-x',String(el.scrollLeft));}
   return out;
  }
  // Split the actual message text into independently revealable word spans.
  for(const bubble of bubbles){let n=0;const walker=document.createTreeWalker(bubble,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);for(const node of nodes){const frag=document.createDocumentFragment();for(const part of node.textContent.split(/(\s+)/)){if(!part)continue;if(/^\s+$/.test(part)){frag.appendChild(document.createTextNode(part));}else{const span=document.createElement('span');span.dataset.filmWord=String(n++);span.textContent=part;frag.appendChild(span);}}node.replaceWith(frag);}}
  const root=clone(document.body);root.setAttribute('data-ui-root','');
  const fragments={};
  for(const t of targets){if(['nav','number','plot','composer'].includes(t.kind))continue;const el=root.querySelector(`[data-motion="${t.id}"]`);if(!el)continue;let html=el.outerHTML;if(el.tagName==='TR')html='<table style="width:'+t.rect.width+'px;border-collapse:collapse;table-layout:fixed"><tbody>'+html+'</tbody></table>';else if(el.tagName==='THEAD')html='<table style="width:'+t.rect.width+'px;border-collapse:collapse">'+html+'</table>';fragments[t.id]={html,width:t.rect.width,height:t.rect.height};}
  const scroller=document.querySelector('main');
  return {width,height,screen,html:root.outerHTML,css:css.join('\n'),targets,fragments,scroll:scroller?{scrollHeight:scroller.scrollHeight,clientHeight:scroller.clientHeight}:null,mutations:window.__filmMutationAttempts,simulated:window.__filmSimulatedReviewCommands,external:window.__filmExternalAttempts,sourceMethod:'Actual rendered component DOM and computed visual styles. No application JavaScript.'};
 },{screen,width,height});
 function asset(url){if(url.startsWith('data:'))return url;const u=new URL(url,origin),p=decodeURIComponent(u.pathname);const base=p.startsWith('/ui-v5/')?film+'/public':app+'/public';const full=path.resolve(base,'.'+p);if(!full.startsWith(base+'/')||!fs.existsSync(full))throw Error('Unresolved UI asset '+p);const mime=({'.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.ico':'image/x-icon'})[path.extname(full)];if(!mime)throw Error('Unapproved embedded asset '+p);return 'data:'+mime+';base64,'+fs.readFileSync(full).toString('base64');}
 // Embedded PNG/SVG product assets only. Never embed fonts or runtime code.
 let text=JSON.stringify(snapshot);text=text.replace(/https?:[^\s"<>\\]*?\/[^\s"<>\\]*/g,m=>m.startsWith(origin)?asset(m):m);
 const out=JSON.parse(text);const file=`${OUT}/${spec}.json`;fs.writeFileSync(path.join(film,file),JSON.stringify(out));
 const png=`${QA}/source-${spec}.png`;await page.screenshot({path:path.join(film,png)});
 // QA-only proofs of below-the-fold content (main scrolled); the snapshot itself is captured at the top.
 const proofs=[];const docTall=await page.evaluate(()=>document.documentElement.scrollHeight>innerHeight+40);if(!out.scroll||docTall){const f=`${QA}/proof/${spec}-full.png`;await page.screenshot({path:path.join(film,f),fullPage:true});proofs.push(f);}if(out.scroll&&out.scroll.scrollHeight>out.scroll.clientHeight+40){const maxY=out.scroll.scrollHeight-out.scroll.clientHeight;for(let y=Math.min(maxY,out.scroll.clientHeight-80),n=1;n<=5;y=Math.min(maxY,y+out.scroll.clientHeight-80),n++){await page.evaluate(y=>{document.querySelector('main').scrollTop=y},y);await page.waitForTimeout(150);const f=`${QA}/proof/${spec}-scroll${n}.png`;await page.screenshot({path:path.join(film,f)});proofs.push(f);if(y>=maxY)break;}await page.evaluate(()=>{document.querySelector('main').scrollTop=0});}
 const bodyText=await page.locator('body').innerText();
 const entry={name:spec,screen,viewport:[width,height],sourceRevision,file,png,proofs,bytes:fs.statSync(path.join(film,file)).size,sha256:createHash('sha256').update(fs.readFileSync(path.join(film,file))).digest('hex'),
  targets:out.targets.filter(t=>t.kind!=='nav'&&t.kind!=='number').map(t=>t.id),allTargets:out.targets.map(t=>({id:t.id,kind:t.kind,rect:t.rect})),fragments:Object.keys(out.fragments).length,
  errors,consoleErrors,blocked,mutationAttempts:out.mutations,simulatedReviewCommands:out.simulated,externalRequests:[...out.external,...blocked],textSubstitutions:hygiene.subs,zeroAmounts:hygiene.zeros,glitches:hygiene.glitches,skeletons:hygiene.skeletons,spinners:hygiene.spinners,toasts:hygiene.toasts,
  headings:await page.locator('h1,h2').allTextContents(),topbar:await page.locator('[data-app-topbar]').count(),textLength:bodyText.length};
 manifest.push(entry);
 console.log(spec,entry.bytes,'bytes',out.targets.length,'targets',JSON.stringify({errors,blocked,mutations:out.mutations.length,glitches:hygiene.glitches,skeletons:hygiene.skeletons,spinners:hygiene.spinners,toasts:hygiene.toasts,subs:hygiene.subs.length}));
 await page.close();
}}finally{await browser.close();server.close()}
const resultsPath=path.join(film,QA,'capture5-results.json');
const previous=fs.existsSync(resultsPath)?JSON.parse(fs.readFileSync(resultsPath,'utf8')).screens||[]:[];
const merged=new Map(previous.map(s=>[s.name,s]));for(const s of manifest)merged.set(s.name,s);
const screens=[...merged.values()].sort((a,b)=>a.name.localeCompare(b.name));
const iso=JSON.parse(fs.readFileSync(capture+'/isolation-manifest.json','utf8'));
fs.writeFileSync(resultsPath,JSON.stringify({...iso,captureHarness:'production/capture5',exporter:'production/v5/export-dom.mjs',snapshotDir:OUT,snapshotFormat:'Same as public/ui-dom-v4: {width,height,screen,html,css,targets,fragments}',
 fictionalDemoData:true,realCustomerData:false,liveRecording:false,network:'Loopback static assets only; API reads resolved in memory; all business mutations rejected; fetch/XHR/WebSocket/EventSource guarded',
 totals:{screens:screens.length,mutationAttempts:screens.reduce((s,x)=>s+x.mutationAttempts.length,0),externalRequests:screens.reduce((s,x)=>s+x.externalRequests.length,0),pageErrors:screens.reduce((s,x)=>s+x.errors.length,0),glitches:screens.reduce((s,x)=>s+x.glitches.length,0)},
 screens},null,2)+'\n');
if(manifest.some(x=>x.errors.length||x.blocked.length||x.mutationAttempts.length||x.externalRequests.length||x.glitches.length||x.toasts.length||x.skeletons))process.exitCode=1;
