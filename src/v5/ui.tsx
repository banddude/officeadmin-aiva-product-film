import React,{type CSSProperties,type ReactNode} from 'react';
import {Img,staticFile} from 'remotion';
import {P,BODY,DISPLAY,clamp,easeOut,ease,out,pop,lerp,Aiva,blinkAt} from './kit';
import {UiDom} from './dom';
import G from './geometry.json';
import TL from '../../production/v5/timeline.json';
import NAR from '../../production/v5/narration.json';

type Geo={w:number;h:number;frags:Record<string,number[]>;targets:Record<string,(number|string)[]>};
const geo=(name:string)=>{const g=(G as Record<string,Geo>)[name];if(!g)throw Error('No geometry for '+name);return g};
export const fragSize=(name:string,frag:string)=>{const f=geo(name).frags[frag];if(!f)throw Error(`No fragment ${name}/${frag}`);return {w:f[0],h:f[1]}};
export const rect=(name:string,id:string)=>{const t=geo(name).targets[id];if(!t)throw Error(`No target ${name}/${id}`);return {x:t[0] as number,y:t[1] as number,w:t[2] as number,h:t[3] as number}};
export const FPS=30,sf=(s:number)=>Math.round(s*FPS);

// Highlight ring drawn around a sub-rect of a hero (hero-local px, pre-scale).
export function Ring({x,y,w,h,f,at,color=P.amber,pad=8,radius=14}:{x:number;y:number;w:number;h:number;f:number;at:number;color?:string;pad?:number;radius?:number}){
 if(f<at)return null;const q=pop(f,at,18),pulse=.5+.5*Math.sin((f-at)/5);
 return <div style={{position:'absolute',left:x-pad,top:y-pad,width:w+pad*2,height:h+pad*2,borderRadius:radius,border:`4px solid ${color}`,boxShadow:`0 0 0 ${6+pulse*6}px ${color}33`,transform:`scale(${1.12-.12*q})`,opacity:clamp(q*2),pointerEvents:'none'}}/>;
}
// A real-UI fragment at a large scale; x,y = top-left in frame px.
export function Hero({name,frag,s,x,y,f=999,at=0,from='up',ring,children,style={},bg='#fff',radius=22,shadow=true,pad=0,dim}:{name:string;frag:string;s:number;x:number;y:number;f?:number;at?:number;from?:'up'|'right'|'left'|'zoom'|'none';ring?:{id?:string;at:number;color?:string;rect?:{x:number;y:number;w:number;h:number}};children?:ReactNode;style?:CSSProperties;bg?:string;radius?:number;shadow?:boolean;pad?:number;dim?:number}){
 const {w,h}=fragSize(name,frag),q=from==='none'?1:pop(f,at,22),a=clamp((f-at)/6);
 const tr=from==='right'?`translateX(${(1-q)*240}px)`:from==='left'?`translateX(${(1-q)*-240}px)`:from==='zoom'?`scale(${.7+.3*q})`:`translateY(${(1-q)*90}px)`;
 let rr=ring?.rect;if(ring?.id){const t=rect(name,ring.id),o=geo(name).targets[frag]?rect(name,frag):{x:0,y:0,w,h};rr={x:t.x-o.x,y:t.y-o.y,w:t.w,h:t.h}}
 return <div style={{position:'absolute',left:x,top:y,width:(w+pad*2)*s,height:(h+pad*2)*s,transform:tr,transformOrigin:'50% 50%',opacity:a*(dim??1),...style}}>
  <div style={{position:'absolute',inset:0,borderRadius:radius,background:bg,boxShadow:shadow?'0 34px 90px rgba(3,8,24,.5),0 2px 8px rgba(3,8,24,.3)':undefined,overflow:'hidden'}}>
   <div style={{position:'absolute',left:pad*s,top:pad*s,transform:`scale(${s})`,transformOrigin:'0 0',width:w,height:h}}><UiDom name={name} fragment={frag}/></div>
  </div>
  {rr&&ring&&<div style={{position:'absolute',left:pad*s,top:pad*s,transform:`scale(${s})`,transformOrigin:'0 0',width:w,height:h}}><Ring {...rr} f={f} at={ring.at} color={ring.color} pad={5} radius={8}/></div>}
  {children}
 </div>;
}
// Crop of a full snapshot (snapshot px) shown at scale s.
export function Clip({name,cx,cy,cw,ch,s,x,y,f=999,at=0,radius=22,ring,style={}}:{name:string;cx:number;cy:number;cw:number;ch:number;s:number;x:number;y:number;f?:number;at?:number;radius?:number;ring?:{id:string;at:number;color?:string};style?:CSSProperties}){
 const q=pop(f,at,22),a=clamp((f-at)/6);let rr:undefined|{x:number;y:number;w:number;h:number};
 if(ring){const t=rect(name,ring.id);rr={x:t.x-cx,y:t.y-cy,w:t.w,h:t.h}}
 return <div style={{position:'absolute',left:x,top:y,width:cw*s,height:ch*s,transform:`translateY(${(1-q)*90}px)`,opacity:a,...style}}>
  <div style={{position:'absolute',inset:0,borderRadius:radius,overflow:'hidden',background:'#fff',boxShadow:'0 34px 90px rgba(3,8,24,.5)'}}>
   <div style={{position:'absolute',left:-cx*s,top:-cy*s,transform:`scale(${s})`,transformOrigin:'0 0',width:geo(name).w,height:geo(name).h}}><UiDom name={name}/></div>
  </div>
  {rr&&ring&&<div style={{position:'absolute',left:0,top:0,transform:`scale(${s})`,transformOrigin:'0 0'}}><Ring {...rr} f={f} at={ring.at} color={ring.color} pad={5} radius={8}/></div>}
 </div>;
}
// Crop of a high-res screenshot (source px) shown at scale s.
export function Shot({src,cx,cy,cw,ch,s,x,y,f=999,at=0,style={},sw=3840,sh=2160}:{src:string;cx:number;cy:number;cw:number;ch:number;s:number;x:number;y:number;f?:number;at?:number;style?:CSSProperties;sw?:number;sh?:number}){
 const q=pop(f,at,22),a=clamp((f-at)/6);
 return <div style={{position:'absolute',left:x,top:y,width:cw*s,height:ch*s,borderRadius:20,overflow:'hidden',background:'#fff',boxShadow:'0 34px 90px rgba(3,8,24,.5)',transform:`translateY(${(1-q)*90}px)`,opacity:a,...style}}>
  <Img src={staticFile(src)} style={{position:'absolute',left:-cx*s,top:-cy*s,width:sw*s,height:sh*s,maxWidth:'none'}}/>
 </div>;
}
// A tap: finger-dot ripple at a point (frame px).
export function Tap({x,y,f,at}:{x:number;y:number;f:number;at:number}){
 if(f<at-8||f>at+22)return null;const d=f-at,press=d<0?clamp((d+8)/8):1,r=clamp(d/18);
 return <div style={{position:'absolute',left:x,top:y,pointerEvents:'none'}}>
  <div style={{position:'absolute',left:-60*r-10,top:-60*r-10,width:(60*r+10)*2,height:(60*r+10)*2,borderRadius:'50%',border:'5px solid rgba(255,255,255,.9)',opacity:d<0?0:1-r}}/>
  <div style={{position:'absolute',left:-26,top:-26,width:52,height:52,borderRadius:'50%',background:'rgba(255,255,255,.85)',boxShadow:'0 6px 20px rgba(0,0,0,.35)',transform:`scale(${d<0?1.3-.3*press:1-.15*clamp(d/4)})`,opacity:d>14?1-clamp((d-14)/8):1}}/>
 </div>;
}
// Small label above a hero ("ON JEN'S PHONE", etc.).
export function Kicker({text,x,y,f,at,color=P.sky,size=26}:{text:string;x:number;y:number;f:number;at:number;color?:string;size?:number}){
 const a=easeOut(f,at,at+10);return <div style={{position:'absolute',left:x,top:y-6,padding:'6px 14px',borderRadius:10,background:'rgba(6,10,24,.78)',fontFamily:BODY,fontWeight:800,fontSize:size,letterSpacing:3,color:color===P.oaBlue?P.sky:color===P.green?'#4ade80':color,opacity:a,transform:`translateX(${(1-a)*-20}px)`,whiteSpace:'nowrap'}}>{text}</div>;
}
export function Pill({text,x,y,f,at,bg='rgba(6,10,24,.75)',color='#fff',size=24}:{text:string;x:number;y:number;f:number;at:number;bg?:string;color?:string;size?:number}){
 const a=easeOut(f,at,at+10);return <div style={{position:'absolute',left:x,top:y,padding:'9px 18px',borderRadius:30,background:bg,color,fontFamily:BODY,fontWeight:700,fontSize:size,opacity:a,whiteSpace:'nowrap'}}>{text}</div>;
}

// Feature HUD: each feature that saves Tony pops in big, then joins a readable counter.
export function FeatureHUD({t,v}:{t:number;v:boolean}){
 const B=TL.badges as {t:number;label:string}[],earned=B.filter(b=>b.t<=t),cur=earned[earned.length-1];
 if(!earned.length||t>122.4)return null;
 const age=cur?t-cur.t:99,q=clamp(age/.35),exit=clamp((age-1.7)/.3);
 const W=v?1080:1920,right=v?40:56,top=v?54:44;
 return <>
  <div style={{position:'absolute',right,top,display:'flex',alignItems:'center',gap:12,padding:'10px 20px 10px 14px',borderRadius:40,background:'rgba(6,10,24,.72)',border:'2px solid rgba(59,164,224,.55)',color:'#fff',fontFamily:BODY,fontWeight:800,fontSize:v?30:28,boxShadow:'0 10px 30px rgba(0,0,0,.35)'}}>
   <div style={{width:v?42:38,height:v?42:38,borderRadius:21,background:P.oaBlue,display:'flex',alignItems:'center',justifyContent:'center',fontSize:v?24:22,transform:`scale(${age<.4?1+.25*Math.sin(Math.PI*q):1})`}}>{earned.length}</div>
   <span style={{letterSpacing:.2}}>features in play</span>
  </div>
  {cur&&age<2.0?<div style={{position:'absolute',right,top:top+(v?84:74),transform:`translateY(${(1-q)*-30}px) scale(${(.6+.4*pop(age*30,0,16))*(1-exit*.5)})`,transformOrigin:'100% 0',opacity:clamp(q*2)*(1-exit)}}>
   <div style={{padding:v?'14px 28px':'12px 26px',borderRadius:18,background:'linear-gradient(#ffffff,#eef3f8)',color:P.ink,fontFamily:DISPLAY,fontWeight:800,fontSize:v?56:50,letterSpacing:-1,boxShadow:'0 6px 0 rgba(0,0,0,.18),0 16px 40px rgba(0,0,0,.4)',display:'flex',alignItems:'center',gap:16,fontVariationSettings:"'wdth' 90"}}>
    <span style={{width:v?40:36,height:v?40:36,borderRadius:'50%',background:P.green,color:'#fff',display:'inline-flex',alignItems:'center',justifyContent:'center',fontFamily:BODY,fontSize:v?28:24}}>✓</span>{cur!.label}
   </div>
  </div>:null}
 </>;
}

// Captions: TikTok-style chunks from the real VO timing.
type Row={start:number;end:number;text:string;role:string};
function chunks(text:string,max:number){const words=text.split(' '),out:string[]=[];let cur='';for(const w of words){const next=cur?cur+' '+w:w;if(next.length>max&&cur){out.push(cur);cur=w}else cur=next;if(/[.?!,]$/.test(w)&&cur.length>max*.55){out.push(cur);cur=''}}if(cur)out.push(cur);return out}
export function Captions({t,v,hide=false,y}:{t:number;v:boolean;hide?:boolean;y?:number}){
 if(hide)return null;const rows=NAR as Row[];const r=rows.find(x=>t>=x.start-.05&&t<=x.end+.25);if(!r)return null;
 const parts=chunks(r.text,v?30:44),total=parts.reduce((a,p)=>a+p.length,0);let acc=r.start,idx=0;
 for(let i=0;i<parts.length;i++){const d=(r.end-r.start)*parts[i].length/total;if(t<acc+d||i===parts.length-1){idx=i;break}acc+=d}
 const local=t-acc,a=clamp(local/.08),aiva=r.role==='aiva';
 return <div style={{position:'absolute',left:0,right:0,top:y??(v?1560:938),display:'flex',justifyContent:'center',pointerEvents:'none'}}>
  <div style={{maxWidth:v?960:1560,padding:v?'16px 30px 18px':'12px 30px 14px',borderRadius:22,background:aiva?'rgba(2,74,124,.86)':'rgba(6,10,24,.78)',color:'#fff',fontFamily:BODY,fontWeight:750,fontSize:v?62:54,lineHeight:1.18,letterSpacing:-.6,textAlign:'center',transform:`scale(${.94+.06*a})`,opacity:.4+.6*a,boxShadow:'0 10px 40px rgba(0,0,0,.3)'}}>
   {aiva&&<span style={{color:'#9fdcff',marginRight:14}}>AIVA:</span>}{parts[idx]}
  </div>
 </div>;
}

// Generic phone frame (not any specific maker's trade dress) holding a real mobile snapshot.
export function Phone({name,s=1,x,y,f=999,at=0,children,glow=true}:{name?:string;s?:number;x:number;y:number;f?:number;at?:number;children?:ReactNode;glow?:boolean}){
 const q=pop(f,at,22);
 return <div style={{position:'absolute',left:x,top:y,width:430*s,height:850*s,transform:`translateY(${(1-q)*120}px)`,opacity:clamp((f-at)/6)}}>
  <div style={{position:'absolute',inset:0,borderRadius:58*s,background:'linear-gradient(140deg,#3a4250,#0e1218 40%,#2c333d)',boxShadow:`0 40px 90px rgba(0,0,0,.55)${glow?',0 0 120px rgba(160,210,255,.25)':''}`}}/>
  <div style={{position:'absolute',left:14*s,top:14*s,width:402*s,height:822*s,borderRadius:46*s,overflow:'hidden',background:'#fff'}}>
   <div style={{position:'absolute',left:0,top:32*s,transform:`scale(${s})`,transformOrigin:'0 0',width:402,height:790}}>{name&&<UiDom name={name}/>}</div>
   <div style={{position:'absolute',left:0,top:0,width:'100%',height:32*s,background:'#fff'}}/>
   <div style={{position:'absolute',left:'50%',top:10*s,width:90*s,height:10*s,marginLeft:-45*s,borderRadius:6*s,background:'#0e1218'}}/>
   {children}
  </div>
 </div>;
}

export function AivaCorner({f,x,y,size=150,at=0}:{f:number;x:number;y:number;size?:number;at?:number}){
 const a=easeOut(f,at,at+12);return <div style={{position:'absolute',left:x,top:y,opacity:a,transform:`translateY(${(1-a)*30}px)`}}><div style={{position:'absolute',inset:-size*.25,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,164,224,.35),rgba(59,164,224,0) 66%)'}}/><Aiva size={size} blink={Math.min(blinkAt(f,at+20),blinkAt(f,at+95),blinkAt(f,at+170))}/></div>;
}
export const PreviewPill=({f,at,x,y,v}:{f:number;at:number;x:number;y:number;v?:boolean})=> <Pill text="AIVA · private preview" x={x} y={y} f={f} at={at} bg="rgba(2,132,199,.9)" size={v?26:22}/>;
