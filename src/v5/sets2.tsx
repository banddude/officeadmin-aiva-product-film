import React from 'react';
import {P} from './kit';
import {TonyHead} from './people';

const S=({children}:{children:React.ReactNode})=> <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>{children}</svg>;

// Jen's kitchen. done=false: dated morning kitchen. done=true: finished remodel, new lights glowing.
export function JenKitchen({done=false}:{done?:boolean}){
 return <S>
  <defs>
   <linearGradient id="jkW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={done?'#f6efe2':'#efe2c9'}/><stop offset="1" stopColor={done?'#ece2d0':'#e2d1b2'}/></linearGradient>
   <radialGradient id="jkSun" cx="1650" cy="160" r="1400" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff2cf" stopOpacity=".75"/><stop offset="1" stopColor="#fff2cf" stopOpacity="0"/></radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#jkW)"/>
  {/* window */}
  <rect x="1240" y="150" width="440" height="330" rx="10" fill="#bfe3f5"/><path d="M1240,380 C1360,350 1500,390 1680,360 L1680,480 L1240,480Z" fill="#9fcf8f"/><rect x="1232" y="142" width="456" height="346" rx="12" fill="none" stroke="#fff" strokeWidth="16"/>
  {/* upper cabinets */}
  {[120,330,540,750].map(x=><g key={x}><rect x={x} y="120" width="190" height="250" rx="8" fill={done?'#3f6f7a':'#c9a77a'}/><rect x={x+12} y="132" width="166" height="226" rx="6" fill={done?'#4a7f8b':'#d4b48a'}/><rect x={x+150} y="250" width="6" height="40" rx="3" fill={done?'#e8d9b8':'#8a6a44'}/></g>)}
  {done&&[200,420,640,860].map(x=><g key={x}><rect x={x} y="368" width="120" height="8" rx="3" fill="#fff6d0"/><path d={`M${x-20},376 L${x+140},376 L${x+200},560 L${x-80},560Z`} fill="#fff6d0" opacity=".22"/></g>)}
  {/* recessed lights in ceiling (done) */}
  {done&&[300,700,1100,1500].map(x=><g key={x}><ellipse cx={x} cy="40" rx="34" ry="10" fill="#fff8dc"/><path d={`M${x-34},40 L${x+34},40 L${x+140},420 L${x-140},420Z`} fill="#fff8dc" opacity=".14"/></g>)}
  {/* counter + lower cabinets */}
  <rect x="80" y="560" width="1120" height="36" rx="6" fill={done?'#f4f1ea':'#b48a5a'}/>
  <rect x="96" y="596" width="1090" height="300" fill={done?'#3f6f7a':'#c9a77a'}/>
  {[110,380,650,920].map(x=><rect key={x} x={x} y="616" width="250" height="260" rx="8" fill={done?'#4a7f8b':'#d4b48a'}/>)}
  {/* backsplash */}
  <rect x="80" y="376" width="1120" height="184" fill={done?'#e9eef0':'#e8d6b4'}/>
  {done?<g opacity=".5">{Array.from({length:14},(_,i)=><path key={i} d={`M${80+i*80},376 L${80+i*80},560`} stroke="#cfd8dc" strokeWidth="3"/>)}</g>:<g>{Array.from({length:7},(_,i)=><rect key={i} x={120+i*150} y="420" width="110" height="110" fill="#d9c49c"/>)}</g>}
  {/* outlets */}
  {[300,760].map(x=><g key={x}><rect x={x} y="450" width="40" height="60" rx="6" fill="#fff"/><rect x={x+10} y="462" width="20" height="14" rx="3" fill={done?'#ef5a4c':'#bbb'}/><rect x={x+10} y="482" width="20" height="14" rx="3" fill="#bbb"/></g>)}
  {/* coffee machine + mugs */}
  <rect x="980" y="470" width="120" height="90" rx="10" fill="#2a2f3a"/><rect x="1000" y="490" width="80" height="40" rx="6" fill="#4a5262"/>
  <rect y="896" width="1920" height="184" fill={done?'#d9cbb2':'#b9a07a'}/>
  {/* island (front) */}
  <rect x="1180" y="700" width="760" height="40" rx="8" fill={done?'#f4f1ea':'#b48a5a'}/><rect x="1196" y="740" width="740" height="340" fill={done?'#2f5b66':'#a98a5f'}/>
  <rect width="1920" height="1080" fill="url(#jkSun)" style={{mixBlendMode:'screen'}}/>
 </S>;
}

// Jen's office: desk, monitor, plant, window light.
export function Office(){
 return <S>
  <rect width="1920" height="1080" fill="#e9eef3"/>
  <rect x="1100" y="120" width="620" height="460" rx="10" fill="#cfe6f3"/><path d="M1100,420 L1260,300 L1380,380 L1500,260 L1720,400 L1720,580 L1100,580Z" fill="#a9c7d8"/><rect x="1092" y="112" width="636" height="476" rx="12" fill="none" stroke="#fff" strokeWidth="16"/>
  <rect x="140" y="170" width="300" height="200" rx="8" fill="#d6dee6"/><rect x="160" y="190" width="260" height="160" rx="4" fill="#f4f7fa"/>
  <rect y="760" width="1920" height="320" fill="#c9d3dd"/>
  <rect x="200" y="700" width="1500" height="40" rx="8" fill="#8b6a4a"/><rect x="230" y="740" width="30" height="340" fill="#6d5238"/><rect x="1640" y="740" width="30" height="340" fill="#6d5238"/>
  <rect x="1180" y="420" width="380" height="250" rx="14" fill="#1f2937"/><rect x="1196" y="436" width="348" height="210" rx="6" fill="#3b82f6" opacity=".25"/><rect x="1350" y="670" width="40" height="34" fill="#374151"/>
  <g transform="translate(1660,560)"><rect x="-40" y="80" width="80" height="60" rx="10" fill="#c26b4a"/><path d="M0,80 C-40,20 -60,-20 -20,-60 M0,80 C20,10 40,-40 10,-80 M0,80 C40,30 70,0 60,-50" stroke="#3f7d4f" strokeWidth="18" fill="none" strokeLinecap="round"/></g>
  <rect x="380" y="640" width="260" height="60" rx="10" fill="#f8fafc"/><rect x="700" y="660" width="120" height="40" rx="8" fill="#e2e8f0"/>
 </S>;
}

// Jen's house exterior, morning, with Tony's van.
export function Exterior({morning=true}:{morning?:boolean}){
 return <S>
  <defs><linearGradient id="exSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={morning?'#ffd9a8':'#bfe3f5'}/><stop offset="1" stopColor={morning?'#ffeccf':'#e8f4fa'}/></linearGradient></defs>
  <rect width="1920" height="1080" fill="url(#exSky)"/>
  <circle cx="1600" cy="220" r="90" fill="#fff3c4" opacity=".9"/>
  <rect y="760" width="1920" height="320" fill="#8fbf7a"/><rect y="840" width="1920" height="240" fill="#9a9a96"/>
  {/* house */}
  <path d="M120,420 L520,180 L920,420Z" fill="#7a5a48"/><rect x="170" y="420" width="700" height="360" fill="#f1e4cf"/>
  <rect x="460" y="560" width="120" height="220" rx="6" fill="#3f6f7a"/><circle cx="560" cy="670" r="7" fill="#e8c06a"/>
  <rect x="230" y="500" width="160" height="130" rx="6" fill="#bfe3f5"/><rect x="650" y="500" width="160" height="130" rx="6" fill="#bfe3f5"/>
  <text x="520" y="460" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="34" fill="#7a5a48">2140</text>
  {/* van */}
  <g transform="translate(1040,560)">
   <path d="M0,60 C0,20 30,0 70,0 L520,0 C560,0 600,30 620,70 L700,130 C720,145 730,170 730,190 L730,260 L0,260Z" fill="#f8fafc"/>
   <path d="M530,20 L600,80 L660,130 L530,130Z" fill="#9fc7dc"/>
   <rect x="0" y="150" width="730" height="26" fill={P.oaBlue}/>
   <text x="260" y="110" textAnchor="middle" fontFamily="Bricolage, Inter" fontWeight="800" fontSize="58" fill="#0f172a">VELA</text>
   <text x="260" y="140" textAnchor="middle" fontFamily="Inter" fontWeight="700" fontSize="22" letterSpacing="6" fill="#475467">ELECTRIC</text>
   <circle cx="150" cy="260" r="52" fill="#1f2937"/><circle cx="150" cy="260" r="24" fill="#9ca3af"/><circle cx="590" cy="260" r="52" fill="#1f2937"/><circle cx="590" cy="260" r="24" fill="#9ca3af"/>
  </g>
  <g fill="#5f9a54">{[100,260,900,980].map(x=><ellipse key={x} cx={x} cy="760" rx="80" ry="50"/>)}</g>
 </S>;
}

// Saturday tee-ball. Bleachers, sunset sky.
export function Ballfield(){
 return <S>
  <defs><linearGradient id="bfSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb87a"/><stop offset=".6" stopColor="#ffd9a8"/><stop offset="1" stopColor="#fff0d6"/></linearGradient></defs>
  <rect width="1920" height="1080" fill="url(#bfSky)"/>
  <rect y="520" width="1920" height="560" fill="#7fb36a"/>
  <path d="M960,560 L1500,800 L960,1040 L420,800Z" fill="#c9965e"/><path d="M960,600 L1420,800 L960,1000 L500,800Z" fill="#8fc27a"/>
  {[[960,560],[1500,800],[420,800]].map(([x,y],i)=><rect key={i} x={x-16} y={y-16} width="32" height="32" fill="#fff" transform={`rotate(45 ${x} ${y})`}/>)}
  <path d="M0,520 L1920,520" stroke="#e9e1d0" strokeWidth="10"/>
  {Array.from({length:18},(_,i)=><rect key={i} x={i*110} y="430" width="8" height="90" fill="#9aa3ad"/>)}
  <path d="M0,440 L1920,440" stroke="#9aa3ad" strokeWidth="4"/>
  {/* bleachers foreground */}
  {[0,1,2].map(i=><rect key={i} x="-20" y={900+i*60} width="1960" height="26" rx="6" fill="#b8c2cc"/>)}
 </S>;
}

// Tony asleep (or waking) in bed; drawn over the Bedroom set.
export function TonyInBed({wake=0,arm=0}:{wake?:number;arm?:number}){
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
  <ellipse cx="520" cy="640" rx="260" ry="70" fill="#e8ecf8"/>
  <g transform="translate(280,410) rotate(-80 345 180) scale(.9)"><TonyHead face={wake>.5?{eyes:'down',brows:'worried',mouth:'flat'}:{eyes:'closed',brows:'flat',mouth:'flat'}}/></g>
  <path d="M640,620 C760,560 1100,560 1420,600 L1440,860 L600,860Z" fill="#4a5ba8"/>
  <path d="M660,640 C800,600 1100,600 1400,630" stroke="#6070c0" strokeWidth="8" fill="none"/>
  <g transform={`translate(${760+arm*420},${640-arm*40}) rotate(${-10+arm*-8})`}><path d="M-60,0 L120,0" stroke="#b5532f" strokeWidth="46" strokeLinecap="round"/><ellipse cx="140" cy="0" rx="26" ry="22" fill={P.skinT}/></g>
 </svg>;
}
