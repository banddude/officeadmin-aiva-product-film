import React,{useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {delayRender,continueRender,cancelRender,staticFile} from 'remotion';
export type Target={id:string;kind:string;rect:{x:number;y:number;width:number;height:number};text:string};
type Snapshot={width:number;height:number;html:string;css:string;targets:Target[];fragments:Record<string,{html:string;width:number;height:number}>};
export type DomMotion='none'|'assembly'|'build'|'estimate'|'schedule'|'paid'|'numbers'|'chat';
const cache=new Map<string,Promise<Snapshot>>(),styles=new WeakMap<Snapshot,Map<string,string>>();
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(f:number,a:number,b:number)=>1-Math.pow(1-clamp((f-a)/(b-a)),4);
const pop=(f:number,a:number,d=32)=>{const t=clamp((f-a)/d);return t===1?1:1-Math.exp(-7*t)*Math.cos(7.5*t)};
const money=(v:number)=>v.toLocaleString('en-US',{style:'currency',currency:'USD'});
function load(name:string){if(!cache.has(name))cache.set(name,fetch(staticFile(`ui-dom-v4/${name}.json`)).then(r=>{if(!r.ok)throw Error(`Source DOM ${name}: ${r.status}`);return r.json()}));return cache.get(name)!}
function cssFor(s:Snapshot,html:string){let rules=styles.get(s);if(!rules){rules=new Map();for(const m of s.css.matchAll(/\.(d\d+)(?:::before|::after)?\{[^}]*\}/g))rules.set(m[1],(rules.get(m[1])||'')+m[0]+'\n');styles.set(s,rules)}const classes=new Set(Array.from(html.matchAll(/class="([^"]*)"/g)).flatMap(m=>m[1].split(/\s+/)));return [...classes].map(c=>rules!.get(c)||'').join('\n')}
// Preserve the native chat tail geometry while making its background transparent.
function tail(mirror:boolean){const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 21"><g transform="${mirror?'translate(18 0) scale(-1 1)':''}"><path fill="white" fill-rule="evenodd" d="M0 0H18V21H0Z M-9 0H7V9Q7 21 -5 21H-9Z"/></g></svg>`;return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")'}
export function UiDom({name,fragment,frame=9999,motion='none',scrollY=0,typing='',revealWords=1,style={}}:{name:string;fragment?:string;frame?:number;motion?:DomMotion;scrollY?:number;typing?:string;revealWords?:number;style?:CSSProperties}){
 const host=useRef<HTMLDivElement>(null),shadow=useRef<ShadowRoot|null>(null),resolved=useRef(false);
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
 const [gate]=useState(()=>delayRender(`V4 source ${name}/${fragment||'full'}`,{timeoutInMilliseconds:90000}));
 useEffect(()=>{let active=true;load(name).then(s=>{if(active)setSnapshot(s)}).catch(cancelRender);return()=>{active=false;if(!resolved.current){resolved.current=true;continueRender(gate)}}},[name,gate]);
 useLayoutEffect(()=>{
  if(!host.current||!snapshot)return;
  const part=fragment?snapshot.fragments[fragment]:null;
  if(fragment&&!part){cancelRender(new Error(`Missing real UI fragment: ${name}/${fragment}`));return}
  const html=part?.html||snapshot.html;
  if(/<script|javascript:/i.test(html)){cancelRender(new Error('Executable source content is not allowed in a film snapshot'));return}
  const root=host.current.shadowRoot||host.current.attachShadow({mode:'open'});shadow.current=root;
  const tails=fragment?.startsWith('message-')?`[data-motion^="message-"]::after{display:none!important}[data-motion^="message-"]::before{mask-image:${tail(fragment==='message-0'||fragment==='message-2')};mask-repeat:no-repeat;mask-size:18px 21px}`:'';
  root.innerHTML=`<style>:host{display:block;pointer-events:none}*{animation:none!important;transition:none!important;caret-color:transparent!important}${cssFor(snapshot,html)}[data-fragment-root]{position:relative;width:${part?.width||snapshot.width}px;height:${part?.height||snapshot.height}px}[data-fragment-root]>[data-motion]{position:relative!important;inset:auto!important;margin:0!important;transform:none}${tails}</style><div data-fragment-root>${html}</div><style id="frame-motion"></style>`;
  for(const el of root.querySelectorAll<HTMLElement>('[data-scroll-y]')){el.scrollTop=Number(el.dataset.scrollY);el.scrollLeft=Number(el.dataset.scrollX)}
  for(const path of root.querySelectorAll<SVGPathElement>('path[data-motion^="plot-"]'))path.dataset.length=String(path.getTotalLength());
  Promise.all([...Array.from(root.querySelectorAll<HTMLImageElement>('img')).map(im=>im.decode()),document.fonts.ready]).then(()=>{if(host.current)host.current.dataset.nativeReady='1';if(!resolved.current){resolved.current=true;continueRender(gate)}}).catch(cancelRender);
 },[snapshot,name,fragment,gate]);
 useLayoutEffect(()=>{
  const root=shadow.current,s=snapshot;if(!root||!s)return;
  const css:string[]=[],set=(id:string,rule:string)=>css.push(`[data-motion="${id}"]{${rule}}`);
  const payment=root.querySelector<HTMLElement>('[data-motion="payment"]');
  for(const t of s.targets){
   const el=root.querySelector<HTMLElement>(`[data-motion="${t.id}"]`);if(!el)continue;
   const i=Number(t.id.split('-').slice(-1)[0])||0;
   if(t.kind==='number')el.textContent=t.text;
   if(motion==='assembly'&&(t.kind==='shell'||t.kind==='row'))set(t.id,'opacity:0!important');
   if(motion==='build'&&['shell','nav','section','row','heading'].includes(t.kind)){
    const delay=t.id==='sidebar'?0:t.id==='topbar'?8:t.kind==='nav'?14+i*1.2:t.kind==='row'?36+i*12:22;
    const q=pop(frame,delay,38);set(t.id,`opacity:${smooth(frame,delay,delay+12)}!important;transform:translate(${(1-q)*(t.id==='sidebar'?-180:t.kind==='row'?170:0)}px,${(1-q)*(t.id==='topbar'?-60:25)}px)!important`);
   }
   if(motion==='estimate'){
    if(t.kind==='row'){const q=pop(frame,18+i*17,36);set(t.id,`opacity:${smooth(frame,18+i*17,28+i*17)}!important;transform:translateX(${(1-q)*300}px)!important`)}
    if(t.kind==='acceptance'||t.kind==='badge')set(t.id,`opacity:${smooth(frame,178,191)}!important`);
    if(t.kind==='total')set(t.id,`opacity:${smooth(frame,35,50)}!important`);
    if(t.kind==='number'&&t.text==='$20,800.00')el.textContent=money(frame<38?0:frame<56?8400:frame<74?13350:frame<92?18950:20800);
   }
   if(motion==='schedule'){
    if(t.kind==='shift'){const q=pop(frame,22+i*8,34);set(t.id,`opacity:${smooth(frame,22+i*8,32+i*8)}!important;transform:translate(${(1-q)*(i%2?90:-90)}px,${(1-q)*16}px)!important`)}
    if(t.kind==='crew'&&t.rect.width<500&&t.rect.height<250)set(t.id,`opacity:${smooth(frame,5+i*8,22+i*8)}!important`);
   }
   if(motion==='paid'&&t.kind==='bar'&&payment?.contains(el))set(t.id,`transform:scaleX(${smooth(frame,40,90)})!important;transform-origin:left!important`);
   if(motion==='numbers'){
    if(t.kind==='number')el.textContent=money(Number(t.text.replace(/[^\d.]/g,''))*smooth(frame,8+i%5*5,68+i%5*5));
    if(t.kind==='bar')set(t.id,`transform:scaleX(${smooth(frame,25+i*2,80+i*2)})!important;transform-origin:left!important`);
    if(t.kind==='plot'){const length=Number(el.dataset.length||1000),q=smooth(frame,40,125);set(t.id,i%2?`stroke-dasharray:${length}!important;stroke-dashoffset:${length*(1-q)}!important`:`clip-path:inset(0 ${(1-q)*100}% 0 0)!important`)}
   }
   if(motion==='chat'&&(t.kind==='message'||t.kind==='message-wrap')){const start=[58,95,236,271][i]||0,q=pop(frame,start,28);set(t.id,`opacity:${smooth(frame,start,start+8)}!important;transform:translateY(${(1-q)*28}px)!important`)}
  }
  // The film animates this fictional settlement. The invoice total never changes.
  if(motion==='paid'&&payment){
   const values=Array.from(payment.querySelectorAll<HTMLElement>('[data-motion^="number-"]'));
   if(values.length!==3){cancelRender(new Error('Expected Total, Paid and Due in the actual invoice panel'));return}
   const q=smooth(frame,40,90),paid=Math.round(2080000*q)/100;
   [20800,paid,20800-paid].forEach((v,i)=>values[i].textContent=money(v));
   const pct=Array.from(payment.querySelectorAll<HTMLElement>('*')).find(el=>el.children.length===0&&/^\d+%$/.test(el.textContent||''));
   if(pct)pct.textContent=Math.round(q*100)+'%';
  }
  const words=Array.from(root.querySelectorAll<HTMLElement>('[data-film-word]'));
  for(const word of words)word.style.setProperty('opacity',Number(word.dataset.filmWord)<Math.ceil(revealWords*words.length)?'1':'0','important');
  const textarea=root.querySelector<HTMLTextAreaElement>('textarea');if(textarea)textarea.value=typing;
  const main=root.querySelector<HTMLElement>('main');if(main)main.scrollTop=scrollY;
  const frameStyle=root.querySelector('#frame-motion');if(frameStyle)frameStyle.textContent=css.join('\n');
 },[snapshot,fragment,frame,motion,scrollY,typing,revealWords]);
 return <div ref={host} data-native-name={name} data-native-fragment={fragment||'full'} style={{display:'block',pointerEvents:'none',transform:'translateZ(0)',...style}}/>;
}
