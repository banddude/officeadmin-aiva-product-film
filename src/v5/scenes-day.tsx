import React,{type ReactNode} from 'react';
import {AbsoluteFill} from 'remotion';
import {P,BODY,ease,easeOut,pop,clamp,Finish,ClockCard,Caption,Belt} from './kit';
import {Lit,DAY,Person,SAM,RAY} from './people';
import {KitchenWall} from './sets-day';

const Flashlight=()=> <g transform="translate(0,14) rotate(90)"><rect x="-10" y="-13" width="58" height="26" rx="8" fill="#2a2f3a"/><rect x="44" y="-19" width="22" height="38" rx="6" fill="#3a404c"/><rect x="64" y="-15" width="6" height="30" rx="2" fill="#fff6c8"/></g>;

// Day 3, 10:05 AM. Sam opens the wall: old cloth wiring. Not in the estimate.
export function WallSurprise({f,ui,belt=9}:{f:number;ui?:ReactNode;belt?:number}){
 const zoom=ease(f,0,90),shake=f>=18&&f<26?Math.sin(f*3)*5:0,uiIn=easeOut(f,40,64);
 return <AbsoluteFill style={{background:P.day,overflow:'hidden'}}>
  <AbsoluteFill style={{transform:`scale(${1.02+zoom*.04}) translate(${shake}px,0)`,transformOrigin:'35% 50%'}}>
   <KitchenWall beam={f<10?0:1}/>
   <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
    {/* flashlight cone */}
    <path d="M470,470 L600,330 L700,560Z" fill="#fff6c8" opacity={f<10?0:.2}/>
    <g transform="translate(-40,140) scale(1.32)"><Lit id="sam" w={400} h={900} light={DAY} cast={{dx:46,dy:-18,opacity:.22,blur:14}}><Person o={SAM} face={f<18?{eyes:'open',brows:'flat',mouth:'flat',look:5}:{eyes:'wide',brows:'up',mouth:'o',look:6}} armR={112} foreR={-28} armL={4} foreL={-6} lean={3} headTurn={2} hold={<Flashlight/>}/></Lit></g>
    <g transform="translate(1040,330) scale(1.12)"><Lit id="ray" w={400} h={900} light={DAY} cast={{dx:40,dy:-14,opacity:.2,blur:14}}><Person o={RAY} face={f<24?{eyes:'open',brows:'flat',mouth:'flat',look:-6}:{eyes:'open',brows:'worried',mouth:'grimace',look:-6}} armL={150} foreL={95} armR={14} foreR={30} headTurn={-2} headTilt={-4}/></Lit></g>
   </svg>
  </AbsoluteFill>
  <Finish seed={4} vignette={.25} grain={.06}/>
  {ui&&<div style={{position:'absolute',left:1190,top:70,width:700,opacity:uiIn,transform:`translateX(${(1-uiIn)*80}px) rotate(${(1-uiIn)*3}deg)`}}>{ui}</div>}
  <ClockCard time="10:05 AM" day="Day 3 · Calder Kitchen" f={f} x={96} y={60} dark={false}/>
  <Belt count={belt} x={70} y={1000} scale={.8}/>
  <Caption f={f} start={20} y={880} text="Sam opens the wall. Old cloth wiring. That's not in the estimate."/>
 </AbsoluteFill>;
}
