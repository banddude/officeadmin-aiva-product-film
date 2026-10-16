import React from 'react';
import {P} from './kit';

// Tony's living room at night. Lamp (warm) on the left, TV (cool) off-frame right.
export function LivingRoom({tv=1,lamp=1}:{tv?:number;lamp?:number}){
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
  <defs>
   <linearGradient id="lrWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141c3c"/><stop offset="1" stopColor="#1d2850"/></linearGradient>
   <linearGradient id="lrFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#151b36"/><stop offset="1" stopColor="#0c1126"/></linearGradient>
   <linearGradient id="lrSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1433"/><stop offset="1" stopColor="#2b3a74"/></linearGradient>
   <radialGradient id="lrLamp" cx="250" cy="360" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={P.lamp} stopOpacity={.55*lamp}/><stop offset=".35" stopColor={P.lampDeep} stopOpacity={.16*lamp}/><stop offset="1" stopColor={P.lampDeep} stopOpacity="0"/></radialGradient>
   <radialGradient id="lrTv" cx="2050" cy="640" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor={P.tv} stopOpacity={.42*tv}/><stop offset=".5" stopColor={P.tv} stopOpacity={.1*tv}/><stop offset="1" stopColor={P.tv} stopOpacity="0"/></radialGradient>
   <linearGradient id="lrCouch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f6676"/><stop offset="1" stopColor="#214b58"/></linearGradient>
   <linearGradient id="lrSeat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a7b8b"/><stop offset="1" stopColor="#265664"/></linearGradient>
   <filter id="lrBlur"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="1920" height="1080" fill="url(#lrWall)"/>
  {/* wainscot line */}
  <rect y="760" width="1920" height="6" fill="#26315e"/>
  {/* window with city at night */}
  <g filter="url(#lrBlur)">
   <rect x="900" y="140" width="400" height="330" rx="6" fill="url(#lrSky)"/>
   <circle cx="1210" cy="210" r="30" fill="#f6e7c1" opacity=".9"/><circle cx="1210" cy="210" r="70" fill="#f6e7c1" opacity=".08"/>
   <path d="M900,470 L900,380 L940,380 L940,350 L990,350 L990,400 L1030,400 L1030,330 L1080,330 L1080,390 L1130,390 L1130,360 L1170,360 L1170,410 L1230,410 L1230,370 L1300,370 L1300,470Z" fill="#0a0f24"/>
   {Array.from({length:34},(_,i)=><rect key={i} x={910+((i*53)%380)} y={360+((i*37)%95)} width="6" height="8" fill="#ffd27a" opacity={.25+((i*7)%10)/14}/>)}
  </g>
  <rect x="894" y="134" width="412" height="342" rx="8" fill="none" stroke="#2b3666" strokeWidth="14"/>
  <path d="M1100,140 L1100,470 M900,305 L1300,305" stroke="#2b3666" strokeWidth="10"/>
  {/* frames on the wall */}
  <g opacity=".95"><rect x="500" y="220" width="150" height="190" rx="6" fill="#26305e"/><rect x="514" y="234" width="122" height="162" fill="#3a4c8a"/><path d="M514,360 L560,300 L600,340 L636,290 L636,396 L514,396Z" fill="#2a3a70"/>
   <rect x="680" y="270" width="140" height="110" rx="6" fill="#26305e"/><rect x="692" y="282" width="116" height="86" fill="#c9714a" opacity=".55"/><circle cx="750" cy="325" r="22" fill="#f1b16a" opacity=".7"/></g>
  {/* floor + rug */}
  <rect y="820" width="1920" height="260" fill="url(#lrFloor)"/>
  <ellipse cx="860" cy="960" rx="760" ry="90" fill="#232c58" opacity=".9"/>
  <ellipse cx="860" cy="960" rx="700" ry="74" fill="none" stroke="#3a467f" strokeWidth="6" opacity=".7"/>
  {/* floor lamp */}
  <path d="M248,400 L248,900" stroke="#1a1f33" strokeWidth="9"/><ellipse cx="248" cy="902" rx="56" ry="12" fill="#14182a"/>
  <path d="M176,300 L320,300 L292,404 L204,404Z" fill="#f7c78a"/><path d="M176,300 L320,300 L316,316 L180,316Z" fill="#fff0d0" opacity=".7"/>
  {/* couch */}
  <g>
   <rect x="372" y="830" width="20" height="40" rx="5" fill="#0d1226"/><rect x="1290" y="830" width="20" height="40" rx="5" fill="#0d1226"/>
   <path d="M420,470 C420,450 440,440 470,440 L1210,440 C1240,440 1260,450 1260,470 L1270,700 L410,700Z" fill="url(#lrCouch)"/>
   <path d="M444,470 C444,458 456,452 476,452 L830,452 C846,452 850,464 850,476 L852,680 L444,680Z M870,476 C870,464 876,452 892,452 L1204,452 C1222,452 1236,458 1236,470 L1236,680 L866,680Z" fill="#2a5c6b"/>
   <path d="M410,690 L1270,690 L1282,830 L398,830Z" fill="url(#lrSeat)"/>
   <path d="M410,690 L1270,690 L1272,712 L408,712Z" fill="#4a8d9c" opacity=".6"/>
   <path d="M360,560 C360,530 380,520 410,520 C440,520 456,532 456,560 L456,830 L370,830 C362,830 360,820 360,810Z" fill="#2c6574"/>
   <path d="M1224,560 C1224,532 1240,520 1270,520 C1300,520 1320,530 1320,560 L1320,810 C1320,820 1318,830 1310,830 L1224,830Z" fill="#2c6574"/>
   <path d="M368,548 C380,532 440,530 452,548" stroke="#4d93a2" strokeWidth="6" fill="none" opacity=".6"/>
   {/* throw pillow */}
   <path d="M1060,520 C1080,500 1160,500 1190,520 C1200,560 1196,620 1186,660 C1150,676 1090,676 1062,660 C1050,620 1050,560 1060,520Z" fill="#e0a341" opacity=".95"/>
  </g>
  {/* side table w/ hard hat and rolled plans */}
  <g>
   <rect x="1360" y="700" width="170" height="16" rx="5" fill="#5a3b26"/><rect x="1374" y="716" width="12" height="150" fill="#3e2818"/><rect x="1504" y="716" width="12" height="150" fill="#3e2818"/>
   <path d="M1384,700 C1384,640 1418,612 1450,612 C1484,612 1514,640 1514,700Z" fill="#f2b72e"/><rect x="1368" y="692" width="166" height="12" rx="6" fill="#e2a41e"/><path d="M1446,614 L1454,614 L1456,694 L1444,694Z" fill="#fff" opacity=".3"/>
   <g transform="rotate(-62 1540 640)"><rect x="1500" y="626" width="190" height="34" rx="17" fill="#e9e3d6"/><ellipse cx="1690" cy="643" rx="10" ry="17" fill="#cfc6b4"/><rect x="1560" y="626" width="10" height="34" fill="#4d7bd1" opacity=".6"/></g>
  </g>
  {/* light */}
  <rect width="1920" height="1080" fill="url(#lrLamp)" style={{mixBlendMode:'screen'}}/>
  <rect width="1920" height="1080" fill="url(#lrTv)" style={{mixBlendMode:'screen'}}/>
 </svg>;
}

// Tony's bedroom, Sunday 11:48 PM. Moonlight + phone.
export function Bedroom(){
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
  <defs>
   <linearGradient id="brWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1330"/><stop offset="1" stopColor="#151d44"/></linearGradient>
   <radialGradient id="brMoon" cx="1500" cy="250" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#8fb5ff" stopOpacity=".28"/><stop offset="1" stopColor="#8fb5ff" stopOpacity="0"/></radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#brWall)"/>
  <rect x="1330" y="120" width="360" height="420" rx="8" fill="#1a2a5c"/><path d="M1510,120 L1510,540 M1330,330 L1690,330" stroke="#0d1330" strokeWidth="12"/>
  <circle cx="1600" cy="210" r="34" fill="#eaf1ff" opacity=".85"/>
  <path d="M1330,540 L1250,1080 L1960,1080 L1690,540Z" fill="#8fb5ff" opacity=".07"/>
  <rect x="160" y="560" width="1260" height="90" rx="20" fill="#2a3466"/>
  <path d="M120,640 C120,620 140,610 170,610 L1430,610 C1460,610 1480,620 1480,640 L1480,860 L120,860Z" fill="#25305e"/>
  <path d="M120,700 C500,660 900,760 1480,700 L1480,860 L120,860Z" fill="#3a4a8a"/>
  <path d="M120,700 C500,660 900,760 1480,700" stroke="#5a6bb0" strokeWidth="6" fill="none" opacity=".6"/>
  <rect x="1510" y="700" width="200" height="180" rx="8" fill="#1f2752"/><rect x="1530" y="680" width="40" height="22" rx="4" fill="#b03a2e"/><text x="1550" y="697" fontFamily="Inter" fontSize="14" fontWeight="700" fill="#ff8a7a" textAnchor="middle">11:48</text>
  <rect width="1920" height="1080" fill="url(#brMoon)" style={{mixBlendMode:'screen'}}/>
 </svg>;
}
