import React, {useEffect,useLayoutEffect,useRef,useState,type CSSProperties} from 'react';
import {continueRender,delayRender,cancelRender,staticFile} from 'remotion';
export type Target={id:string;kind:string;rect:{x:number;y:number;width:number;height:number};text:string};
type Snapshot={width:number;height:number;html:string;css:string;targets:Target[];fragments:Record<string,{html:string;width:number;height:number}>};
const cache=new Map<string,Promise<Snapshot>>();
const styleCache=new WeakMap<Snapshot,Map<string,string>>();
function scopedStyles(snapshot:Snapshot,html:string){
 let rules=styleCache.get(snapshot);
 if(!rules){rules=new Map();for(const match of snapshot.css.matchAll(/\.(d\d+)(?:::before|::after)?\{[^}]*\}/g)){rules.set(match[1],(rules.get(match[1])||'')+match[0]+'\n')}styleCache.set(snapshot,rules)}
 const used=new Set(Array.from(html.matchAll(/class="([^"]*)"/g)).flatMap(m=>m[1].split(/\s+/)));
 return Array.from(used).map(c=>rules!.get(c)||'').join('\n');
}
function load(name:string){if(!cache.has(name))cache.set(name,fetch(staticFile(`ui-dom/${name}.json`)).then(r=>{if(!r.ok)throw new Error(`UI DOM ${name}: ${r.status}`);return r.json()}));return cache.get(name)!;}
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const smooth=(f:number,a:number,b:number)=>{const x=clamp((f-a)/(b-a));return 1-Math.pow(1-x,4)};
export const pop=(f:number,a:number,d=28)=>{const t=clamp((f-a)/d);return t===1?1:1-Math.exp(-7*t)*Math.cos(7.5*t)};
export type DomMotion='none'|'build'|'estimate'|'paid'|'numbers'|'chat';
// Native tail geometry, converting its white background knockout to real alpha.
function nativeTail(mirror:boolean){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 21"><g transform="${mirror?'translate(18 0) scale(-1 1)':''}"><path fill="white" fill-rule="evenodd" d="M0 0H18V21H0Z M-9 0H7V9Q7 21 -5 21H-9Z"/></g></svg>`;
 return 'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
}
export function UiDom({name,frame=9999,motion='none',fragment,scrollY=0,typing='',revealWords=1,style={}}:{name:string;frame?:number;motion?:DomMotion;fragment?:string;scrollY?:number;typing?:string;revealWords?:number;style?:CSSProperties}){
 const host=useRef<HTMLDivElement>(null),shadow=useRef<ShadowRoot|null>(null),[snap,setSnap]=useState<Snapshot|null>(null);
 const [handle]=useState(()=>delayRender(`Load vector UI ${name}/${fragment||'full'}`,{timeoutInMilliseconds:90000}));
 const resolved=useRef(false);
 useEffect(()=>{let active=true;load(name).then(s=>{if(active)setSnap(s)}).catch(cancelRender);return()=>{active=false;if(!resolved.current){resolved.current=true;continueRender(handle)}}},[name,handle]);
 useLayoutEffect(()=>{
  if(!host.current||!snap)return;
  const root=host.current.shadowRoot||host.current.attachShadow({mode:'open'});shadow.current=root;
  const fr=fragment?snap.fragments[fragment]:null;if(fragment&&!fr){cancelRender(new Error(`Missing authentic fragment ${name}/${fragment}`));return;}
  const tailCss=fragment?.startsWith('message')?`[data-motion^="message-"]::after{display:none!important}[data-motion^="message-"]::before{mask-image:${nativeTail(fragment==='message-0'||fragment==='message-2')};mask-repeat:no-repeat;mask-size:18px 21px}`:'';
  root.innerHTML=`<style>:host{display:block;pointer-events:none}*{animation:none!important;transition:none!important}${scopedStyles(snap,fr?.html||snap.html)}\n[data-fragment-root]{position:relative;display:block;width:${fr?.width||snap.width}px;height:${fr?.height||snap.height}px}[data-fragment-root]>[data-motion]{position:relative!important;inset:auto!important;margin:0!important;transform:none}${tailCss}</style><div data-fragment-root>${fr?.html||snap.html}</div><style id="frame-motion"></style>`;
  for(const el of root.querySelectorAll<HTMLElement>('[data-scroll-y]')){el.scrollTop=Number(el.dataset.scrollY);el.scrollLeft=Number(el.dataset.scrollX)}
  for(const p of root.querySelectorAll<SVGPathElement>('path[data-motion^="plot-"]'))p.setAttribute('data-length',String(p.getTotalLength()));
  Promise.all([...Array.from(root.querySelectorAll<HTMLImageElement>('img')).map(img=>img.decode()),document.fonts.ready]).then(()=>{if(!resolved.current){resolved.current=true;continueRender(handle)}}).catch(cancelRender);
 },[snap,fragment,name,handle]);
 useLayoutEffect(()=>{
  const root=shadow.current;if(!root||!snap)return;const css:string[]=[];
  const set=(id:string,s:string)=>css.push(`[data-motion="${id}"]{${s}}`);
  for(const t of snap.targets){
   const el=root.querySelector<HTMLElement>(`[data-motion="${t.id}"]`);if(!el)continue;
   const i=Number(t.id.split('-').slice(-1)[0])||0;
   if(motion==='build'){
    const d=t.id==='sidebar'?0:t.id==='topbar'?8:t.kind==='nav'?16+i*1.3:t.kind==='section'?25+i*14:t.kind==='row'?42+i*14:t.kind==='heading'?22+i*3:20;
    if(['shell','nav','section','row','heading'].includes(t.kind)){const a=pop(frame,d,38),o=smooth(frame,d,d+13);const x=t.id==='sidebar'?-230*(1-a):t.kind==='nav'?-40*(1-a):t.kind==='row'?260*(1-a):0;const y=t.id==='topbar'?-130*(1-a):t.kind==='section'?100*(1-a):0;set(t.id,`opacity:${o}!important;transform:translate3d(${x}px,${y}px,${t.kind==='section'?70*(1-a):0}px)!important;filter:blur(${Math.max(0,(1-a)*5)}px)!important;`)}
   }
   if(motion==='estimate'){
    if(t.kind==='row'){const a=pop(frame,18+i*17,36);set(t.id,`opacity:${smooth(frame,18+i*17,28+i*17)}!important;transform:translateX(${(1-a)*320}px)!important;`)}
    if(t.kind==='badge'||t.kind==='acceptance'){const a=pop(frame,178,24);set(t.id,`opacity:${smooth(frame,178,190)}!important;transform:translateY(${(1-a)*-28}px) scale(${.82+.18*a})!important;`)}
    if(t.kind==='total')set(t.id,`opacity:${smooth(frame,52,67)}!important;transform:translateY(${(1-pop(frame,52))*28}px)!important;`);
    if(t.kind==='number'&&t.text==='$18,450.00'){const value=frame<45?0:frame<62?7950:frame<79?14700:frame<96?17100:18450;el.textContent=value.toLocaleString('en-US',{style:'currency',currency:'USD'});}
   }else if(t.kind==='number')el.textContent=t.text;
   if(motion==='paid'&&t.kind==='number'&&(t.id==='number-23'||t.id==='number-24')){const paid=Math.round(1845000*smooth(frame,40,90))/100;el.textContent=(t.id==='number-23'?paid:18450-paid).toLocaleString('en-US',{style:'currency',currency:'USD'});}
   if(motion==='paid'&&t.kind==='bar')set(t.id,`transform:scaleX(${smooth(frame,40,90)})!important;transform-origin:left!important;`);
   if(motion==='numbers'){
    if(t.kind==='number'){const val=Number(t.text.replace(/[^\d.]/g,''));el.textContent=(val*smooth(frame,8+(i%5)*5,68+(i%5)*5)).toLocaleString('en-US',{style:'currency',currency:'USD'});}
    if(t.kind==='bar')set(t.id,`transform:scaleX(${smooth(frame,30+i*3,95+i*3)})!important;transform-origin:left!important;`);
    if(t.kind==='plot'){const path=el as unknown as SVGPathElement;const length=Number(path.getAttribute('data-length')||1000);set(t.id,i%2?`stroke-dasharray:${length}!important;stroke-dashoffset:${length*(1-smooth(frame,60,155))}!important;`:`clip-path:inset(0 ${(1-smooth(frame,60,155))*100}% 0 0)!important;`);}
   }
   if(motion==='chat'&&(t.kind==='message'||t.kind==='message-wrap')){
    const start=[58,95,236,271][i]??0;const a=pop(frame,start,28);set(t.id,`opacity:${smooth(frame,start,start+8)}!important;transform:translateY(${(1-a)*35}px) scale(${.96+.04*a})!important;transform-origin:bottom ${i%2?'left':'right'}!important;`);
    if(t.kind==='message'&&i%2){const n=Math.floor(smooth(frame,start+10,start+80)*el.querySelectorAll('[data-film-word]').length);for(const word of el.querySelectorAll<HTMLElement>('[data-film-word]'))word.style.setProperty('opacity',Number(word.dataset.filmWord)<n?'1':'0','important');}
   }
  }
  if(motion!=='chat')for(const word of root.querySelectorAll<HTMLElement>('[data-film-word]'))word.style.opacity=Number(word.dataset.filmWord)<Math.ceil(revealWords*root.querySelectorAll('[data-film-word]').length)?'1':'0';
  const textarea=root.querySelector<HTMLTextAreaElement>('textarea');if(textarea)textarea.value=typing;
  const main=root.querySelector<HTMLElement>('main');if(main)main.scrollTop=scrollY;
  const motionStyle=root.querySelector('#frame-motion');if(motionStyle)motionStyle.textContent=css.join('\n');
 },[snap,frame,motion,scrollY,typing,revealWords,fragment]);
 return <div ref={host} style={{display:'block',pointerEvents:'none',transform:'translateZ(0)',...style}}/>;
}
