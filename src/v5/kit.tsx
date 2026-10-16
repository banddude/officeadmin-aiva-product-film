import React,{type CSSProperties,type ReactNode} from 'react';
import {AbsoluteFill,Img,staticFile,delayRender,continueRender,cancelRender} from 'remotion';

// V5 "9:14 PM" design system. Illustrated world + actual OfficeAdmin UI.
export const FPS=30;
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
export const ease=(f:number,a:number,b:number)=>{const t=clamp((f-a)/(b-a));return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
export const out=(f:number,a:number,b:number)=>1-ease(f,a,b);
export const easeOut=(f:number,a:number,b:number)=>1-Math.pow(1-clamp((f-a)/(b-a)),3);
export const pop=(f:number,a:number,d=24)=>{const t=clamp((f-a)/d);return t===1?1:1-Math.exp(-6.5*t)*Math.cos(8*t)};
export const sec=(s:number)=>Math.round(s*FPS);

// Palette. Night interiors are cool indigo; people and story beats carry warm accents.
export const P={
 night:'#0f1630',night2:'#18224a',night3:'#232f62',navy:'#0b1124',
 tv:'#6fd3ff',phone:'#d8efff',lamp:'#ffb867',lampDeep:'#f08a3c',
 day:'#f6efe4',day2:'#efe3d0',sun:'#ffd27a',
 oaBlue:'#0284c7',sky:'#3ba4e0',ink:'#101828',paper:'#fbfaf7',
 green:'#1fb47f',red:'#ef5a4c',amber:'#f2a93b',coral:'#ff7f6e',teal:'#2d6a78',
 skinT:'#c98a5f',skinTs:'#a36a45',skinJ:'#f0c3a0',skinJs:'#d39c78',skinR:'#8a5a3c',skinRs:'#6c4329',skinS:'#e9b98f',skinSs:'#c99064',skinM:'#d99a70',skinMs:'#b87a52',
};
export const DISPLAY="'Bricolage', 'Inter', sans-serif";
export const BODY="'Inter', sans-serif";

// Fonts are loaded through the FontFace API and gate rendering. FilmInter is the name the real-UI snapshots reference.
let fontsReady:Promise<unknown>|null=null;
export function Fonts(){
 const [gate]=React.useState(()=>delayRender('V5 fonts',{timeoutInMilliseconds:60000}));
 React.useEffect(()=>{if(!fontsReady){const inter=staticFile('fonts-v5/Inter.woff2');fontsReady=Promise.all([new FontFace('FilmInter',`url(${inter})`,{weight:'100 900'}),new FontFace('Inter',`url(${inter})`,{weight:'100 900'}),new FontFace('Bricolage',`url(${staticFile('fonts-v5/BricolageGrotesque.ttf')})`,{weight:'200 800',stretch:'75% 100%'})].map(ff=>ff.load().then(l=>{document.fonts.add(l)})))}fontsReady.then(()=>continueRender(gate)).catch(cancelRender)},[gate]);
 return null;
}

// Film grain + vignette give the flat illustration a printed, premium finish.
export function Finish({vignette=.55,grain=.07,seed=0}:{vignette?:number;grain?:number;seed?:number}){
 return <>
  <AbsoluteFill style={{background:`radial-gradient(ellipse 75% 70% at 50% 48%,#0000 55%,rgba(5,8,20,${vignette}) 100%)`,pointerEvents:'none'}}/>
  <AbsoluteFill style={{opacity:grain,mixBlendMode:'overlay',pointerEvents:'none'}}>
   <svg width="100%" height="100%"><filter id={`g${seed}`}><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed={seed} stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 1.6 -.3"/></filter><rect width="100%" height="100%" filter={`url(#g${seed})`}/></svg>
  </AbsoluteFill>
 </>;
}

// Chapter clock card: the film's spine. Big time, small day.
export function ClockCard({time,day,f,x,y,dark=true,scale=1,align='left'}:{time:string;day:string;f:number;x:number;y:number;dark?:boolean;scale?:number;align?:'left'|'center'}){
 const a=easeOut(f,0,14),digits=time.replace(/ /g,' ').split('');
 return <div style={{position:'absolute',left:x,top:y,transform:`scale(${scale})`,transformOrigin:align==='center'?'50% 0':'0 0',textAlign:align,color:dark?'#fff':P.ink,width:align==='center'?0:undefined,display:'flex',flexDirection:'column',alignItems:align==='center'?'center':'flex-start'}}>
  <div style={{fontFamily:BODY,fontSize:22,fontWeight:700,letterSpacing:5,opacity:a*.8,color:dark?P.sky:P.oaBlue,transform:`translateY(${(1-a)*10}px)`,whiteSpace:'nowrap'}}>{day.toUpperCase()}</div>
  <div style={{fontFamily:DISPLAY,fontSize:150,fontWeight:800,letterSpacing:-5,lineHeight:.95,display:'flex',whiteSpace:'nowrap',fontVariationSettings:"'wdth' 85, 'opsz' 96"}}>{digits.map((d,i)=>{const q=pop(f,i*2,20);return <span key={i} style={{display:'inline-block',transform:`translateY(${(1-q)*60}px)`,opacity:clamp((f-i*2)/6)}}>{d}</span>})}</div>
 </div>;
}

// Burned-in captions: muted viewers read the whole story here.
export function Caption({text,f,y=930,width=1500,size=46,dark=true,start=0,end=9999}:{text:string;f:number;y?:number;width?:number;size?:number;dark?:boolean;start?:number;end?:number}){
 if(f<start||f>end)return null;
 const a=easeOut(f,start,start+8)*out(f,end-6,end);
 return <div style={{position:'absolute',left:0,right:0,top:y,display:'flex',justifyContent:'center',opacity:a,transform:`translateY(${(1-a)*14}px)`}}>
  <div style={{maxWidth:width,padding:'14px 30px 16px',borderRadius:20,background:dark?'rgba(6,10,24,.72)':'rgba(255,255,255,.86)',backdropFilter:'blur(8px)',color:dark?'#fff':P.ink,fontFamily:BODY,fontWeight:650,fontSize:size,lineHeight:1.22,letterSpacing:-.4,textAlign:'center',boxShadow:'0 10px 40px rgba(0,0,0,.25)'}}>{text}</div>
 </div>;
}

// The tool belt HUD: every feature that saves Tony snaps on as a badge.
export const BADGES=['Takeoff','Estimate','E-sign','Deposit','Schedule','Time clock','AIVA catch','Daily report','Client portal','Change order','Punch list','Invoice','Bank feed','Job costing','Reports'] as const;
export function Belt({count,f=9999,lastAt=-99,x=60,y=1010,scale=1,inline=false}:{count:number;f?:number;lastAt?:number;x?:number;y?:number;scale?:number;inline?:boolean}){
 const shown=BADGES.slice(0,count);
 return <div style={{position:inline?'relative':'absolute',left:inline?0:x,top:inline?0:y,transform:`scale(${scale})`,transformOrigin:inline?'50% 50%':'0 100%',display:'flex',alignItems:'center',gap:0}}>
  <div style={{position:'absolute',left:-16,right:-16,top:'50%',height:20,marginTop:-10,borderRadius:10,background:'linear-gradient(#8a5b34,#6d4426 55%,#5a361d)',boxShadow:'inset 0 1px 0 #b98457,0 6px 18px rgba(0,0,0,.35)'}}/>
  <div style={{position:'absolute',left:-16,right:-16,top:'50%',height:0,borderTop:'2px dashed rgba(255,214,160,.35)',marginTop:-1}}/>
  <div style={{position:'relative',width:44,height:44,marginRight:10,borderRadius:10,background:'linear-gradient(#e8c06a,#b98a30)',boxShadow:'inset 0 0 0 5px #6d4426,0 4px 10px rgba(0,0,0,.4)'}}/>
  {shown.map((b,i)=>{const isNew=i===count-1&&f-lastAt<30;const q=isNew?pop(f,lastAt,22):1;return <div key={b} style={{position:'relative',marginRight:8,padding:'8px 14px 9px',borderRadius:12,background:i===6?'linear-gradient(#3ba4e0,#0284c7)':'linear-gradient(#ffffff,#e9eef3)',color:i===6?'#fff':P.ink,fontFamily:BODY,fontSize:17,fontWeight:700,letterSpacing:-.1,whiteSpace:'nowrap',boxShadow:'0 4px 0 rgba(0,0,0,.18),0 8px 18px rgba(0,0,0,.28)',transform:`translateY(${(1-q)*-80}px) rotate(${(1-q)*-12}deg) scale(${.6+.4*q})`,opacity:clamp(q*2)}}>{b}</div>})}
 </div>;
}

// AIVA from the supplied official layers only (body, eyes, glasses). Glasses = OfficeAdmin mark.
export function Aiva({size,glasses=1,blink=1,shine=0,style={}}:{size:number;glasses?:number;blink?:number;shine?:number;style?:CSSProperties}){
 const img=(file:string,s:CSSProperties={})=><Img src={staticFile('brand/v4/'+file)} style={{position:'absolute',inset:0,width:'100%',height:'100%',...s}}/>;
 return <div style={{position:'relative',width:size,height:size,filter:'drop-shadow(0 14px 30px rgba(0,0,0,.35))',...style}}>
  {img('body.png')}
  {img('eye-left.png',{transform:`scaleY(${blink})`,transformOrigin:'37.9585% 59.4099%'})}
  {img('eye-right.png',{transform:`scaleY(${blink})`,transformOrigin:'61.6826% 59.4099%'})}
  <div style={{position:'absolute',inset:0,transform:`translate(${(1-glasses)*size*.28}px,${(1-glasses)*-size*.48}px) rotate(${(1-glasses)*-18}deg)`,opacity:clamp(glasses*3)}}>
   {img('glasses.png')}
   {shine>0&&shine<1&&<div style={{position:'absolute',inset:0,opacity:Math.sin(Math.PI*shine)*.5,clipPath:`polygon(${-28+shine*148}% 0%,${-8+shine*148}% 0%,${12+shine*148}% 100%,${-8+shine*148}% 100%)`}}>{img('glasses-highlight.png')}</div>}
  </div>
 </div>;
}
// Blink curve: 1 open, ~0.08 closed, 5 frames total.
export const blinkAt=(f:number,at:number)=>{const d=f-at;if(d<0||d>6)return 1;return [1,.55,.08,.08,.5,.85,1][d]};

export function Logo({width,style={}}:{width:number;style?:CSSProperties}){return <Img src={staticFile('brand/oa-dark-trim.png')} style={{width,height:'auto',...style}}/>}

export function Glow({x,y,r,color,opacity=1}:{x:number;y:number;r:number;color:string;opacity?:number}){return <div style={{position:'absolute',left:x-r,top:y-r,width:r*2,height:r*2,borderRadius:'50%',background:`radial-gradient(circle,${color} 0%,${color}00 70%)`,opacity,pointerEvents:'none'}}/>}

export function Abs({x,y,w,h,children,style={}}:{x:number;y:number;w?:number;h?:number;children?:ReactNode;style?:CSSProperties}){return <div style={{position:'absolute',left:x,top:y,width:w,height:h,...style}}>{children}</div>}

// Illustrated message bubble for texts between people (not product UI).
export function TextBubble({from,body,time,x,y,w=620,f=9999,at=0,scale=1,incoming=true}:{from:string;body:string;time:string;x:number;y:number;w?:number;f?:number;at?:number;scale?:number;incoming?:boolean}){
 const q=pop(f,at,22),a=clamp((f-at)/5);
 return <div style={{position:'absolute',left:x,top:y,width:w,transform:`translateY(${(1-q)*40}px) scale(${(.85+.15*q)*scale})`,transformOrigin:incoming?'0 0':'100% 0',opacity:a}}>
  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10,justifyContent:incoming?'flex-start':'flex-end'}}>
   <div style={{width:40,height:40,borderRadius:20,background:incoming?'linear-gradient(135deg,#ff9a8b,#ff6a88)':'linear-gradient(135deg,#3ba4e0,#0284c7)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:BODY,fontWeight:800,fontSize:17}}>{from.split(' ').map(s=>s[0]).join('')}</div>
   <div style={{fontFamily:BODY,fontSize:21,fontWeight:700,color:'#fff'}}>{from}</div>
   <div style={{fontFamily:BODY,fontSize:18,color:'rgba(255,255,255,.6)'}}>{time}</div>
  </div>
  <div style={{padding:'20px 26px 22px',borderRadius:30,borderTopLeftRadius:incoming?8:30,borderTopRightRadius:incoming?30:8,background:incoming?'#fff':'linear-gradient(#3ba4e0,#0284c7)',color:incoming?P.ink:'#fff',fontFamily:BODY,fontSize:33,fontWeight:560,lineHeight:1.28,letterSpacing:-.3,boxShadow:'0 20px 60px rgba(0,0,0,.35)'}}>{body}</div>
 </div>;
}
