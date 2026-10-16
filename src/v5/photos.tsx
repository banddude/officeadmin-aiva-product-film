import React from 'react';
import {AbsoluteFill} from 'remotion';

// Illustrated "site photos" (960x720) attached to the fictional daily report. Same illustrated world as the film.
const Wrap=({children,bg}:{children:React.ReactNode;bg:string})=> <AbsoluteFill style={{background:bg}}><svg width="960" height="720" viewBox="0 0 960 720">{children}</svg><AbsoluteFill style={{background:'radial-gradient(ellipse 80% 75% at 50% 45%,#0000 55%,rgba(0,0,0,.35))'}}/></AbsoluteFill>;
const studs=(xs:number[],y=0,h=720)=>xs.map(x=><g key={x}><rect x={x} y={y} width="56" height={h} fill="#d2a066"/><rect x={x+40} y={y} width="16" height={h} fill="#b07c45"/></g>);

export function PhotoRangeWall(){return <Wrap bg="#3b2a1d">
 {studs([90,330,570,810])}
 <rect x="0" y="330" width="960" height="44" fill="#c4904f"/>
 {[[180,250],[420,250],[660,250]].map(([x,y])=><g key={x}><rect x={x} y={y} width="70" height="104" rx="6" fill="#2f6fd6"/><rect x={x+12} y={y+14} width="46" height="76" rx="4" fill="#1f56b0"/></g>)}
 <path d="M0,200 C120,190 170,240 215,250 M250,300 C320,330 380,240 455,250 M490,300 C560,330 620,240 695,250 M730,300 C820,320 900,250 960,240" stroke="#f2c230" strokeWidth="14" fill="none" strokeLinecap="round"/>
 <path d="M0,214 C120,204 170,254 215,264" stroke="#d9a51c" strokeWidth="5" fill="none" opacity=".7"/>
 <rect x="0" y="620" width="960" height="100" fill="#cdb796"/>
</Wrap>}
export function PhotoSubpanel(){return <Wrap bg="#e7dccb">
 <rect x="280" y="80" width="400" height="560" rx="14" fill="#9aa1a8"/><rect x="300" y="100" width="360" height="520" rx="8" fill="#5f666e"/>
 {Array.from({length:10},(_,i)=><g key={i}><rect x="330" y={130+i*46} width="130" height="34" rx="5" fill={i===7?'#2a2a2a':'#1d1f22'}/><rect x="500" y={130+i*46} width="130" height="34" rx="5" fill={i===2||i===3?'#2a2a2a':'#1d1f22'}/><rect x="440" y={140+i*46} width="14" height="14" rx="2" fill="#e8e8e8"/><rect x="606" y={140+i*46} width="14" height="14" rx="2" fill="#e8e8e8"/></g>)}
 <rect x="472" y="110" width="16" height="500" fill="#c9a24a"/>
 <path d="M330,654 C330,690 360,710 400,720 M600,654 C600,690 640,700 700,720" stroke="#f2c230" strokeWidth="12" fill="none"/>
 <rect x="560" y="40" width="160" height="40" rx="6" fill="#fff"/><text x="640" y="68" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="22" fill="#b42318">SUBPANEL A</text>
</Wrap>}
export function PhotoEvRoute(){return <Wrap bg="#d8d4cc">
 <rect x="0" y="560" width="960" height="160" fill="#a9a59c"/>
 <path d="M120,80 L120,420 Q120,460 160,460 L760,460" stroke="#9aa3ad" strokeWidth="22" fill="none" strokeLinecap="round"/>
 {[200,320,440,560,680].map(x=><rect key={x} x={x} y="448" width="14" height="26" rx="3" fill="#6f7680"/>)}
 <rect x="740" y="380" width="120" height="170" rx="18" fill="#1f2937"/><rect x="760" y="410" width="80" height="56" rx="8" fill="#38bdf8"/><circle cx="800" cy="500" r="18" fill="#10b981"/>
 <rect x="60" y="40" width="120" height="70" rx="8" fill="#64748b"/>
 <text x="480" y="640" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="34" fill="#4b4740" opacity=".6">GARAGE</text>
</Wrap>}
export function PhotoReceipt(){return <Wrap bg="#7b5a3e">
 <g transform="rotate(-6 480 360)"><rect x="300" y="60" width="360" height="600" fill="#fbf8f0"/>
 <text x="480" y="120" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="28" fill="#222">SUPPLY HOUSE</text>
 {['12/2 NM-B 250FT','GFCI 20A x6','4/0 LUG KIT','LED CAN 6IN x12','BREAKER 20A x4','WIRE NUTS'].map((t,i)=><g key={t}><text x="330" y={190+i*56} fontFamily="Inter" fontSize="22" fill="#333">{t}</text><text x="630" y={190+i*56} textAnchor="end" fontFamily="Inter" fontSize="22" fill="#333">{['$118.40','$97.20','$22.10','$214.80','$41.60','$8.90'][i]}</text></g>)}
 <path d="M330,540 L630,540" stroke="#222" strokeWidth="2"/><text x="330" y="584" fontFamily="Inter" fontWeight="800" fontSize="26" fill="#222">TOTAL</text><text x="630" y="584" textAnchor="end" fontFamily="Inter" fontWeight="800" fontSize="26" fill="#222">$503.00</text></g>
</Wrap>}
