import React from 'react';
import {AbsoluteFill} from 'remotion';
import {P,DISPLAY,BODY,ease,easeOut,out,pop,lerp,clamp,Finish,ClockCard,Caption,TextBubble,Aiva,blinkAt,Glow,Belt,Logo,BADGES} from './kit';
import {Lit,NIGHT_TV,TonyCouch,type Face} from './people';
import {LivingRoom} from './sets';
import story from '../../production/v5/story-data.json';

// 0:00 Hook. 9:14 PM. Jen's text lands while Tony is pinned under a sleeping Mia.
export function HookCouch({f}:{f:number}){
 const push=ease(f,0,150),buzz=f>=12&&f<30?Math.sin(f*2.2)*4:0;
 const face:Face=f<14?{eyes:'down',brows:'flat',mouth:'flat'}:f<112?{eyes:'open',brows:'up',mouth:'o'}:{eyes:'down',brows:'worried',mouth:'grimace'};
 return <AbsoluteFill style={{background:P.navy,overflow:'hidden'}}>
  <AbsoluteFill style={{transform:`scale(${1.04+push*.05}) translate(${-push*18}px,${-push*8}px)`,transformOrigin:'40% 60%'}}>
   <div style={{position:'absolute',inset:0,filter:'blur(1.6px)'}}><LivingRoom/></div>
   <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
    <g transform={`translate(${430+buzz*.3},138)`}><Lit id="tonyHook" w={700} h={780} light={NIGHT_TV} cast={{dx:-38,dy:-6,opacity:.35,blur:16}}><TonyCouch face={face} phoneGlow={f<12?.4:1}/></Lit></g>
   </svg>
   <Glow x={777} y={560} r={160} color="#cfe9ff" opacity={f<12?.25:.55}/>
  </AbsoluteFill>
  <Finish seed={1}/>
  <ClockCard time="9:14 PM" day="Wednesday" f={f} x={96} y={70}/>
  <TextBubble from="Jen Calder" time="now" x={1180} y={210} w={640} f={f} at={10} body="Hey Tony! Picking a contractor tomorrow AM. Any chance you can price the kitchen + EV charger tonight?"/>
  <TextBubble from="Jen Calder" time="now" x={1180} y={560} w={520} f={f} at={52} body="Got 2 other quotes coming 🙃"/>
  <Caption f={f} start={70} text="Meet Tony. Electrician. Dad. Pinned under a sleeping six-year-old."/>
 </AbsoluteFill>;
}

// 0:12 AIVA arrives. Glasses slide on, blink, she offers to price it.
export function AivaArrives({f}:{f:number}){
 const g=pop(f,6,30),blink=Math.min(blinkAt(f,40),blinkAt(f,92)),shine=clamp((f-30)/24),halo=easeOut(f,0,30);
 return <AbsoluteFill style={{background:P.navy,overflow:'hidden'}}>
  <AbsoluteFill style={{transform:'scale(1.55) translate(-60px,-40px)',transformOrigin:'40% 55%',filter:'blur(7px) brightness(.62)'}}>
   <LivingRoom/>
  </AbsoluteFill>
  <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
   <g transform="translate(-80,250) scale(1.35)"><Lit id="tonyAiva" w={700} h={780} light={{...NIGHT_TV,under:{color:'#cfe9ff',amt:.4,x:.5,y:.52,r:.28}}}><TonyCouch face={f<20?{eyes:'down',brows:'worried',mouth:'flat'}:{eyes:'open',brows:'up',mouth:'grin',look:4}} mia={true}/></Lit></g>
  </svg>
  <Finish seed={2}/>
  <Glow x={390} y={790} r={260} color="#bfe6ff" opacity={.6}/>
  {/* light beam from phone to AIVA */}
  <div style={{position:'absolute',left:430,top:330,width:900,height:420,background:'linear-gradient(100deg,rgba(191,230,255,.0),rgba(191,230,255,.16) 40%,rgba(191,230,255,0) 90%)',clipPath:'polygon(0% 100%,100% 0%,100% 60%,8% 100%)',opacity:halo}}/>
  <div style={{position:'absolute',left:1080,top:150,width:560,height:560,transform:`translateY(${(1-halo)*40}px) scale(${.8+.2*halo})`,opacity:halo}}>
   <div style={{position:'absolute',inset:-90,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,164,224,.42),rgba(59,164,224,0) 66%)'}}/>
   <div style={{position:'absolute',left:40,top:60,right:40,bottom:20,borderRadius:80,background:'linear-gradient(160deg,rgba(255,255,255,.16),rgba(255,255,255,.04))',border:'2px solid rgba(160,215,255,.35)',boxShadow:'inset 0 0 60px rgba(120,200,255,.18),0 30px 80px rgba(0,0,0,.35)'}}/>
   <Aiva size={560} glasses={g} blink={blink} shine={shine}/>
  </div>
  <div style={{position:'absolute',left:1050,top:720,width:640,opacity:easeOut(f,46,60),transform:`translateY(${(1-easeOut(f,46,60))*20}px)`}}>
   <div style={{padding:'22px 30px',borderRadius:30,borderTopLeftRadius:8,background:'linear-gradient(#3ba4e0,#0284c7)',color:'#fff',fontFamily:BODY,fontSize:36,fontWeight:620,lineHeight:1.25,letterSpacing:-.3,boxShadow:'0 24px 60px rgba(0,0,0,.4)'}}>I've got her plans from Tuesday. Want a price?</div>
   <div style={{marginTop:12,fontFamily:BODY,fontSize:20,fontWeight:700,letterSpacing:3,color:P.sky}}>AIVA</div>
  </div>
  <Caption f={f} start={50} y={960} text="Meet AIVA, the assistant inside OfficeAdmin." size={40}/>
 </AbsoluteFill>;
}

// Sunday 11:48 PM. The catch: deposit unpaid, crew starts at 7. (UI cards come from real captures.)
export {Bedroom} from './sets';

// End card.
export function EndCard({f,beltCount=BADGES.length}:{f:number;beltCount?:number}){
 const peek=easeOut(f,8,36),blink=blinkAt(f,52),words=['Your','office','never','clocks','out.'];
 return <AbsoluteFill style={{background:'radial-gradient(ellipse 80% 70% at 50% 40%,#16244a,#070c18 75%)',overflow:'hidden'}}>
  <div style={{position:'absolute',left:960,top:300,transform:'translate(-50%,-50%)',width:260,height:150}}>
   <div style={{position:'absolute',left:'50%',top:lerp(80,-58,peek),width:200,height:200,transform:'translate(-50%,-50%)'}}><Aiva size={200} glasses={1} blink={blink}/></div>
   <div style={{position:'absolute',inset:0,background:'#0f1a36',borderRadius:30,boxShadow:'0 20px 60px rgba(0,0,0,.45)'}}/>
   <div style={{position:'absolute',left:30,top:12}}><Logo width={200}/></div>
  </div>
  <div style={{position:'absolute',left:0,right:0,top:430,textAlign:'center',fontFamily:DISPLAY,fontWeight:800,fontSize:116,letterSpacing:-3.5,color:'#fff',fontVariationSettings:"'wdth' 88"}}>
   {words.map((w,i)=>{const q=pop(f,20+i*5,22);return <span key={w} style={{display:'inline-block',marginRight:i<4?28:0,transform:`translateY(${(1-q)*50}px)`,opacity:clamp((f-20-i*5)/6),color:i>=3?P.sky:'#fff'}}>{w}</span>})}
  </div>
  <div style={{position:'absolute',left:0,right:0,top:590,textAlign:'center',fontFamily:BODY,fontWeight:600,fontSize:40,color:'#c9d6ea',opacity:easeOut(f,48,64)}}>OfficeAdmin, with AIVA. Built for contractors.</div>
  <div style={{position:'absolute',left:0,right:0,top:656,textAlign:'center',fontFamily:BODY,fontWeight:750,fontSize:42,color:P.sky,opacity:easeOut(f,58,72)}}>officeadmin.io</div>
  <div style={{position:'absolute',left:0,right:0,top:790,display:'flex',justifyContent:'center',opacity:easeOut(f,30,50)}}><Belt count={beltCount} inline scale={.8}/></div>
  <div style={{position:'absolute',left:0,right:0,top:968,textAlign:'center',fontFamily:BODY,fontSize:22,lineHeight:1.5,color:'#8496b4',opacity:easeOut(f,66,80)}}>AIVA is in private preview. Actual app interface. Fictional business and customer.</div>
  <Finish seed={6} vignette={.4}/>
 </AbsoluteFill>;
}
export const _story=story;
