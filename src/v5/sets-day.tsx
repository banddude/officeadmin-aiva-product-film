import React from 'react';

// Jen's kitchen mid-demo, Day 3, 10:05 AM. A drywall cut reveals old cloth-insulated wiring.
export function KitchenWall({beam=1}:{beam?:number}){
 const studs=[420,560,700,840];
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
  <defs>
   <linearGradient id="kwWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3e7d4"/><stop offset="1" stopColor="#e6d4ba"/></linearGradient>
   <linearGradient id="kwCav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b1d14"/><stop offset="1" stopColor="#3d2a1c"/></linearGradient>
   <linearGradient id="kwStud" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b98048"/><stop offset=".5" stopColor="#d7a466"/><stop offset="1" stopColor="#a8703c"/></linearGradient>
   <radialGradient id="kwSun" cx="1700" cy="120" r="1300" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff2cf" stopOpacity=".7"/><stop offset="1" stopColor="#fff2cf" stopOpacity="0"/></radialGradient>
   <radialGradient id="kwBeam" cx="640" cy="480" r="220" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fff6c8" stopOpacity={.55*beam}/><stop offset="1" stopColor="#fff6c8" stopOpacity="0"/></radialGradient>
   <pattern id="kwCloth" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="10" height="10" fill="#3a2a1f"/><rect width="4" height="10" fill="#57402c"/></pattern>
   <pattern id="kwCloth2" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)"><rect width="10" height="10" fill="#1f1a16"/><rect width="4" height="10" fill="#3b322a"/></pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#kwWall)"/>
  {/* window w/ daylight */}
  <rect x="1300" y="150" width="380" height="360" rx="8" fill="#bfe3f5"/><path d="M1300,400 C1400,380 1520,410 1680,380 L1680,510 L1300,510Z" fill="#9fcf8f"/><rect x="1294" y="144" width="392" height="372" rx="10" fill="none" stroke="#fff" strokeWidth="16"/><path d="M1490,150 L1490,510" stroke="#fff" strokeWidth="12"/>
  <path d="M1300,520 L1120,1080 L1900,1080 L1690,520Z" fill="#fff4d6" opacity=".35"/>
  {/* upper cabinets remaining on the right */}
  <rect x="1060" y="120" width="200" height="300" rx="8" fill="#5c8c86"/><rect x="1072" y="132" width="176" height="276" rx="6" fill="#6a9d96"/><rect x="1236" y="250" width="6" height="40" rx="3" fill="#e9dcc7"/>
  {/* drywall cut + cavity */}
  <path d="M360,250 L920,250 L920,720 L360,720Z" fill="url(#kwCav)"/>
  <path d="M360,250 L920,250 L920,720 L360,720Z" fill="none" stroke="#d6c3a5" strokeWidth="10" strokeLinejoin="round" strokeDasharray="38 6 22 8"/>
  {studs.map(x=><rect key={x} x={x} y="250" width="44" height="470" fill="url(#kwStud)"/>)}
  <rect x="360" y="470" width="560" height="40" fill="url(#kwStud)" opacity=".9"/>
  {/* old metal box with scorch */}
  <rect x="604" y="400" width="74" height="96" rx="6" fill="#8d8f92"/><rect x="614" y="410" width="54" height="76" rx="4" fill="#6f7276"/><ellipse cx="642" cy="408" rx="40" ry="18" fill="#1a120c" opacity=".55"/>
  {/* cloth-insulated wiring: two old runs, frayed */}
  <path d="M370,330 C460,320 520,360 560,350 C600,342 610,380 620,404" stroke="url(#kwCloth)" strokeWidth="16" fill="none" strokeLinecap="round"/>
  <path d="M370,360 C450,372 520,392 568,384 C600,380 626,396 636,410" stroke="url(#kwCloth2)" strokeWidth="14" fill="none" strokeLinecap="round"/>
  <path d="M664,490 C690,560 760,580 820,600 C870,616 900,650 916,700" stroke="url(#kwCloth)" strokeWidth="16" fill="none" strokeLinecap="round"/>
  <path d="M650,494 C670,580 740,612 790,630" stroke="url(#kwCloth2)" strokeWidth="14" fill="none" strokeLinecap="round"/>
  <g stroke="#c98a4a" strokeWidth="5" strokeLinecap="round"><path d="M790,630 L806,640 M790,630 L804,626 M792,632 L800,650"/></g>
  <g stroke="#a39070" strokeWidth="3" strokeLinecap="round" opacity=".9"><path d="M778,624 L770,612 M782,626 L778,610 M786,628 L790,612"/></g>
  {/* flashlight pool */}
  <rect width="1920" height="1080" fill="url(#kwBeam)" style={{mixBlendMode:'screen'}}/>
  {/* floor + drop cloth + new wire coil */}
  <rect y="760" width="1920" height="320" fill="#cdb796"/>
  <path d="M120,800 C500,780 1000,800 1500,790 L1600,1080 L60,1080Z" fill="#ece4d4"/>
  <path d="M200,860 C600,850 1000,880 1450,860" stroke="#d9cfba" strokeWidth="5" fill="none"/>
  <g transform="translate(1180,900)"><ellipse rx="110" ry="40" fill="#e8b92e"/><ellipse rx="70" ry="22" fill="#cdb796"/><ellipse rx="110" ry="40" fill="none" stroke="#c99a1e" strokeWidth="4"/><text x="0" y="-48" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="20" fill="#7a5a10">NM-B 12/2</text></g>
  {/* ladder */}
  <g opacity=".95"><path d="M1000,780 L1080,280 M1110,780 L1170,280" stroke="#9aa3ad" strokeWidth="14" strokeLinecap="round"/>{[700,600,500,400,320].map((y,i)=><path key={y} d={`M${1012+i*13},${y} L${1122+i*10},${y}`} stroke="#9aa3ad" strokeWidth="10"/>)}</g>
  <rect width="1920" height="1080" fill="url(#kwSun)" style={{mixBlendMode:'screen'}}/>
 </svg>;
}
