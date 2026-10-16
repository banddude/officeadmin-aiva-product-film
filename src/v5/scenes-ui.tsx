import React,{type CSSProperties,type ReactNode} from 'react';
import {AbsoluteFill,Img,staticFile} from 'remotion';
import {P,BODY,ease,easeOut,pop,lerp,clamp,Finish,ClockCard,Caption,Belt,Aiva,blinkAt,Glow} from './kit';
import {UiDom} from './dom';
import {Bedroom} from './sets';

// A real-UI fragment presented as a floating card at a given scale.
export function Card({name,frag,scale=1,w,h,style={},radius=16,pad=0,bg='#fff'}:{name:string;frag:string;scale?:number;w:number;h:number;style?:CSSProperties;radius?:number;pad?:number;bg?:string}){
 return <div style={{width:(w+pad*2)*scale,height:(h+pad*2)*scale,borderRadius:radius,overflow:'hidden',background:bg,boxShadow:'0 30px 80px rgba(3,8,24,.45),0 2px 6px rgba(3,8,24,.25)',...style}}>
  <div style={{transform:`scale(${scale})`,transformOrigin:'0 0',width:w+pad*2,height:h+pad*2,padding:pad,boxSizing:'border-box'}}><UiDom name={name} fragment={frag}/></div>
 </div>;
}
// A crop of a real screenshot (source px), shown at display width.
export function Shot({src,x,y,w,h,dw,style={}}:{src:string;x:number;y:number;w:number;h:number;dw:number;style?:CSSProperties}){
 const k=dw/w;
 return <div style={{width:dw,height:h*k,overflow:'hidden',position:'relative',borderRadius:18,background:'#fff',boxShadow:'0 30px 80px rgba(3,8,24,.5)',...style}}>
  <Img src={staticFile(src)} style={{position:'absolute',left:-x*k,top:-y*k,width:3840*k,height:2160*k,maxWidth:'none'}}/>
 </div>;
}

// 9:22 PM. AIVA prices the job from Tuesday's takeoff and the price book.
export function TakeoffEstimate({f}:{f:number}){
 const plan=easeOut(f,0,20),push=ease(f,0,140),lines=[0,1,2,3,4,5];
 return <AbsoluteFill style={{background:'radial-gradient(ellipse 90% 80% at 30% 40%,#18264f,#0a1024 75%)',overflow:'hidden'}}>
  <Finish seed={3} vignette={.35}/>
  {/* real takeoff: plan crop with marks */}
  <div style={{position:'absolute',left:70,top:250,opacity:plan,transform:`perspective(2200px) rotateY(${lerp(14,6,push)}deg) scale(${lerp(.94,1,push)})`,transformOrigin:'0 50%'}}>
   <Shot src="ui-v5/takeoff-desktop-zoom.png" x={0} y={0} w={3100} h={1700} dw={900}/>
   <div style={{position:'absolute',left:14,top:-46,fontFamily:BODY,fontWeight:700,fontSize:20,letterSpacing:3,color:P.sky}}>TAKEOFF · TUESDAY'S WALK-THROUGH</div>
  </div>
  {/* count chips from the real takeoff table */}
  <div style={{position:'absolute',left:110,top:780,display:'flex',flexWrap:'wrap',gap:12,width:860}}>
   {[['#2f6fed','12','Recessed LED downlight'],['#16a34a','6','GFCI countertop receptacle'],['#0ea5b7','3','Under-cabinet LED run'],['#9333ea','3','Appliance circuit'],['#ea580c','3','Dimmer switch'],['#dc2626','1','EV charger circuit, 60A']].map(([c,n,t],i)=>{const q=pop(f,14+i*6,20);return <div key={t} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 16px 10px 12px',borderRadius:14,background:'#fff',fontFamily:BODY,fontSize:21,fontWeight:650,color:P.ink,boxShadow:'0 8px 24px rgba(0,0,0,.3)',transform:`translateY(${(1-q)*30}px)`,opacity:clamp(q*2)}}><span style={{width:12,height:12,borderRadius:6,background:c}}/><span style={{fontWeight:800}}>{n}</span><span style={{color:'#475467'}}>{t}</span></div>})}
  </div>
  {/* real estimate sheet lines generated from the takeoff */}
  <div style={{position:'absolute',left:1040,top:170,width:820}}>
   <Card name="takeoff-estimate-preview" frag="sheet-header" w={671} h={65} scale={1.22} radius={14} style={{marginBottom:10,opacity:easeOut(f,10,24)}}/>
   {lines.map(i=>{const q=pop(f,24+i*7,24);return <div key={i} style={{marginBottom:12,transform:`translateX(${(1-q)*220}px)`,opacity:clamp(q*2)}}><Card name="takeoff-estimate-preview" frag={`sheet-line-${i}`} w={637} h={i===0?133:113} scale={1.22} radius={14} style={{height:51*1.22,boxShadow:'0 14px 34px rgba(3,8,24,.35)'}}/></div>})}
  </div>
  <div style={{position:'absolute',left:1330,top:780,padding:'16px 28px',borderRadius:20,background:'#fff',boxShadow:'0 20px 60px rgba(0,0,0,.45)',transform:`scale(${.9+.1*pop(f,70,20)})`,opacity:easeOut(f,66,76)}}>
   <div style={{transform:'scale(2.1)',transformOrigin:'0 0',width:108,height:20}}><UiDom name="takeoff-estimate-preview" fragment="sheet-total"/></div>
   <div style={{width:230,height:24}}/>
  </div>
  <ClockCard time="9:22 PM" day="Wednesday" f={f+30} x={70} y={40} scale={.62}/>
  <Belt count={2} f={f} lastAt={60} x={70} y={1014} scale={.8}/>
  <Caption f={f} start={30} y={972} size={40} width={1300} text="Tuesday's takeoff. His price book. Every line priced."/>
 </AbsoluteFill>;
}

// Sunday 11:48 PM. AIVA's nightly read of the job catches the unpaid deposit before Monday's 7 AM start.
export function LateCatch({f}:{f:number}){
 const a=easeOut(f,0,20),card1=pop(f,16,26),card2=pop(f,40,26),blink=Math.min(blinkAt(f,8),blinkAt(f,64));
 return <AbsoluteFill style={{background:P.navy,overflow:'hidden'}}>
  <AbsoluteFill style={{filter:'blur(5px) brightness(.55)',transform:'scale(1.08)'}}><Bedroom/></AbsoluteFill>
  <Finish seed={5} vignette={.5}/>
  <Glow x={260} y={520} r={360} color="#3ba4e0" opacity={.35*a}/>
  <div style={{position:'absolute',left:90,top:330,opacity:a}}><Aiva size={330} glasses={1} blink={blink} shine={clamp((f-10)/20)}/></div>
  <div style={{position:'absolute',left:470,top:270,transform:`translateY(${(1-card1)*50}px)`,opacity:clamp(card1*2),transformOrigin:'0 0'}}>
   <Card name="status-card" frag="status-card" w={1136} h={128} scale={1.2} radius={18} bg="#fffaf0"/>
  </div>
  <div style={{position:'absolute',left:470,top:500,transform:`translateY(${(1-card2)*50}px)`,opacity:clamp(card2*2)}}>
   <div style={{fontFamily:BODY,fontWeight:700,fontSize:20,letterSpacing:3,color:P.sky,marginBottom:12}}>AIVA DRAFTED A REMINDER · WAITING FOR TONY</div>
   <Card name="draft-catch-pending" frag="draft-catch" w={976} h={160} scale={1.32} radius={18}/>
  </div>
  <ClockCard time="11:48 PM" day="Sunday" f={f+30} x={90} y={40} scale={.78}/>
  <Belt count={7} f={f} lastAt={40} x={70} y={1014} scale={.8}/>
  <Caption f={f} start={24} y={890} text="Crew starts at 7 AM. The deposit never came in. AIVA caught it."/>
 </AbsoluteFill>;
}
