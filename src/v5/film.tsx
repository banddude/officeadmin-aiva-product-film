import React,{type ReactNode} from 'react';
import {AbsoluteFill,Sequence,useCurrentFrame,Img,staticFile,Audio} from 'remotion';
import {P,DISPLAY,BODY,Fonts,Finish,ClockCard,TextBubble,Aiva,blinkAt,Glow,Logo,ease,easeOut,out,pop,lerp,clamp} from './kit';
import {Lit,NIGHT_TV,DAY,BEDROOM,TonyCouch,Person,RAY,SAM,JEN,TONY_STAND,type Outfit,type Face} from './people';
import {LivingRoom,Bedroom} from './sets';
import {KitchenWall} from './sets-day';
import {JenKitchen,Office,Exterior,Ballfield,TonyInBed} from './sets2';
import {PhotoRangeWall} from './photos';
import {Hero,Clip,Shot,Tap,Kicker,Pill,FeatureHUD,Captions,AivaCorner,PreviewPill,fragSize,rect} from './ui';
import TL from '../../production/v5/timeline.json';

export const V5_FPS=30,V5_FRAMES=Math.round(TL.duration*30);
const SC=Object.fromEntries((TL.scenes as {id:string;start:number;end:number}[]).map(s=>[s.id,s]));
type SP={f:number;v:boolean};
const MIA:Outfit={skin:P.skinM,skinS:P.skinMs,hair:'#3b2416',hairStyle:'curly',top:'#ff8a7a',topS:'#e86e60',bottom:'#2c3f63',shoes:'#f4f4f0',hat:'#2563eb'};

// Illustrated 1920x1080 world, scaled to cover the frame, with a focus point placed at a screen point.
function World({v,focus=[960,540],screen,zoom=1,children,blur=0,dim=0}:{v:boolean;focus?:number[];screen?:number[];zoom?:number;children:ReactNode;blur?:number;dim?:number}){
 const W=v?1080:1920,H=v?1920:1080,k=(v?H/1080:1)*zoom,sx=screen?.[0]??W/2,sy=screen?.[1]??H/2;
 let tx=sx-focus[0]*k,ty=sy-focus[1]*k;tx=Math.min(0,Math.max(W-1920*k,tx));ty=Math.min(0,Math.max(H-1080*k,ty));
 return <AbsoluteFill style={{overflow:'hidden'}}><div style={{position:'absolute',left:0,top:0,width:1920,height:1080,transform:`translate(${tx}px,${ty}px) scale(${k})`,transformOrigin:'0 0',filter:blur?`blur(${blur}px)`:undefined}}>{children}</div>{dim>0&&<AbsoluteFill style={{background:`rgba(5,9,22,${dim})`}}/>}</AbsoluteFill>;
}
const Svg=({children}:{children:ReactNode})=> <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,overflow:'visible'}}>{children}</svg>;
const HandPhone=({glow=1}:{glow?:number})=> <g transform="translate(-6,-34) rotate(8)"><rect x="-22" y="-44" width="48" height="86" rx="9" fill="#11141a"/><rect x="-18" y="-40" width="40" height="78" rx="6" fill={`rgba(210,235,255,${.45+.55*glow})`}/></g>;
const Bat=()=> <g transform="translate(0,0) rotate(-40)"><rect x="-6" y="-170" width="14" height="190" rx="7" fill="#c98a4a"/></g>;
// Readability scrim behind UI in the vertical cut.
const Scrim=({v,from=820,a=1}:{v:boolean;from?:number;a?:number})=> v?<div style={{position:'absolute',left:0,right:0,top:from,bottom:0,background:'linear-gradient(rgba(6,10,24,0),rgba(6,10,24,.78) 180px)',opacity:a}}/>:null;
const heroX=(v:boolean,w:number,s:number)=>v?(1080-w*s)/2:Math.max(870,1395-w*s/2);
const T=(sec:number,scene:string)=>Math.round((sec-SC[scene].start)*30); // absolute seconds -> local frame

// ---------- 0:00 HOOK ----------
function Hook({f,v}:SP){
 const push=ease(f,0,190),buzz=f>=6&&f<22||f>=52&&f<64?Math.sin(f*2.4)*5:0;
 const face:Face=f<10?{eyes:'down',brows:'flat',mouth:'flat'}:{eyes:'open',brows:'up',mouth:'o'};
 return <AbsoluteFill style={{background:P.navy}}>
  <World v={v} focus={v?[770,520]:[900,540]} screen={v?[540,1150]:undefined} zoom={(v?1.02:1.04)+push*.05}>
   <div style={{position:'absolute',inset:0,filter:'blur(1.6px)'}}><LivingRoom/></div>
   <Svg><g transform={`translate(${430+buzz*.3},138)`}><Lit id="hk" w={700} h={780} light={NIGHT_TV} cast={{dx:-38,dy:-6,opacity:.35,blur:16}}><TonyCouch face={face} phoneGlow={f<8?.4:1}/></Lit></g></Svg>
   <Glow x={777} y={560} r={160} color="#cfe9ff" opacity={f<8?.25:.55}/>
  </World>
  <Finish seed={11}/>
  <ClockCard time="9:14 PM" day="Wednesday" f={f} x={v?60:96} y={v?60:70} scale={v?.72:1}/>
  <TextBubble from="Jen Calder" time="now" x={v?60:1150} y={v?330:200} w={v?960:680} f={f} at={8} body="Hey Tony! Picking a contractor tomorrow AM. Any chance you can price the kitchen + EV charger tonight?"/>
  <TextBubble from="Jen Calder" time="now" x={v?60:1150} y={v?680:560} w={v?700:540} f={f} at={54} body="Got 2 other quotes coming 🙃"/>
 </AbsoluteFill>;
}

// ---------- 0:06 STAKES ----------
function Stakes({f,v}:SP){
 const items=[['Plans','at the office','#3ba4e0'],['Prices','buried in email','#f2a93b'],['Mia','asleep on him','#ff7f6e']];
 return <AbsoluteFill style={{background:P.navy}}>
  <World v={v} focus={[775,330]} screen={v?[540,560]:[560,560]} zoom={v?1.15:1.9+ease(f,0,180)*.08}>
   <div style={{position:'absolute',inset:0,filter:'blur(2px)'}}><LivingRoom/></div>
   <Svg><g transform="translate(430,138)"><Lit id="st" w={700} h={780} light={NIGHT_TV}><TonyCouch face={f<60?{eyes:'down',brows:'worried',mouth:'grimace'}:{eyes:'side',brows:'worried',mouth:'flat'}} phoneGlow={1}/></Lit></g></Svg>
  </World>
  <Finish seed={12}/>
  {items.map(([a,b,c],i)=>{const at=24+i*38,q=pop(f,at,20);return <div key={a} style={{position:'absolute',left:v?70:1100,top:v?1060+i*150:230+i*190,display:'flex',alignItems:'center',gap:22,padding:v?'22px 34px':'20px 32px',borderRadius:26,background:'rgba(255,255,255,.95)',boxShadow:'0 20px 60px rgba(0,0,0,.4)',transform:`translateX(${(1-q)*120}px) rotate(${(1-q)*4}deg)`,opacity:clamp(q*2)}}>
   <div style={{width:24,height:24,borderRadius:12,background:c}}/>
   <div style={{fontFamily:DISPLAY,fontWeight:800,fontSize:v?64:58,color:P.ink,letterSpacing:-1.5,fontVariationSettings:"'wdth' 90"}}>{a}:</div>
   <div style={{fontFamily:BODY,fontWeight:650,fontSize:v?50:46,color:'#475467'}}>{b}</div>
  </div>})}
  <Glow x={v?540:560} y={v?900:760} r={300} color="#bfe6ff" opacity={ease(f,150,180)*.8}/>
 </AbsoluteFill>;
}

// ---------- 0:12 AIVA ARRIVES ----------
function AivaScene({f,v}:SP){
 const g=pop(f,4,26),blink=Math.min(blinkAt(f,36),blinkAt(f,84)),shine=clamp((f-26)/22),halo=easeOut(f,0,24);
 return <AbsoluteFill style={{background:P.navy}}>
  <World v={v} focus={[700,500]} zoom={1.5} blur={7} dim={.35}><LivingRoom/></World>
  <World v={v} focus={[700,700]} screen={v?[420,1560]:[420,900]} zoom={v?.9:1.35}><Svg><g transform="translate(430,138)"><Lit id="av" w={700} h={780} light={{...NIGHT_TV,under:{color:'#cfe9ff',amt:.4,x:.5,y:.52,r:.28}}}><TonyCouch face={f<16?{eyes:'down',brows:'worried',mouth:'flat'}:{eyes:'open',brows:'up',mouth:'grin',look:4}}/></Lit></g></Svg></World>
  <Finish seed={13}/>
  <div style={{position:'absolute',left:v?190:1060,top:v?190:110,width:v?700:600,height:v?700:600,transform:`translateY(${(1-halo)*40}px) scale(${.8+.2*halo})`,opacity:halo}}>
   <div style={{position:'absolute',inset:-90,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,164,224,.45),rgba(59,164,224,0) 66%)'}}/>
   <div style={{position:'absolute',left:'7%',top:'11%',right:'7%',bottom:'4%',borderRadius:90,background:'linear-gradient(160deg,rgba(255,255,255,.17),rgba(255,255,255,.04))',border:'2px solid rgba(160,215,255,.4)'}}/>
   <Aiva size={v?700:600} glasses={g} blink={blink} shine={shine}/>
  </div>
  <PreviewPill f={f} at={20} x={v?380:1240} y={v?150:70} v={v}/>
 </AbsoluteFill>;
}

// ---------- 0:16 TAKEOFF -> ESTIMATE ----------
function Takeoff({f,v}:SP){
 const step=Math.min(6,Math.max(0,Math.floor((f-6)/12))),planOut=ease(f,96,116),tableIn=f>=96&&f<196,linesIn=f>=190;
 const tbl=easeOut(f,96,112)*out(f,186,198);
 return <AbsoluteFill style={{background:'radial-gradient(ellipse 90% 80% at 30% 40%,#18264f,#0a1024 75%)'}}>
  <AivaCorner f={f} x={v?820:1700} y={v?300:880} size={v?170:150}/>
  {/* takeoff marks being counted, category by category (real build frames) */}
  <div style={{opacity:1-planOut}}>
   <Kicker text="TAKEOFF · TUESDAY'S WALK-THROUGH" x={v?60:80} y={v?330:270} f={f} at={0} size={v?30:28}/>
   <Shot src={`ui-v5/takeoff-build-0${step}.png`} cx={500} cy={180} cw={2380} ch={1250} s={v?.405:.66} x={v?54:80} y={v?400:200} f={f} at={0}/>
  </div>
  {/* push into the real count table */}
  {tableIn&&<div style={{opacity:tbl}}><Kicker text="COUNTS FROM THE TAKEOFF" x={v?60:120} y={v?420:240} f={f} at={96} size={v?30:28}/>{v?<Shot src="ui-v5/takeoff-mobile-list.png" sw={1290} sh={2796} cx={0} cy={1560} cw={940} ch={940} s={1.08} x={32} y={480} f={f} at={96}/>:<Shot src="ui-v5/takeoff-desktop.png" cx={380} cy={1590} cw={1340} ch={470} s={v?.72:1.3} x={v?58:110} y={v?480:300} f={f} at={96}/>}</div>}
  {/* real estimate lines priced from the price book */}
  {linesIn&&[0,1,2].map(i=>{const s=v?2.55:2.45,{w}=fragSize('mobile-estimate-sent',`line-${i}`);return <Hero key={i} name="mobile-estimate-sent" frag={`line-${i}`} s={s} x={heroX(v,w,s)} y={(v?420:240)+i*(65*s+16)} f={f} at={192+i*9} from="right" radius={18}/>})}
  {linesIn&&(()=>{const s=v?3.0:2.7,{w}=fragSize('mobile-estimate-sent','total');return <Hero name="mobile-estimate-sent" frag="total" s={s} x={heroX(v,w,s)} y={v?1000:770} f={f} at={222} from="zoom" pad={8} ring={{at:236,rect:{x:0,y:0,w,h:28}}}/>})()}
  {linesIn&&<Kicker text="PRICED FROM TONY'S PRICE BOOK" x={v?60:1000} y={v?350:170} f={f} at={192} size={v?30:26}/>}
 </AbsoluteFill>;
}

// ---------- 0:27 DRAFT REPLY + APPROVE ----------
function Reply({f,v}:SP){
 const s=v?2.5:2.6,q1=T(32.6,'reply'),q2=T(33.6,'reply'),q3=T(34.2,'reply');
 const stage=f<q1+4?'review':f<q3?'confirm':'queued';
 const name=`mobile-draft-reply-${stage}`;
 const frag=stage==='review'?'proposed-reply':stage==='confirm'?'confirm-button':'notice';
 const sc=stage==='confirm'?3.4:s,{w,h}=fragSize(name,frag),hx=heroX(v,w,sc),hy=v?(stage==='confirm'?1000:620):(stage==='confirm'?420:240);
 return <AbsoluteFill style={{background:P.navy}}>
  <World v={v} focus={[760,330]} screen={v?[540,330]:[480,560]} zoom={v?1.0:1.75}><div style={{position:'absolute',inset:0,filter:'blur(2px)'}}><LivingRoom/></div><Svg><g transform="translate(430,138)"><Lit id="rp" w={700} h={780} light={NIGHT_TV}><TonyCouch face={stage==='queued'?{eyes:'smile',brows:'flat',mouth:'smile'}:{eyes:'down',brows:'focus',mouth:'flat'}} thumb={f>=q1-6&&f<q3?1:0}/></Lit></g></Svg></World>
  <Finish seed={14}/><Scrim v={v} from={560}/>
  <Kicker text={stage==='review'?'AIVA DRAFTED THE REPLY · TONY REVIEWS':stage==='confirm'?'TONY APPROVES':'QUEUED FOR DELIVERY'} x={v?60:hx} y={v?(stage==='confirm'?930:550):(stage==='confirm'?350:170)} f={f} at={stage==='review'?4:stage==='confirm'?q1+4:q3} size={v?30:26}/>
  <Hero key={stage} name={name} frag={frag} s={sc} x={hx} y={hy} f={f} at={stage==='review'?6:stage==='confirm'?q1+4:q3} from={stage==='review'?'right':'zoom'} pad={6}/>
  {stage==='review'&&f>q1-30&&(()=>{const qs=1.9*(v?1.25:1),{w:qw}=fragSize('mobile-draft-reply-review','queue-button');return <><Hero name="mobile-draft-reply-review" frag="queue-button" s={qs} x={v?(1080-qw*qs)/2:hx+20} y={v?620+h*s+30:240+h*s+30} f={f} at={q1-30} from="up" bg="transparent" shadow={false} ring={{at:q1-14,rect:{x:0,y:0,w:qw,h:36}}}/><Tap x={v?540:hx+20+qw*qs/2} y={(v?620+h*s+30:270+h*s)+18*qs} f={f} at={q1}/></>})()}
  {stage==='confirm'&&<Tap x={hx+(6+w/2)*sc} y={hy+(6+h/2)*sc} f={f} at={q2}/>}
  {stage==='queued'&&<ClockCard time="9:31 PM" day="Wednesday" f={f-q3} x={v?60:96} y={v?1100:420} scale={v?.6:.6}/>}
 </AbsoluteFill>;
}

// ---------- 0:35 TITLE: what OfficeAdmin is ----------
function Title({f,v}:SP){
 const fade=ease(f,200,240),peek=easeOut(f,30,58);
 return <AbsoluteFill style={{background:P.navy}}>
  <World v={v} focus={[860,560]} zoom={v?1.0:1.0}><LivingRoom tv={.6+.4*Math.abs(Math.sin(f/7))} lamp={1-fade*.8}/><Svg><g transform="translate(430,138)"><Lit id="tt" w={700} h={780} light={NIGHT_TV}><TonyCouch face={{eyes:'smile',brows:'flat',mouth:'smile'}} phoneGlow={.2}/></Lit></g></Svg></World>
  <Finish seed={15}/>
  <AbsoluteFill style={{background:v?'linear-gradient(rgba(6,10,24,.92),rgba(6,10,24,.75) 55%,rgba(6,10,24,.2))':'linear-gradient(90deg,rgba(6,10,24,.94),rgba(6,10,24,.82) 52%,rgba(6,10,24,.1))',opacity:easeOut(f,0,16)}}/>
  <div style={{position:'absolute',left:v?70:110,top:v?300:220,width:v?940:980}}>
   <div style={{position:'relative',width:220,height:122,marginBottom:v?50:34}}>
    <div style={{position:'absolute',left:'50%',top:lerp(40,-78,peek),transform:'translate(-50%,-50%)'}}><Aiva size={170} blink={blinkAt(f,90)}/></div>
    <div style={{position:'absolute',inset:0,background:'#0f1a36',borderRadius:24,opacity:easeOut(f,4,16)}}/><div style={{position:'absolute',left:20,top:6,opacity:easeOut(f,4,16)}}><Logo width={180}/></div>
   </div>
   <div style={{fontFamily:DISPLAY,fontWeight:800,fontSize:v?110:104,letterSpacing:-3.5,color:'#fff',lineHeight:.98,fontVariationSettings:"'wdth' 88",opacity:easeOut(f,8,20),transform:`translateY(${(1-easeOut(f,8,20))*30}px)`}}>That's <span style={{color:P.sky}}>OfficeAdmin.</span></div>
   <div style={{fontFamily:BODY,fontWeight:650,fontSize:v?50:44,color:'#dbe5f3',lineHeight:1.25,marginTop:26,opacity:easeOut(f,40,56)}}>One app that runs a contracting business, from the first text to the final payment.</div>
   <div style={{fontFamily:BODY,fontWeight:650,fontSize:v?46:40,color:'#9fdcff',lineHeight:1.25,marginTop:22,opacity:easeOut(f,140,156)}}>AIVA is the assistant inside it.</div>
   <div style={{marginTop:18,display:'inline-block',padding:'8px 18px',borderRadius:30,background:'rgba(2,132,199,.85)',color:'#fff',fontFamily:BODY,fontWeight:700,fontSize:v?28:24,opacity:easeOut(f,150,164)}}>Private preview</div>
  </div>
  <AbsoluteFill style={{background:'#05070f',opacity:fade}}/>
 </AbsoluteFill>;
}

// ---------- 0:43 7:42 AM SIGNED ----------
function Signed({f,v}:SP){
 const s=v?2.6:2.6,e=T(45.2,'signed'),d=T(46.6,'signed');
 return <AbsoluteFill style={{background:P.day}}>
  <World v={v} focus={[460,420]} screen={v?[540,520]:[460,560]} zoom={v?.95:1.1}><JenKitchen/><Svg><g transform="translate(180,170) scale(1.25)"><Lit id="jn" w={400} h={900} light={DAY} cast={{dx:40,dy:-10,opacity:.18,blur:14}}><Person o={JEN} face={f<e?{eyes:'open',brows:'flat',mouth:'flat',look:5}:{eyes:'smile',brows:'up',mouth:'grin'}} armR={44} foreR={110} armL={6} foreL={10} hold={<HandPhone/>} headTurn={1}/></Lit></g></Svg></World>
  <Finish seed={16} vignette={.2}/><Scrim v={v} from={760}/>
  <ClockCard time="7:42 AM" day="Thursday" f={f} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  {f<e&&(()=>{const {w}=fragSize('mobile-portal-estimate-sent','deposit-due');return <><Kicker text="JEN'S CLIENT PORTAL" x={v?60:heroX(v,w,s)} y={v?1000:270} f={f} at={8} color={P.oaBlue}/><Hero name="mobile-portal-estimate-sent" frag="deposit-due" s={s} x={heroX(v,w,s)} y={v?1060:330} f={f} at={10} pad={14}/></>})()}
  {f>=e&&(()=>{const {w}=fragSize('mobile-estimate-signed','signature');return <><Kicker text="E-SIGNED" x={heroX(v,w,s)} y={v?850:280} f={f} at={e} color={P.oaBlue}/><Hero name="mobile-estimate-signed" frag="signature" s={s} x={heroX(v,w,s)} y={v?910:340} f={f} at={e} from="zoom" ring={{at:e+10,rect:{x:0,y:0,w,h:46},color:P.green}}/></>})()}
  {f>=d&&(()=>{const {w}=fragSize('mobile-estimate-signed','deposit-invoice');return <><Kicker text="DEPOSIT INVOICE · PAY LINK READY" x={heroX(v,w,s)} y={v?1100:520} f={f} at={d} color={P.oaBlue}/><Hero name="mobile-estimate-signed" frag="deposit-invoice" s={s} x={heroX(v,w,s)} y={v?1160:580} f={f} at={d} pad={6}/></>})()}
 </AbsoluteFill>;
}

// ---------- 0:49 SCHEDULE ----------
function Schedule({f,v}:SP){
 const s=v?2.45:2.6,r0=rect('mobile-schedule-week','crew-0'),cy=r0.y-52,ch=150;
 return <AbsoluteFill style={{background:P.day}}>
  <World v={v} focus={[900,560]} screen={v?[540,560]:[560,560]} zoom={v?1:1.05}><Exterior morning={false}/><Svg><g transform="translate(560,240) scale(1.3)"><Lit id="sc" w={400} h={900} light={DAY}><Person o={TONY_STAND} face={{eyes:'down',brows:'focus',mouth:'smile'}} armR={40} foreR={110} armL={4} hold={<HandPhone/>}/></Lit></g></Svg></World>
  <Finish seed={17} vignette={.2}/><Scrim v={v} from={760}/>
  <ClockCard time="Friday" day="Booking next week" f={f} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  <Kicker text="CREW SCHEDULE · MONDAY" x={heroX(v,376,s)} y={v?960:270} f={f} at={10} color={P.oaBlue}/>
  <Clip name="mobile-schedule-week" cx={13} cy={cy} cw={376} ch={ch} s={s} x={heroX(v,376,s)} y={v?1020:330} f={f} at={12} ring={{id:'crew-0',at:40,color:P.green}}/>
 </AbsoluteFill>;
}

// ---------- 0:55 SUNDAY 11:48 PM: THE CATCH ----------
function Catch({f,v}:SP){
 const s=v?2.6:2.6,bl=T(56.4,'catch'),bz=T(57.4,'catch'),aiv=T(62.9,'catch'),wake=T(65.6,'catch'),q1=T(66.4,'catch'),q2=T(67.0,'catch');
 const lit=f>=bz?1:0,stage=f<aiv-6?'status':f<q1+4?'review':f<q2+6?'confirm':'queued';
 return <AbsoluteFill style={{background:P.navy}}>
  <World v={v} focus={[1000,640]} screen={v?[540,520]:undefined} zoom={v?1:1.0}><Bedroom/><TonyInBed wake={f>=wake?1:0} arm={ease(f,wake,wake+20)}/>
   <Glow x={1600} y={680} r={220} color="#bfe6ff" opacity={lit*(.5+.2*Math.sin(f/4))}/><Svg><rect x="1572" y="660" width="56" height="26" rx="6" fill={lit?'#d8efff':'#222'} transform="rotate(-8 1600 673)"/></Svg>
  </World>
  <Finish seed={18} vignette={.55}/><Scrim v={v} from={720}/>
  <ClockCard time="11:48 PM" day="Sunday" f={f} x={v?60:80} y={v?60:50} scale={v?.72:.72}/>
  <AivaCorner f={f} at={bl-20} x={v?800:90} y={v?110:300} size={v?190:200}/>
  {stage==='status'&&f>=bz&&(()=>{const {w}=fragSize('mobile-status-card','who-owes-next');return <><Kicker text="AIVA'S NIGHTLY READ OF THE JOB" x={heroX(v,w,s)} y={v?900:280} f={f} at={bz} color="#ffcf7a"/><Hero name="mobile-status-card" frag="who-owes-next" s={s} x={heroX(v,w,s)} y={v?960:340} f={f} at={bz+4} pad={10} bg="#fffaf0" from="zoom" ring={{at:bz+30,rect:{x:-6,y:-6,w:w+12,h:56},color:P.amber}}/><Hero name="mobile-status-card" frag="needs-you" s={s*.92} x={heroX(v,w,s*.92)} y={v?1220:510} f={f} at={bz+40} pad={10} bg="#fffaf0"/></>})()}
  {stage!=='status'&&(()=>{const name=`mobile-draft-catch-${stage}`,frag=stage==='review'?'proposed-reply':stage==='confirm'?'confirm-button':'notice',ss=stage==='confirm'?3.4:(v?2.5:2.6),{w,h}=fragSize(name,frag),hx=heroX(v,w,ss),hy=v?(stage==='confirm'?1000:780):(stage==='confirm'?420:240);
   return <><Kicker text={stage==='review'?'AIVA DRAFTED A REMINDER':stage==='confirm'?'TONY APPROVES, HALF ASLEEP':'QUEUED FOR DELIVERY'} x={hx} y={hy-60} f={f} at={stage==='review'?aiv-6:stage==='confirm'?q1+4:q2+6}/><Hero key={stage} name={name} frag={frag} s={ss} x={hx} y={hy} f={f} at={stage==='review'?aiv-6:stage==='confirm'?q1+4:q2+6} from="zoom" pad={6}/>
    {stage==='review'&&f>wake-6&&(()=>{const qs=ss*.95,{w:qw}=fragSize('mobile-draft-catch-review','queue-button');return <><Hero name="mobile-draft-catch-review" frag="queue-button" s={qs} x={hx+10} y={hy+h*ss+24} f={f} at={wake-6} bg="transparent" shadow={false} ring={{at:wake+4,rect:{x:0,y:0,w:qw,h:36}}}/><Tap x={hx+10+qw*qs/2} y={hy+h*ss+24+18*qs} f={f} at={q1}/></>})()}
    {stage==='confirm'&&<Tap x={hx+(6+w/2)*ss} y={hy+(6+h/2)*ss} f={f} at={q2}/>}</>})()}
  <PreviewPill f={f} at={bl} x={v?60:80} y={v?240:230} v={v}/>
 </AbsoluteFill>;
}

// ---------- 1:08 MONDAY: PAID, CLOCKED IN ----------
function Monday({f,v}:SP){
 const s=v?2.5:2.6,ck=T(71.0,'monday');
 return <AbsoluteFill style={{background:P.day}}>
  <World v={v} focus={[900,560]} screen={v?[540,560]:[620,560]} zoom={v?1:1.05}><Exterior/><Svg><g transform="translate(600,230) scale(1.32)"><Lit id="ry" w={400} h={900} light={DAY}><Person o={RAY} face={{eyes:'down',brows:'flat',mouth:'smile'}} armR={40} foreR={110} hold={<HandPhone/>}/></Lit></g><g transform="translate(300,330) scale(1.1)"><Lit id="sm" w={400} h={900} light={DAY}><Person o={SAM} face={{eyes:'open',brows:'flat',mouth:'smile',look:4}} armL={10}/></Lit></g></Svg></World>
  <Finish seed={19} vignette={.2}/><Scrim v={v} from={760}/>
  <ClockCard time={f<ck-30?'6:51 AM':'7:00 AM'} day="Monday" f={f<ck-30?f:f-(ck-30)} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  {f<ck-30&&(()=>{const {w}=fragSize('mobile-invoice-deposit-paid','payment');return <><Kicker text="DEPOSIT · PAID" x={heroX(v,w,s)} y={v?940:280} f={f} at={6} color={P.green}/><Hero name="mobile-invoice-deposit-paid" frag="payment" s={s*.92} x={heroX(v,w,s*.92)} y={v?1000:340} f={f} at={8} from="zoom" ring={{at:22,rect:{x:0,y:0,w,h:fragSize('mobile-invoice-deposit-paid','payment').h},color:P.green}}/></>})()}
  {f>=ck-30&&f<ck+18&&(()=>{const {w}=fragSize('mobile-member-today','calder-shift');return <><Kicker text="RAY'S APP · TODAY" x={heroX(v,w,s*.9)} y={v?880:240} f={f} at={ck-30}/><Hero name="mobile-member-today" frag="calder-shift" s={s*.9} x={heroX(v,w,s*.9)} y={v?940:300} f={f} at={ck-28}/><Hero name="mobile-member-today" frag="clock-in-button" s={s*.9} x={heroX(v,336,s*.9)} y={v?1440:690} f={f} at={ck-20} bg="transparent" shadow={false}/><Tap x={v?540:heroX(v,336,s*.9)+336*s*.45} y={(v?1440:690)+24*s*.9} f={f} at={ck}/></>})()}
  {f>=ck+18&&(()=>{const r=rect('mobile-time-clock-in','running-card');return <><Kicker text="TIME CLOCK · 7:00 AM" x={heroX(v,378,s)} y={v?900:250} f={f} at={ck+18} color={P.green}/><Clip name="mobile-time-clock-in" cx={r.x} cy={r.y} cw={378} ch={150} s={s} x={heroX(v,378,s)} y={v?960:310} f={f} at={ck+18} ring={{id:'clocked-in-heading',at:ck+30,color:P.green}}/></>})()}
 </AbsoluteFill>;
}

// ---------- 1:13 DAILY REPORT ----------
function Photos({f,v}:SP){
 const s=v?2.35:2.25,sh=T(76.4,'photos'),ph=rect('mobile-daily-report','photo-0'),r={y:228};
 return <AbsoluteFill style={{background:P.day}}>
  <World v={v} focus={[640,480]} screen={v?[540,500]:[600,540]} zoom={v?1:1.08}><KitchenWall/><Svg><g transform="translate(980,170) scale(1.3)"><Lit id="rp2" w={400} h={900} light={DAY}><Person o={RAY} face={{eyes:'open',brows:'flat',mouth:'smile',look:-5}} armL={150} foreL={-40} armR={150} foreR={-40} headTurn={-2}/></Lit></g></Svg></World>
  <AbsoluteFill style={{background:'#fff',opacity:f>=sh&&f<sh+5?.85-(f-sh)*.17:0}}/>
  <Finish seed={20} vignette={.2}/><Scrim v={v} from={720}/>
  <ClockCard time="4:30 PM" day="Day 1 · Calder Kitchen" f={f} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  <Kicker text="DAILY REPORT" x={heroX(v,376,s)} y={v?800:220} f={f} at={14} color={P.oaBlue}/>
  <Clip name="mobile-daily-report" cx={13} cy={r.y-8} cw={376} ch={ph.y+ph.h-r.y+8} s={s} x={heroX(v,376,s)} y={v?860:250} f={f} at={16}/>
  {f>=sh&&<div style={{position:'absolute',left:v?150:180,top:v?1400:600,width:v?320:300,height:v?240:225,borderRadius:16,overflow:'hidden',boxShadow:'0 20px 50px rgba(0,0,0,.4)',border:'6px solid #fff',transform:`rotate(-6deg) scale(${.6+.4*pop(f,sh,18)})`}}><div style={{transform:`scale(${(v?320:300)/960})`,transformOrigin:'0 0',width:960,height:720,position:'relative'}}><PhotoRangeWall/></div></div>}
 </AbsoluteFill>;
}

// ---------- 1:20 THE WALL ----------
function Wall({f,v}:SP){
 const sting=T(82.6,'wall'),co=T(86.2,'wall'),sign=T(91.8,'wall'),shake=f>=sting&&f<sting+8?Math.sin(f*3)*6:0,office=f>=sign-40;
 const s=v?2.45:2.6;
 return <AbsoluteFill style={{background:P.day}}>
  {!office?<World v={v} focus={[600,480]} screen={v?[540,560]:[640,560]} zoom={(v?1:1.02)+ease(f,0,co)*.05}>
   <div style={{position:'absolute',inset:0,transform:`translateX(${shake}px)`}}><KitchenWall beam={f<30?0:1}/>
   <Svg><path d="M470,470 L600,330 L700,560Z" fill="#fff6c8" opacity={f<30?0:.2}/>
    <g transform="translate(-40,140) scale(1.32)"><Lit id="wsam" w={400} h={900} light={DAY} cast={{dx:46,dy:-18,opacity:.22,blur:14}}><Person o={SAM} face={f<sting?{eyes:'open',brows:'flat',mouth:'flat',look:5}:{eyes:'wide',brows:'up',mouth:'o',look:6}} armR={112} foreR={-28} armL={4} foreL={-6} lean={3} headTurn={2} hold={<g transform="translate(0,14) rotate(90)"><rect x="-10" y="-13" width="58" height="26" rx="8" fill="#2a2f3a"/><rect x="44" y="-19" width="22" height="38" rx="6" fill="#3a404c"/><rect x="64" y="-15" width="6" height="30" rx="2" fill="#fff6c8"/></g>}/></Lit></g>
    <g transform="translate(1040,330) scale(1.12)"><Lit id="wray" w={400} h={900} light={DAY} cast={{dx:40,dy:-14,opacity:.2,blur:14}}><Person o={RAY} face={f<sting+6?{eyes:'open',brows:'flat',mouth:'flat',look:-6}:{eyes:'open',brows:'worried',mouth:'grimace',look:-6}} armL={150} foreL={95} armR={14} foreR={30} headTurn={-2} headTilt={-4}/></Lit></g></Svg></div>
  </World>:<World v={v} focus={[700,520]} screen={v?[540,560]:[600,560]} zoom={v?1:1.05}><Office/><Svg><g transform="translate(560,180) scale(1.3)"><Lit id="wjen" w={400} h={900} light={DAY}><Person o={JEN} face={f<sign?{eyes:'down',brows:'flat',mouth:'flat'}:{eyes:'smile',brows:'flat',mouth:'smile'}} armR={40} foreR={110} hold={<HandPhone/>}/></Lit></g></Svg></World>}
  <Finish seed={21} vignette={.22}/><Scrim v={v} from={760}/>
  <ClockCard time={office?'11:12 AM':'10:05 AM'} day={office?'Jen, at work':'Day 3 · Calder Kitchen'} f={office?f-(sign-40):f} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  {f>=co&&(()=>{const nm=f<sign?'mobile-change-orders-pending':'mobile-change-orders-approved',{w}=fragSize(nm,'co-row');return <><Kicker text={f<sign?'CHANGE ORDER · SENT FOR SIGNATURE':'CHANGE ORDER · SIGNED'} x={heroX(v,w,s)} y={v?840:250} f={f} at={f<sign?co:sign} color={f<sign?P.oaBlue:P.green}/><Hero key={nm} name={nm} frag="co-row" s={s} x={heroX(v,w,s)} y={v?900:310} f={f} at={f<sign?co+2:sign} from={f<sign?'right':'zoom'} ring={f>=sign?{at:sign+10,rect:{x:0,y:0,w,h:fragSize(nm,'co-row').h},color:P.green}:undefined}/></>})()}
  {f>=sign+24&&(()=>{const {w}=fragSize('mobile-change-orders-approved','contract-revised');return <Hero name="mobile-change-orders-approved" frag="contract-revised" s={s*.95} x={heroX(v,w,s*.95)} y={v?1220:610} f={f} at={sign+24}/>})()}
 </AbsoluteFill>;
}

// ---------- 1:35 PUNCH LIST + INSPECTION ----------
function Punch({f,v}:SP){
 const s=v?2.4:2.6,st=T(98.4,'punch'),pg=rect('mobile-punch-list','punch-progress');
 return <AbsoluteFill style={{background:P.day}}>
  <World v={v} focus={[700,480]} screen={v?[540,520]:[560,560]} zoom={v?1:1.05}><JenKitchen done/><Svg><g transform="translate(1250,250) scale(1.2)"><Lit id="pray" w={400} h={900} light={DAY}><Person o={RAY} face={{eyes:'smile',brows:'flat',mouth:'grin'}} armR={150} foreR={-20} armL={8}/></Lit></g></Svg></World>
  <Finish seed={22} vignette={.2}/><Scrim v={v} from={760}/>
  <ClockCard time="Day 9" day="Closeout" f={f} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  <Kicker text="PUNCH LIST" x={heroX(v,376,s)} y={v?860:270} f={f} at={4} color={P.oaBlue}/>
  <Clip name="mobile-punch-list" cx={13} cy={pg.y-10} cw={376} ch={180} s={s} x={heroX(v,376,s)} y={v?920:330} f={f} at={6}/>
  {f>=st&&<div style={{position:'absolute',left:v?260:1180,top:v?1420:680,padding:'16px 34px',borderRadius:14,border:'8px solid #16a34a',color:'#16a34a',fontFamily:DISPLAY,fontWeight:800,fontSize:v?74:66,letterSpacing:2,background:'rgba(255,255,255,.92)',transform:`rotate(-8deg) scale(${1.6-.6*pop(f,st,14)})`,opacity:clamp((f-st)/4)}}>INSPECTION PASSED</div>}
 </AbsoluteFill>;
}

// ---------- 1:39 INVOICES PAID ----------
function Invoice({f,v}:SP){
 const s=v?2.4:2.6,cv=T(102.2,'invoice'),p1=T(104.4,'invoice');
 return <AbsoluteFill style={{background:P.day}}>
  <World v={v} focus={[560,480]} screen={v?[540,520]:[520,560]} zoom={v?1:1.05}><JenKitchen done/><Svg><g transform="translate(260,200) scale(1.25)"><Lit id="ijen" w={400} h={900} light={DAY}><Person o={JEN} face={f<p1?{eyes:'down',brows:'flat',mouth:'smile'}:{eyes:'smile',brows:'up',mouth:'grin'}} armR={40} foreR={110} hold={<HandPhone/>}/></Lit></g></Svg></World>
  <Finish seed={23} vignette={.2}/><Scrim v={v} from={760}/>
  <ClockCard time="Day 10" day="Final bill" f={f} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>
  {f<cv-10?(()=>{const {w}=fragSize('mobile-invoice-final-paid','total');return <><Kicker text="ESTIMATE → FINAL INVOICE INV-01488" x={heroX(v,w,s*1.1)} y={v?880:280} f={f} at={4} color={P.oaBlue}/><Hero name="mobile-invoice-final-paid" frag="total" s={s*1.1} x={heroX(v,w,s*1.1)} y={v?940:340} f={f} at={6} pad={14}/><Hero name="mobile-change-orders-approved" frag="convert-button" s={s*1.3} x={v?470:1300} y={v?1170:520} f={f} at={cv-40} bg="#fff" pad={8} ring={{at:cv-30,rect:{x:-8,y:-8,w:52,h:52}}}/><Pill text="Convert change order to invoice" x={v?120:1000} y={v?1330:700} f={f} at={cv-36} size={v?34:30}/><Tap x={v?540:1300+26*s*1.3} y={(v?1170:520)+26*s*1.3} f={f} at={cv}/></>})()
  :(()=>{const {w}=fragSize('mobile-invoice-co-paid','line-0');return <><Kicker text="INV-01489 · CHANGE ORDER" x={heroX(v,w,s)} y={v?860:240} f={f} at={cv-10} color={P.oaBlue}/><Hero name="mobile-invoice-co-paid" frag="line-0" s={s} x={heroX(v,w,s)} y={v?920:300} f={f} at={cv-8}/>{f>=p1&&<div style={{position:'absolute',left:v?320:1320,top:v?1240:430,padding:'12px 34px',borderRadius:14,border:'8px solid #16a34a',color:'#16a34a',fontFamily:DISPLAY,fontWeight:800,fontSize:v?80:72,background:'rgba(255,255,255,.92)',transform:`rotate(-8deg) scale(${1.6-.6*pop(f,p1,14)})`}}>BOTH PAID</div>}</>})()}
 </AbsoluteFill>;
}

// ---------- 1:46 THE BOOKS + MIA'S GAME ----------
function Books({f,v}:SP){
 const s=v?2.3:2.6,bk=T(107.6,'books'),jc=T(110.2,'books'),rp=T(112.0,'books'),game=T(113.2,'books'),hit=T(115.0,'books');
 const ui=f<game-4;
 return <AbsoluteFill style={{background:'#ffd9a8'}}>
  <World v={v} focus={[960,700]} screen={v?[540,620]:undefined} zoom={v?1:1}><Ballfield/><Svg>
   <g transform="translate(860,470) scale(.55)"><Person o={MIA} face={{eyes:f>=hit?'smile':'open',brows:'up',mouth:f>=hit?'grin':'flat',look:4}} armR={f<hit?120:60} foreR={f<hit?-60:-10} armL={f<hit?110:70} foreL={-40} hold={<Bat/>} lean={f>=hit?-6:0}/></g>
   <rect x="1010" y="760" width="12" height="70" fill="#333"/>{f<hit&&<circle cx="1016" cy="752" r="14" fill="#fff"/>}{f>=hit&&<circle cx={1016+(f-hit)*26} cy={752-(f-hit)*16+(f-hit)*(f-hit)*.4} r="14" fill="#fff"/>}
   <g transform="translate(120,520) scale(1.3)"><Lit id="btony" w={400} h={900} light={DAY}><Person o={TONY_STAND} face={f>=hit?{eyes:'smile',brows:'up',mouth:'grin'}:{eyes:ui?'down':'open',brows:'flat',mouth:'smile',look:6}} armR={f>=hit?160:40} foreR={f>=hit?-10:110} armL={f>=hit?160:6} foreL={f>=hit?-10:10} hold={f<hit?<HandPhone/>:undefined}/></Lit></g>
  </Svg></World>
  <Finish seed={24} vignette={.2}/>{ui&&<Scrim v={v} from={700}/>}
  {ui&&<AbsoluteFill style={{background:v?'transparent':'linear-gradient(90deg,rgba(6,10,24,0) 40%,rgba(6,10,24,.55))'}}/>}
  {ui&&f<jc&&(()=>{const r=rect('mobile-bank-feed','deposit-01488'),m=rect('mobile-bank-feed','match-01488');return <><Kicker text="BANK FEED · MATCHED TO THE INVOICE" x={heroX(v,376,s)} y={v?860:270} f={f} at={bk-6}/><Clip name="mobile-bank-feed" cx={13} cy={r.y} cw={376} ch={m.y-r.y+40} s={s} x={heroX(v,376,s)} y={v?920:330} f={f} at={bk-4} ring={{id:'match-01488',at:bk+14,color:P.green}}/></>})()}
  {ui&&f>=jc&&f<rp&&(()=>{const a=fragSize('mobile-job-costing','metric-revenue'),ss=v?s*1.12:2.45;return <><Kicker text="JOB COSTING · CALDER KITCHEN" x={heroX(v,a.w*2+8,ss)} y={v?860:270} f={f} at={jc}/><Hero name="mobile-job-costing" frag="metric-revenue" s={ss} x={heroX(v,a.w*2+8,ss)} y={v?920:330} f={f} at={jc}/><Hero name="mobile-job-costing" frag="metric-profit" s={ss} x={heroX(v,a.w*2+8,ss)+(a.w+8)*ss} y={v?920:330} f={f} at={jc+6} ring={{at:jc+20,rect:{x:0,y:0,w:a.w,h:a.h},color:P.green}}/></>})()}
  {ui&&f>=rp&&(()=>{const a=fragSize('dashboard','metric-net-income'),ss=s*1.25;return <><Kicker text="REPORTS · THE WHOLE BUSINESS" x={heroX(v,a.w,ss)} y={v?860:270} f={f} at={rp}/><Hero name="dashboard" frag="metric-net-income" s={ss} x={heroX(v,a.w,ss)} y={v?920:330} f={f} at={rp} from="zoom"/></>})()}
  {!ui&&<ClockCard time="Saturday" day="Mia's game" f={f-game} x={v?60:96} y={v?60:60} dark={false} scale={v?.7:.8}/>}
 </AbsoluteFill>;
}

// ---------- 1:57 KICKER ----------
function Kicker2({f,v}:SP){
 const bz=T(117.0,'kicker'),bl=T(120.6,'kicker');
 return <AbsoluteFill style={{background:'#ffd9a8'}}>
  <World v={v} focus={[420,640]} screen={v?[540,1250]:[560,640]} zoom={v?1.15:1.45}><Ballfield/><Svg><g transform="translate(120,520) scale(1.3)"><Lit id="ktony" w={400} h={900} light={DAY}><Person o={TONY_STAND} face={f<bz+40?{eyes:'down',brows:'up',mouth:'o'}:{eyes:'smile',brows:'up',mouth:'grin'}} armR={40} foreR={110} hold={<HandPhone/>}/></Lit></g></Svg></World>
  <Finish seed={25} vignette={.25}/>
  <TextBubble from="Jen Calder" time="now" x={v?60:960} y={v?170:150} w={v?960:820} f={f} at={bz-12} body="Who runs your office?? You're SO organized. Also... can you do our bathroom next? 😅"/>
  {f>=bl-10&&<div style={{position:'absolute',left:v?720:1580,top:v?560:640}}><Aiva size={v?260:240} blink={blinkAt(f,bl)}/></div>}
  {f>=bl+16&&<div style={{position:'absolute',left:v?250:1080,top:v?850:860,fontFamily:DISPLAY,fontWeight:800,fontSize:v?58:52,color:P.ink,opacity:easeOut(f,bl+16,bl+28)}}>"Just me." <span style={{color:P.oaBlue}}>(And AIVA.)</span></div>}
 </AbsoluteFill>;
}

// ---------- 2:02 RECAP ----------
function Recap({f,v}:SP){
 const B=TL.badges as {label:string}[],cols=v?2:4;
 return <AbsoluteFill style={{background:'radial-gradient(ellipse 80% 70% at 50% 40%,#16244a,#070c18 75%)'}}>
  <div style={{position:'absolute',left:0,right:0,top:v?180:70,textAlign:'center',fontFamily:DISPLAY,fontWeight:800,fontSize:v?76:70,color:'#fff',letterSpacing:-2,fontVariationSettings:"'wdth' 88",opacity:easeOut(f,0,10)}}>One job. <span style={{color:P.sky}}>Everything Tony used.</span></div>
  <div style={{position:'absolute',left:v?60:110,right:v?60:110,top:v?380:210,display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:v?22:24}}>
   {B.map((b,i)=>{const at=10+i*6,q=pop(f,at,14);return <div key={b.label} style={{padding:v?'22px 24px':'22px 24px',borderRadius:20,background:b.label.startsWith('AIVA')?'linear-gradient(#3ba4e0,#0284c7)':'#fff',color:b.label.startsWith('AIVA')?'#fff':P.ink,fontFamily:BODY,fontWeight:800,fontSize:v?46:42,textAlign:'center',transform:`scale(${.5+.5*q})`,opacity:clamp(q*2),boxShadow:'0 10px 30px rgba(0,0,0,.35)'}}>{b.label}</div>})}
  </div>
 </AbsoluteFill>;
}

// ---------- 2:08 END CARD (official lockup arrangement, as approved in V4) ----------
function End({f,v}:SP){
 const peek=easeOut(f,16,44),words=['Your','office','never','clocks','out.'];
 return <AbsoluteFill style={{background:'radial-gradient(ellipse 80% 70% at 50% 40%,#16244a,#070c18 75%)'}}>
  <div style={{position:'absolute',left:(v?1080:1920)/2,top:v?520:300,transform:'translate(-50%,-50%)'}}>
   <div style={{position:'absolute',left:'50%',top:lerp(45,-64,peek),transform:'translate(-50%,-50%)',opacity:peek}}><Aiva size={v?300:240} blink={Math.min(blinkAt(f,62),blinkAt(f,140))}/></div>
   <div style={{position:'relative',padding:'20px 16px',background:'#070c18',borderRadius:24}}><Logo width={v?380:320}/></div>
  </div>
  <div style={{position:'absolute',left:0,right:0,top:v?760:470,textAlign:'center',fontFamily:BODY,fontWeight:700,fontSize:v?96:84,color:'#fff',letterSpacing:-2,opacity:easeOut(f,4,18)}}>OfficeAdmin</div>
  <div style={{position:'absolute',left:0,right:0,top:v?880:575,textAlign:'center',fontFamily:BODY,fontWeight:600,fontSize:v?42:36,color:'#c9d6ea',opacity:easeOut(f,12,26)}}>with AIVA. Built for contractors.</div>
  <div style={{position:'absolute',left:v?40:0,right:v?40:0,top:v?1040:660,textAlign:'center',fontFamily:DISPLAY,fontWeight:800,fontSize:v?92:80,letterSpacing:-2.5,color:'#fff',fontVariationSettings:"'wdth' 88",lineHeight:1.02}}>
   {words.map((w,i)=>{const q=pop(f,30+i*5,20);return <span key={w} style={{display:'inline-block',marginRight:i<4?22:0,transform:`translateY(${(1-q)*40}px)`,opacity:clamp((f-30-i*5)/6),color:i>=3?P.sky:'#fff'}}>{w}</span>})}
  </div>
  <div style={{position:'absolute',left:0,right:0,top:v?1300:790,textAlign:'center',fontFamily:BODY,fontWeight:750,fontSize:v?52:44,color:P.sky,opacity:easeOut(f,60,74)}}>officeadmin.io</div>
  <div style={{position:'absolute',left:0,right:0,top:v?1420:872,display:'flex',justifyContent:'center',opacity:easeOut(f,70,84)}}><div style={{padding:'10px 24px',borderRadius:30,background:'rgba(2,132,199,.9)',color:'#fff',fontFamily:BODY,fontWeight:700,fontSize:v?34:28}}>AIVA is in private preview</div></div>
  <div style={{position:'absolute',left:v?60:0,right:v?60:0,top:v?1560:965,textAlign:'center',fontFamily:BODY,fontSize:v?28:22,lineHeight:1.45,color:'#8496b4',opacity:easeOut(f,80,96)}}>Actual app interface. Fictional business, customer and data. Illustrated story.</div>
 </AbsoluteFill>;
}

const SCENES:Record<string,(p:SP)=>React.ReactNode>={hook:Hook,stakes:Stakes,aiva:AivaScene,takeoff:Takeoff,reply:Reply,title:Title,signed:Signed,schedule:Schedule,catch:Catch,monday:Monday,photos:Photos,wall:Wall,punch:Punch,invoice:Invoice,books:Books,kicker:Kicker2,recap:Recap,end:End};
function Local({id,v}:{id:string;v:boolean}){const f=useCurrentFrame();const C=SCENES[id];return <>{C({f,v})}</>}
// Short punch-in transition at each cut.
function CutFlash({v}:{v:boolean}){const f=useCurrentFrame(),t=f/30,starts=(TL.scenes as {start:number}[]).map(s=>s.start).filter(s=>s>0);const d=Math.min(...starts.map(s=>Math.abs(t-s)));return d<.07?<AbsoluteFill style={{background:'#fff',opacity:.18*(1-d/.07)}}/>:null}
function Overlays({v}:{v:boolean}){const f=useCurrentFrame(),t=f/30;const noCap=t>=122.6;return <><FeatureHUD t={t} v={v}/><Captions t={t} v={v} hide={noCap}/><CutFlash v={v}/></>}

export function FilmV5({vertical=false,sound=false}:{vertical?:boolean;sound?:boolean}){
 return <AbsoluteFill style={{background:'#000'}}><Fonts/>{sound&&<Audio src={staticFile('audio/v5/master.m4a')}/>}
  {(TL.scenes as {id:string;start:number;end:number}[]).map(s=><Sequence key={s.id} from={Math.round(s.start*30)} durationInFrames={Math.round((s.end-s.start)*30)} name={s.id}><Local id={s.id} v={vertical}/></Sequence>)}
  <Overlays v={vertical}/>
 </AbsoluteFill>;
}
