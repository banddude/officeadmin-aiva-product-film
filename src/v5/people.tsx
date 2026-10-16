import React,{type ReactNode} from 'react';
import {P} from './kit';

// Shared lighting: draw a figure once in <defs>, then shade it with masked light layers.
// key = side the main light comes from; rim = warm/cool edge light from the other side.
export type Light={key:'left'|'right';keyColor:string;keyAmt:number;rimColor:string;rimAmt:number;shadow:number;under?:{color:string;amt:number;x:number;y:number;r:number}};
export const NIGHT_TV:Light={key:'right',keyColor:'#7fd8ff',keyAmt:.28,rimColor:'#ffb867',rimAmt:.55,shadow:.42,under:{color:"#cfe8ff",amt:.2,x:.5,y:.5,r:.18}};
export const DAY:Light={key:'left',keyColor:'#fff1d6',keyAmt:.22,rimColor:'#fff6dc',rimAmt:.14,shadow:.18};
export const BEDROOM:Light={key:'right',keyColor:'#9fd0ff',keyAmt:.22,rimColor:'#6c7bd6',rimAmt:.3,shadow:.5,under:{color:"#cfe9ff",amt:.35,x:.55,y:.5,r:.26}};

export function Lit({id,w,h,light,children,cast}:{id:string;w:number;h:number;light:Light;children:ReactNode;cast?:{dx:number;dy:number;opacity:number;blur:number}}){
 const k=light.key==='right';
 return <g>
  <defs>
   <g id={`${id}-fig`}>{children}</g>
   <filter id={`${id}-white`}><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
   <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}><use href={`#${id}-fig`} filter={`url(#${id}-white)`}/></mask>
   <linearGradient id={`${id}-sh`} x1={k?'0':'1'} x2={k?'1':'0'} y1="0" y2="0"><stop offset="0" stopColor="#0a0f26" stopOpacity={light.shadow}/><stop offset=".55" stopColor="#0a0f26" stopOpacity={light.shadow*.25}/><stop offset="1" stopColor="#0a0f26" stopOpacity="0"/></linearGradient>
   <linearGradient id={`${id}-key`} x1={k?'1':'0'} x2={k?'0':'1'} y1="0" y2="0"><stop offset="0" stopColor={light.keyColor} stopOpacity={light.keyAmt}/><stop offset=".45" stopColor={light.keyColor} stopOpacity="0"/></linearGradient>
   {/* crisp rim: figure minus itself shifted toward the light */}
   <filter id={`${id}-black`}><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>
   <mask id={`${id}-rimm`} maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}><use href={`#${id}-fig`} filter={`url(#${id}-white)`}/><use href={`#${id}-fig`} filter={`url(#${id}-black)`} transform={`translate(${k?7:-7},2)`}/></mask>
   {cast&&<filter id={`${id}-cast`} x="-30%" y="-30%" width="160%" height="160%"><feColorMatrix in="SourceAlpha" values="0 0 0 0 .12  0 0 0 0 .08  0 0 0 0 .06  0 0 0 1 0"/><feGaussianBlur stdDeviation={cast.blur}/></filter>}
   {light.under&&<radialGradient id={`${id}-un`} cx={light.under.x} cy={light.under.y} r={light.under.r}><stop offset="0" stopColor={light.under.color} stopOpacity={light.under.amt}/><stop offset="1" stopColor={light.under.color} stopOpacity="0"/></radialGradient>}
  </defs>
  {cast&&<use href={`#${id}-fig`} filter={`url(#${id}-cast)`} transform={`translate(${cast.dx},${cast.dy})`} opacity={cast.opacity}/>}
  <use href={`#${id}-fig`}/>
  <g mask={`url(#${id}-m)`}>
   <rect width={w} height={h} fill={`url(#${id}-sh)`} style={{mixBlendMode:'multiply'}}/>
   <rect width={w} height={h} fill={`url(#${id}-key)`} style={{mixBlendMode:'screen'}}/>
   {light.under&&<rect width={w} height={h} fill={`url(#${id}-un)`} style={{mixBlendMode:'screen'}}/>}
  </g>
  <rect width={w} height={h} fill={light.rimColor} opacity={light.rimAmt} mask={`url(#${id}-rimm)`}/>
 </g>;
}

export type Face={eyes?:'down'|'open'|'closed'|'wide'|'smile'|'side';brows?:'flat'|'up'|'worried'|'focus';mouth?:'none'|'smile'|'grin'|'o'|'flat'|'grimace'|'talk';look?:number};

// Tony: owner-electrician, late 30s, short dark hair, trimmed beard, rust flannel over a tee.
export function TonyHead({face,cx=345,cy=180}:{face:Face;cx?:number;cy?:number}){
 const e=face.eyes||'open',b=face.brows||'flat',m=face.mouth||'flat',lx=face.look||0;
 const skin=P.skinT,sh=P.skinTs,hair='#231a15',beard='#30231b';
 const browY=b==='up'?-30:b==='worried'?-26:-24;
 return <g transform={`translate(${cx-345},${cy-180})`}>
  <ellipse cx="270" cy="188" rx="14" ry="23" fill={sh}/><ellipse cx="420" cy="188" rx="14" ry="23" fill={sh}/>
  <ellipse cx="272" cy="190" rx="7" ry="12" fill="#8f5a39" opacity=".5"/><ellipse cx="418" cy="190" rx="7" ry="12" fill="#8f5a39" opacity=".5"/>
  <path d="M272,168 C270,98 310,78 345,78 C382,78 420,98 418,168 C418,232 394,276 345,280 C296,276 272,232 272,168Z" fill={skin}/>
  <path d="M345,280 C312,278 290,258 280,226 C292,250 316,262 345,262 C374,262 398,250 410,226 C400,258 378,278 345,280Z" fill={sh} opacity=".55"/>
  {/* beard */}
  <path d="M278,196 C280,250 308,286 345,288 C383,286 410,250 412,196 C404,226 392,238 378,240 C368,231 356,229 345,232 C334,229 322,231 312,240 C298,238 286,226 278,196Z" fill={beard}/>
  <path d="M318,236 C328,226 338,226 345,231 C352,226 362,226 372,236 C362,240 352,240 345,238 C338,240 328,240 318,236Z" fill="#22180f"/>
  {/* mouth */}
  {m==='smile'&&<path d="M326,248 Q345,262 364,248" stroke="#5a2d22" strokeWidth="5" fill="none" strokeLinecap="round"/>}
  {m==='grin'&&<path d="M322,244 Q345,272 368,244 Q345,254 322,244Z" fill="#fff" stroke="#5a2d22" strokeWidth="4" strokeLinejoin="round"/>}
  {m==='o'&&<ellipse cx="345" cy="252" rx="9" ry="11" fill="#4a2119"/>}
  {m==='flat'&&<path d="M330,250 L360,250" stroke="#5a2d22" strokeWidth="5" strokeLinecap="round"/>}
  {m==='grimace'&&<path d="M324,252 Q335,244 345,252 Q355,260 366,250" stroke="#5a2d22" strokeWidth="5" fill="none" strokeLinecap="round"/>}
  {m==='talk'&&<path d="M330,246 Q345,264 360,246Z" fill="#4a2119"/>}
  {/* nose */}
  <path d="M345,170 C350,192 356,204 350,212 C346,215 338,214 334,210" fill="none" stroke={sh} strokeWidth="6" strokeLinecap="round"/>
  {/* eyes */}
  {e==='open'&&<><ellipse cx={318+lx} cy="178" rx="7.5" ry="9" fill="#1b1310"/><ellipse cx={372+lx} cy="178" rx="7.5" ry="9" fill="#1b1310"/><circle cx={320+lx} cy="175" r="2.4" fill="#fff"/><circle cx={374+lx} cy="175" r="2.4" fill="#fff"/></>}
  {e==='wide'&&<><circle cx={318+lx} cy="176" r="12" fill="#fff"/><circle cx={372+lx} cy="176" r="12" fill="#fff"/><circle cx={319+lx} cy="178" r="7" fill="#1b1310"/><circle cx={373+lx} cy="178" r="7" fill="#1b1310"/></>}
  {e==='down'&&<><ellipse cx="318" cy="186" rx="7.5" ry="6" fill="#1b1310"/><ellipse cx="372" cy="186" rx="7.5" ry="6" fill="#1b1310"/><path d="M305,181 Q318,176 331,181" stroke="#1b1310" strokeWidth="4.5" fill="none" strokeLinecap="round"/><path d="M359,181 Q372,176 385,181" stroke="#1b1310" strokeWidth="4.5" fill="none" strokeLinecap="round"/></>}
  {e==='closed'&&<><path d="M306,182 Q318,188 330,182" stroke="#1b1310" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M360,182 Q372,188 384,182" stroke="#1b1310" strokeWidth="5" fill="none" strokeLinecap="round"/></>}
  {e==='smile'&&<><path d="M306,184 Q318,172 330,184" stroke="#1b1310" strokeWidth="5.5" fill="none" strokeLinecap="round"/><path d="M360,184 Q372,172 384,184" stroke="#1b1310" strokeWidth="5.5" fill="none" strokeLinecap="round"/></>}
  {e==='side'&&<><ellipse cx="324" cy="178" rx="7.5" ry="9" fill="#1b1310"/><ellipse cx="378" cy="178" rx="7.5" ry="9" fill="#1b1310"/></>}
  {/* brows */}
  <path d={b==='worried'?`M300,${180+browY} Q314,${168+browY} 330,${174+browY}`:b==='focus'?`M302,${170+browY} Q316,${168+browY} 332,${176+browY}`:`M300,${174+browY} Q316,${166+browY} 332,${172+browY}`} stroke={hair} strokeWidth="10" fill="none" strokeLinecap="round"/>
  <path d={b==='worried'?`M360,${174+browY} Q376,${168+browY} 390,${180+browY}`:b==='focus'?`M358,${176+browY} Q374,${168+browY} 388,${170+browY}`:`M358,${172+browY} Q374,${166+browY} 390,${174+browY}`} stroke={hair} strokeWidth="10" fill="none" strokeLinecap="round"/>
  {/* hair */}
  <path d="M266,170 C256,98 298,58 350,60 C404,58 436,100 424,168 C420,140 408,122 392,114 C370,124 330,126 300,112 C284,124 272,142 266,170Z" fill={hair}/>
  <path d="M300,112 C320,92 352,86 384,98 C368,92 334,94 300,112Z" fill="#3a2c24"/>
  <path d="M268,168 L266,196 C270,186 272,176 276,170Z M422,168 L424,196 C420,186 418,176 414,170Z" fill={hair}/>
 </g>;
}

const Flannel=({id}:{id:string})=><pattern id={id} width="38" height="38" patternUnits="userSpaceOnUse" patternTransform="rotate(4)"><rect width="38" height="38" fill="#b5532f"/><rect width="38" height="12" y="13" fill="#8e3b22" opacity=".75"/><rect width="12" height="38" x="13" fill="#8e3b22" opacity=".6"/><rect width="38" height="3" y="18" fill="#e08a5a" opacity=".45"/><rect width="3" height="38" x="18" fill="#e08a5a" opacity=".35"/></pattern>;

// Seated on the couch holding a phone, with Mia asleep across his lap. Local box 700x760.
export function TonyCouch({face,phoneGlow=1,mia=true,thumb=0}:{face:Face;phoneGlow?:number;mia?:boolean;thumb?:number}){
 return <g>
  <defs><Flannel id="flA"/></defs>
  {/* neck */}
  <path d="M318,246 L372,246 L376,306 L314,306Z" fill={P.skinTs}/>
  {/* torso */}
  <path d="M244,300 C222,312 206,336 202,376 L192,548 C262,572 430,572 498,548 L488,376 C484,336 468,312 446,300 C412,288 278,288 244,300Z" fill="url(#flA)"/>
  <path d="M312,294 L345,352 L378,294 C368,290 322,290 312,294Z" fill="#ece6dc"/>
  <path d="M300,296 L345,360 L322,300Z M390,296 L345,360 L368,300Z" fill="#9b4227"/>
  {/* jeans/lap */}
  <path d="M196,540 C186,612 210,660 262,668 L440,668 C490,660 512,612 500,540 C430,560 266,560 196,540Z" fill="#2c3f63"/>
  <path d="M262,668 L262,760 L318,760 L322,668Z M386,668 L382,760 L440,760 L440,668Z" fill="#26375a"/>
  <path d="M248,742 C248,730 262,724 290,724 L326,724 C334,740 334,756 326,764 L248,764Z M378,724 L420,724 C446,724 458,732 458,744 L458,764 L374,764 C368,754 370,736 378,724Z" fill="#5a3b26"/>
  {/* head */}
  <TonyHead face={face}/>
  {/* arms */}
  <path d="M232,326 C214,380 206,430 212,472" stroke="url(#flA)" strokeWidth="66" fill="none" strokeLinecap="round"/>
  <path d="M458,326 C476,380 484,430 478,472" stroke="url(#flA)" strokeWidth="66" fill="none" strokeLinecap="round"/>
  <path d="M214,470 C246,474 284,462 316,444" stroke="url(#flA)" strokeWidth="58" fill="none" strokeLinecap="round"/>
  <path d="M476,470 C444,474 408,462 378,444" stroke="url(#flA)" strokeWidth="58" fill="none" strokeLinecap="round"/>
  {/* phone + hands */}
  <g transform="rotate(-7 347 420)">
   <rect x="310" y="356" width="76" height="140" rx="13" fill="#11141a"/>
   <rect x="315" y="361" width="66" height="130" rx="9" fill={`rgb(${200+40*phoneGlow},${225+20*phoneGlow},255)`} opacity={.35+.65*phoneGlow}/>
  </g>
  <path d="M300,444 C290,474 300,498 328,502 C348,504 362,494 364,480 L358,458 C340,466 320,460 312,442Z" fill={P.skinT}/>
  <path d="M312,450 C306,462 308,474 316,480" stroke={P.skinTs} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7"/>
  <path d="M390,408 C408,426 408,470 390,488 C378,496 364,490 362,476 L370,414Z" fill={P.skinT}/>
  <path d={`M376,${432-thumb*10} C362,${424-thumb*10} 350,${430-thumb*10} 352,${440-thumb*10} C354,${450-thumb*10} 368,${450-thumb*10} 378,${446-thumb*10}Z`} fill={P.skinT}/>
  <path d="M392,440 C396,452 396,466 390,476" stroke={P.skinTs} strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7"/>
  {mia&&<MiaAsleep/>}
 </g>;
}

// Mia, six, asleep across her dad's lap: head on his thigh, star pajamas, plush bunny, legs under a small blanket.
export function MiaAsleep(){
 return <g>
  {/* legs under blanket, resting on the couch seat to Tony's left (viewer right) */}
  <path d="M430,560 C470,540 560,540 640,556 C676,566 688,606 668,632 C640,660 520,664 450,648 C420,640 410,580 430,560Z" fill="#e0a341"/>
  <path d="M440,590 C520,604 600,600 676,596 M436,624 C520,638 600,634 664,626" stroke="#c4862a" strokeWidth="8" fill="none" opacity=".75"/>
  <path d="M446,566 C520,560 600,560 650,566" stroke="#f3c26a" strokeWidth="5" fill="none" opacity=".7"/>
  {/* pajama torso across the lap */}
  <path d="M256,548 C284,530 360,528 420,540 C452,548 462,592 444,620 C410,640 320,640 272,624 C246,612 238,566 256,548Z" fill="#ff8a7a"/>
  <path d="M258,600 C320,616 400,616 448,604" stroke="#e86e60" strokeWidth="6" fill="none" opacity=".6"/>
  {[[290,560],[330,578],[372,556],[404,590],[316,606],[360,612]].map(([x,y],i)=><path key={i} transform={`translate(${x},${y}) scale(.9)`} d="M0,-7 L2,-2 L7,-2 L3,1 L5,7 L0,3 L-5,7 L-3,1 L-7,-2 L-2,-2Z" fill="#fff" opacity=".85"/>)}
  {/* arm hugging the bunny */}
  <path d="M300,566 C320,600 350,612 380,602" stroke="#ff8a7a" strokeWidth="26" fill="none" strokeLinecap="round"/>
  <g transform="translate(366,566) rotate(8)">
   <ellipse cx="0" cy="8" rx="28" ry="24" fill="#ece5f6"/><ellipse cx="-11" cy="-26" rx="9" ry="22" fill="#ece5f6"/><ellipse cx="11" cy="-26" rx="9" ry="22" fill="#ece5f6"/>
   <ellipse cx="-11" cy="-24" rx="4" ry="14" fill="#f6b8c8"/><ellipse cx="11" cy="-24" rx="4" ry="14" fill="#f6b8c8"/>
   <circle cx="-8" cy="4" r="3" fill="#2a2440"/><circle cx="8" cy="4" r="3" fill="#2a2440"/><ellipse cx="0" cy="11" rx="4" ry="3" fill="#f08aa0"/>
  </g>
  <ellipse cx="386" cy="602" rx="16" ry="13" fill={P.skinM}/>
  {/* head on dad's left thigh */}
  <g transform="translate(222,560) rotate(-10)">
   <ellipse cx="0" cy="4" rx="58" ry="54" fill={P.skinM}/>
   <path d="M-56,-2 C-62,-56 -12,-76 24,-66 C56,-58 72,-28 62,6 C54,-16 32,-28 8,-26 C-18,-26 -40,-16 -56,-2Z" fill="#3b2416"/>
   {[[-54,-22,17],[-44,-48,18],[-18,-64,18],[12,-66,18],[40,-54,17],[58,-26,16],[-60,4,14],[64,2,12]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill="#3b2416"/>)}
   <path d="M-30,-40 C-20,-50 0,-54 14,-50" stroke="#5a3a26" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".7"/>
   <path d="M-14,14 Q-3,21 8,14" stroke="#4a2a1c" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
   <path d="M20,10 Q31,17 42,10" stroke="#4a2a1c" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
   <ellipse cx="18" cy="36" rx="5" ry="6" fill="#7a3a2c"/>
   <ellipse cx="-16" cy="28" rx="12" ry="7" fill="#f08a7a" opacity=".5"/><ellipse cx="46" cy="24" rx="11" ry="7" fill="#f08a7a" opacity=".5"/>
  </g>
 </g>;
}

// Standing figure rig used for Ray, Sam, Jen and Tony on the job. Box 400x900, feet at y=880.
// Arms are forward kinematics: a = upper-arm angle from hanging (deg, + = outward/up), b = elbow bend.
export type Outfit={skin:string;skinS:string;hair:string;hairStyle:'short'|'bun'|'cap'|'curly'|'long';top:string;topS:string;bottom:string;shoes:string;hat?:string;vest?:string;belt?:boolean};
const rad=(d:number)=>d*Math.PI/180;
function seg(x1:number,y1:number,x2:number,y2:number,w1:number,w2:number,fill:string,key?:string){
 const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
 return <g key={key}><path d={`M${x1+nx*w1/2},${y1+ny*w1/2} L${x2+nx*w2/2},${y2+ny*w2/2} L${x2-nx*w2/2},${y2-ny*w2/2} L${x1-nx*w1/2},${y1-ny*w1/2}Z`} fill={fill}/><circle cx={x1} cy={y1} r={w1/2} fill={fill}/><circle cx={x2} cy={y2} r={w2/2} fill={fill}/></g>;
}
function Hand({x,y,ang,side,skin,skinS}:{x:number;y:number;ang:number;side:1|-1;skin:string;skinS:string}){
 return <g transform={`translate(${x},${y}) rotate(${ang})`}><ellipse cx="0" cy="10" rx="19" ry="23" fill={skin}/><ellipse cx={side*-15} cy="2" rx="8" ry="15" transform={`rotate(${side*-30} ${side*-15} 2)`} fill={skin}/><path d={`M${side*4},20 Q${side*10},28 ${side*14},20`} stroke={skinS} strokeWidth="3" fill="none" strokeLinecap="round"/></g>;
}
export function Person({o,face,armL=8,armR=8,foreL=0,foreR=0,lean=0,hold,headTurn=0,headTilt=0}:{o:Outfit;face:Face;armL?:number;armR?:number;foreL?:number;foreR?:number;lean?:number;hold?:ReactNode;headTurn?:number;headTilt?:number}){
 const e=face.eyes||'open',m=face.mouth||'flat',b=face.brows||'flat',lx=(face.look||0)+headTurn*6;
 const arm=(side:1|-1,a:number,bend:number,front:boolean)=>{
  const sx=200+side*74,sy=330,u=150,fl=132;
  const ex=sx+side*Math.sin(rad(a))*u,ey=sy+Math.cos(rad(a))*u;
  const fa=a+bend,hx=ex+side*Math.sin(rad(fa))*fl,hy=ey+Math.cos(rad(fa))*fl;
  const handAng=-side*fa;
  return <g>
   {seg(sx,sy,ex,ey,58,46,o.top)}
   {seg(ex,ey,hx,hy,44,34,o.top)}
   {seg(ex+(hx-ex)*.78,ey+(hy-ey)*.78,hx,hy,30,28,o.skin)}
   <path d={`M${ex+(hx-ex)*.74-8},${ey+(hy-ey)*.74} L${ex+(hx-ex)*.74+8},${ey+(hy-ey)*.74}`} stroke={o.topS} strokeWidth="10" strokeLinecap="round" transform={`rotate(${handAng} ${ex+(hx-ex)*.74} ${ey+(hy-ey)*.74})`}/>
   <Hand x={hx} y={hy} ang={handAng} side={side} skin={o.skin} skinS={o.skinS}/>
   {side===1&&hold&&<g transform={`translate(${hx},${hy}) rotate(${handAng})`}>{hold}</g>}
  </g>};
 const hair=o.hair;
 return <g transform={`rotate(${lean} 200 880)`}>
  {/* legs */}
  {seg(160,560,148,850,70,54,o.bottom)}{seg(242,560,256,850,70,54,o.bottom)}
  <path d="M206,580 L204,700" stroke={o.topS} strokeWidth="4" opacity=".35"/>
  <path d="M100,856 C100,838 124,830 152,832 L180,834 L182,882 L100,882Z M226,834 L254,832 C286,830 310,840 310,858 L310,882 L224,882Z" fill={o.shoes}/>
  {arm(-1,armL,foreL,false)}
  {/* torso with cel shading */}
  <path d="M120,322 C124,296 156,284 200,284 C244,284 276,296 280,322 L290,584 C238,602 162,602 110,584Z" fill={o.top}/>
  <path d="M240,290 C262,296 276,306 280,322 L290,584 C268,592 246,596 226,598 C238,500 246,400 240,290Z" fill={o.topS} opacity=".55"/>
  <path d="M150,420 C170,430 190,428 204,420 M160,470 C180,478 198,476 212,468" stroke={o.topS} strokeWidth="4" fill="none" opacity=".5" strokeLinecap="round"/>
  <path d="M168,288 L200,330 L232,288 C222,285 178,285 168,288Z" fill={o.topS}/>
  {o.vest&&<g><path d="M126,322 L178,306 L188,596 L112,586Z" fill={o.vest}/><path d="M274,322 L222,306 L212,596 L288,586Z" fill={o.vest}/><path d="M274,322 L250,312 L240,596 L288,586Z" fill="#d9661a" opacity=".55"/><path d="M118,452 L184,446 M282,452 L216,446" stroke="#f2f0b0" strokeWidth="11"/></g>}
  {o.belt&&<g><rect x="110" y="552" width="180" height="26" rx="6" fill="#5a3a22"/><rect x="186" y="554" width="28" height="22" rx="4" fill="#d6a64a"/><path d="M246,566 L254,630 L290,626 L286,566Z" fill="#6d4426"/><rect x="258" y="574" width="8" height="40" rx="3" fill="#c33"/><rect x="270" y="574" width="8" height="34" rx="3" fill="#ffcb3a"/></g>}
  {arm(1,armR,foreR,true)}
  {/* neck + head */}
  <path d="M178,246 L222,246 L224,300 C210,306 190,306 176,300Z" fill={o.skinS}/>
  <g transform={`translate(${headTurn*4},0) rotate(${headTilt} 200 250)`}>
   <ellipse cx="134" cy="196" rx="11" ry="18" fill={o.skinS}/><ellipse cx="266" cy="196" rx="11" ry="18" fill={o.skinS}/>
   <path d="M132,186 C132,128 164,108 200,108 C238,108 268,128 268,186 C268,240 238,270 200,270 C162,270 132,240 132,186Z" fill={o.skin}/>
   <path d="M200,270 C230,270 258,248 266,206 C258,236 236,254 206,256Z" fill={o.skinS} opacity=".5"/>
   {o.hairStyle==='short'&&<path d="M128,184 C120,124 158,98 202,100 C248,100 280,128 270,186 C264,152 246,136 200,136 C158,136 138,152 128,184Z" fill={hair}/>}
   {o.hairStyle==='curly'&&<g fill={hair}>{[[140,150,26],[160,122,28],[196,110,30],[232,120,28],[258,148,26],[132,180,18],[268,180,18]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r}/>)}</g>}
   {o.hairStyle==='bun'&&<g fill={hair}><path d="M128,196 C118,126 158,102 200,102 C244,102 284,126 272,196 C262,156 240,136 200,136 C160,136 138,156 128,196Z"/></g>}
   {o.hairStyle==='long'&&<g fill={hair}><path d="M126,204 C108,120 156,96 200,96 C248,96 292,120 274,204 L286,318 C264,330 246,318 248,252 C252,172 236,140 200,138 C164,140 148,172 152,252 C154,318 136,330 114,318Z"/><path d="M150,150 C170,128 214,118 252,140 C226,128 186,130 150,150Z" fill="#9a6440"/></g>}
   {o.hat&&<g><path d="M124,170 C122,108 160,84 200,84 C242,84 278,108 276,170Z" fill={o.hat}/><path d="M232,92 C258,104 274,128 276,170 L250,170 C250,134 244,108 232,92Z" fill="#000" opacity=".12"/><rect x="108" y="162" width="184" height="16" rx="8" fill={o.hat}/><path d="M194,86 L206,86 L208,166 L192,166Z" fill="#fff" opacity=".28"/></g>}
   {o.hairStyle==='bun'&&o.hat&&<circle cx="200" cy="70" r="0" fill={hair}/>}
   {/* face */}
   {(e==='open'||e==='wide')&&<><ellipse cx={176+lx} cy="196" rx={e==='wide'?8:6.5} ry={e==='wide'?10:8} fill="#1b1310"/><ellipse cx={224+lx} cy="196" rx={e==='wide'?8:6.5} ry={e==='wide'?10:8} fill="#1b1310"/><circle cx={178+lx} cy="193" r="2.2" fill="#fff"/><circle cx={226+lx} cy="193" r="2.2" fill="#fff"/></>}
   {(e==='down'||e==='closed')&&<><path d="M165,198 Q176,206 187,198" stroke="#1b1310" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M213,198 Q224,206 235,198" stroke="#1b1310" strokeWidth="5" fill="none" strokeLinecap="round"/></>}
   {e==='smile'&&<><path d="M165,200 Q176,188 187,200" stroke="#1b1310" strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M213,200 Q224,188 235,200" stroke="#1b1310" strokeWidth="5" fill="none" strokeLinecap="round"/></>}
   <path d={b==='worried'?'M162,180 Q172,170 188,176 M212,176 Q228,170 238,180':b==='up'?'M162,168 Q175,158 188,166 M212,166 Q225,158 238,168':'M162,178 Q175,172 188,176 M212,176 Q225,172 238,178'} stroke={hair} strokeWidth="7" fill="none" strokeLinecap="round"/>
   <path d="M200,200 C204,214 206,222 199,226" stroke={o.skinS} strokeWidth="5" fill="none" strokeLinecap="round"/>
   {m==='smile'&&<path d="M184,240 Q200,252 216,240" stroke="#5a2d22" strokeWidth="5" fill="none" strokeLinecap="round"/>}
   {m==='grin'&&<path d="M180,236 Q200,262 220,236 Q200,246 180,236Z" fill="#fff" stroke="#5a2d22" strokeWidth="4" strokeLinejoin="round"/>}
   {m==='o'&&<ellipse cx="200" cy="246" rx="9" ry="12" fill="#4a2119"/>}
   {m==='flat'&&<path d="M188,242 L212,242" stroke="#5a2d22" strokeWidth="5" strokeLinecap="round"/>}
   {m==='grimace'&&<path d="M182,246 Q191,238 200,246 Q209,254 218,244" stroke="#5a2d22" strokeWidth="5" fill="none" strokeLinecap="round"/>}
   {m==='talk'&&<path d="M186,238 Q200,256 214,238Z" fill="#4a2119"/>}
   <ellipse cx="164" cy="224" rx="11" ry="6" fill="#f08a7a" opacity=".32"/><ellipse cx="236" cy="224" rx="11" ry="6" fill="#f08a7a" opacity=".32"/>
  </g>
 </g>;
}

export const RAY:Outfit={skin:P.skinR,skinS:P.skinRs,hair:'#1a1210',hairStyle:'short',top:'#3f5d7d',topS:'#2f4a66',bottom:'#3a3f48',shoes:'#4a3020',hat:'#f2b72e',vest:'#ff8a2a',belt:true};
export const SAM:Outfit={skin:P.skinS,skinS:P.skinSs,hair:'#14100e',hairStyle:'bun',top:'#6b7c4e',topS:'#56653d',bottom:'#2e3a52',shoes:'#3a2a20',hat:'#f4f4f0',vest:'#ff8a2a',belt:true};
export const JEN:Outfit={skin:P.skinJ,skinS:P.skinJs,hair:'#7a4a2a',hairStyle:'long',top:'#3c8f8a',topS:'#2f7470',bottom:'#2b2f45',shoes:'#e9e2d6'};
export const TONY_STAND:Outfit={skin:P.skinT,skinS:P.skinTs,hair:'#231a15',hairStyle:'short',top:'#b5532f',topS:'#8e3b22',bottom:'#2c3f63',shoes:'#5a3b26',belt:true};
