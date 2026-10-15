import React, {type CSSProperties, type ReactNode} from 'react';
import {AbsoluteFill, Audio, Img, interpolate, Easing, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {useFont} from './design';

export const V2_FPS = 30;
export const V2_SECONDS = 96;
export const V2_FRAMES = V2_SECONDS * V2_FPS;
export const V2_CUTS = [0, 6, 14, 24, 34, 42, 50, 58, 64, 74, 82, 88, 96];
const P = {ink:'#111214', paper:'#f4f5f5', white:'#ffffff', blue:'#0284c7', sky:'#3ba4e0', dark:'#07090d', muted:'#7a818b'};
const e = (f:number, a:number, b:number) => interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.22,1,.36,1)});
const mix = (a:number,b:number,t:number) => a+(b-a)*t;
const clip = (v:number) => Math.max(0,Math.min(1,v));
const shot = (name:string) => staticFile(`ui/${name}.png`);

function Stage({children,dark=false}:{children:ReactNode;dark?:boolean}) {
  return <AbsoluteFill style={{background:dark?P.dark:P.paper,color:dark?'#f7f8fa':P.ink,overflow:'hidden',perspective:2400}}>
    <AbsoluteFill style={{pointerEvents:'none',background:dark?'radial-gradient(ellipse at 72% 88%, #0f294140 0%, #07090d00 57%)':'radial-gradient(ellipse at 40% 20%,#ffffff 0%,#ffffff00 70%)'}}/>
    {children}
  </AbsoluteFill>;
}
function Label({children,x,y,dark=false,center=false,size=20,style={}}:{children:ReactNode;x:number;y:number;dark?:boolean;center?:boolean;size?:number;style?:CSSProperties}) {
  return <div style={{position:'absolute',left:x,top:y,transform:center?'translateX(-50%)':undefined,color:dark?'#939da9':'#707986',fontSize:size,fontWeight:550,letterSpacing:2.2,lineHeight:1.35,whiteSpace:'nowrap',...style}}>{children}</div>;
}
function Title({lines,x,y,f,delay=0,size=108,width=900,center=false,color,dark=false,gap=0}:{lines:(string|ReactNode)[];x:number;y:number;f:number;delay?:number;size?:number;width?:number;center?:boolean;color?:string;dark?:boolean;gap?:number}) {
  return <div style={{position:'absolute',left:x,top:y,width,transform:center?'translateX(-50%)':undefined,textAlign:center?'center':'left',fontWeight:650,fontSize:size,lineHeight:1.025,letterSpacing:-size*.052,color:color??(dark?'#f7f8fa':P.ink)}}>
    {lines.map((line,i)=><div key={i} style={{paddingBottom:size*.12,marginBottom:gap,overflow:'hidden'}}><div style={{transform:`translateY(${(1-e(f,delay+i*5,delay+i*5+29))*112}%)`,opacity:e(f,delay+i*5,delay+i*5+18),whiteSpace:'nowrap'}}>{line}</div></div>)}
  </div>;
}
function Brand({kind='oa',dark=false,x,y,width=140,opacity=1}:{kind?:'oa'|'aiva';dark?:boolean;x:number;y:number;width?:number;opacity?:number}) {
  const src=kind==='oa'?`brand/oa-${dark?'dark':'light'}-trim.png`:`brand/aiva-${dark?'dark':'light'}-complete.png`;
  return <Img src={staticFile(src)} style={{position:'absolute',left:x,top:y,width,height:kind==='oa'?width*565/1024:width,objectFit:'contain',opacity}}/>;
}
function StatusBar({dark=false}:{dark?:boolean}) {
  const c=dark?'#fff':'#111';
  return <div style={{height:60,position:'absolute',left:0,top:0,width:402,color:c,fontFamily:'Arial,sans-serif'}}>
    <div style={{position:'absolute',left:30,top:22,fontSize:15,fontWeight:700,letterSpacing:-.35}}>9:41</div>
    <div style={{position:'absolute',left:140,top:10,width:122,height:35,borderRadius:22,background:'#020203',boxShadow:'inset 0 0 0 1px #151519'}}><div style={{position:'absolute',right:13,top:14,width:7,height:7,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%,#102235,#05070b 70%)'}}/></div>
    <div style={{position:'absolute',right:63,top:24,display:'flex',gap:2,alignItems:'flex-end',height:11}}>{[4,6,9,11].map((h,i)=><div key={i} style={{width:3,height:h,borderRadius:1,background:c}}/>)}</div>
    <svg width="17" height="14" viewBox="0 0 20 16" style={{position:'absolute',right:40,top:23}}><path d="M2 5 Q10 -1 18 5 M5 8 Q10 4 15 8 M8 11 Q10 9 12 11" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="14" r="1.1" fill={c}/></svg>
    <div style={{position:'absolute',right:12,top:24,width:23,height:11,borderRadius:3,border:`1px solid ${c}77`,padding:1.5}}><div style={{height:'100%',width:'100%',borderRadius:1,background:c}}/><div style={{position:'absolute',right:-3,top:3,width:2,height:4,borderRadius:1,background:c}}/></div>
  </div>;
}
/** iPhone 17 Pro front study: body 71.9 x 150mm; screen 1206 x 2622px.
 * 434 x 906 outer canvas / 402 x 874 display preserves those proportions.
 * The screenshot is the actual responsive web UI, not a replacement UI.
 */
export function Phone({x,y,scale=1,rx=0,ry=0,rz=0,name,dark=false,other,cross=0,opacity=1}:{x:number;y:number;scale?:number;rx?:number;ry?:number;rz?:number;name:string;dark?:boolean;other?:string;cross?:number;opacity?:number}) {
  return <div style={{position:'absolute',left:x,top:y,width:434,height:906,transform:`translate(-50%,-50%) perspective(2200px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,transformStyle:'preserve-3d',opacity}}>
    <div style={{position:'absolute',inset:0,borderRadius:72,background:'linear-gradient(110deg,#555b62 0%,#aab0b6 15%,#edf0f2 35%,#9ba1a8 70%,#626973 100%)',transform:'translateZ(-9px)',boxShadow:'20px 35px 75px #00000030, 0 9px 25px #00000028'}}/>
    {[{l:-3,t:134,h:28},{l:-3,t:200,h:51},{l:-3,t:269,h:51},{l:431,t:233,h:80},{l:431,t:539,h:45}].map((b,i)=><div key={i} style={{position:'absolute',left:b.l,top:b.t,width:6,height:b.h,borderRadius:3,background:'linear-gradient(90deg,#737a83,#e5e8ed,#777d85)',transform:'translateZ(-3px)'}}/>)}
    <div style={{position:'absolute',inset:0,borderRadius:72,padding:5,background:'linear-gradient(112deg,#aeb4bd 0%,#f0f2f5 19%,#626a76 47%,#dce0e4 75%,#aeb5be 100%)',boxShadow:'inset 0 0 0 1px #ffffffaa'}}>
      <div style={{position:'absolute',inset:5,borderRadius:67,background:'#090a0d',boxShadow:'inset 0 0 0 1px #111'}}/>
      <div style={{position:'absolute',left:16,top:16,width:402,height:874,borderRadius:56,overflow:'hidden',background:dark?'#0a0a0a':'#fff',isolation:'isolate'}}>
        <Img src={shot(name)} style={{position:'absolute',top:60,left:0,width:402,height:790,objectFit:'cover',objectPosition:'top'}}/>
        {other&&<Img src={shot(other)} style={{position:'absolute',top:60,left:0,width:402,height:790,objectFit:'cover',objectPosition:'top',opacity:clip(cross)}}/>}
        <StatusBar dark={dark}/>
        <div style={{position:'absolute',bottom:8,left:133,width:136,height:5,borderRadius:5,background:dark?'#f6f6f6':'#181818'}}/>
      </div>
      <div style={{position:'absolute',inset:0,borderRadius:72,border:'1px solid #ffffff66',pointerEvents:'none'}}/>
    </div>
  </div>;
}
function WebPanel({name,x,y,w=1380,h=760,scale=1,rx=0,ry=0,rz=0,zoom=1,panX=0,panY=0,opacity=1,other,cross=0}:{name:string;x:number;y:number;w?:number;h?:number;scale?:number;rx?:number;ry?:number;rz?:number;zoom?:number;panX?:number;panY?:number;opacity?:number;other?:string;cross?:number}) {
  const imageStyle:CSSProperties={position:'absolute',left:panX,top:panY,width:w*zoom,height:w*zoom*980/1440,maxWidth:'none',objectFit:'contain'};
  return <div style={{position:'absolute',left:x,top:y,width:w,height:h,transform:`translate(-50%,-50%) perspective(2400px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,borderRadius:22,background:'#fff',overflow:'hidden',boxShadow:'0 50px 115px #15213624,0 8px 24px #18233112',border:'1px solid #b9c2cc50',opacity}}>
    <Img src={shot(name)} style={imageStyle}/>
    {other&&<Img src={shot(other)} style={{...imageStyle,opacity:clip(cross)}}/>}
  </div>;
}
function FinePrint({portrait,dark=false,preview=false}:{portrait:boolean;dark?:boolean;preview?:boolean}) {
  return <div style={{position:'absolute',bottom:portrait?52:34,left:portrait?64:70,right:portrait?64:70,display:'flex',justifyContent:'space-between',fontSize:portrait?21:17,color:dark?'#9aa3b0':'#717984',lineHeight:1.4,fontWeight:450}}>
    <span style={{background:dark?'#07090df2':'#f4f5f5f2',padding:'5px 9px',marginLeft:-9,borderRadius:6}}>{preview?'AIVA · PRIVATE PREVIEW':'ACTUAL APP INTERFACE · DEMO DATA'}</span>
  </div>;
}

function Opening({f,p}:{f:number;p:boolean}) {
  const t=e(f,15,105);
  return <Stage>
    <Brand x={p?72:90} y={p?100:75} width={p?120:108}/>
    <Label x={p?228:224} y={p?117:87} size={p?25:21}>OFFICEADMIN + AIVA</Label>
    <Title f={f+18} lines={p?['Do great','work.']:['Do great work.']} x={p?74:108} y={p?315:360} size={p?146:143} width={p?980:1200}/>
    <div style={{position:'absolute',left:p?80:115,top:p?670:545,fontSize:p?42:37,fontWeight:450,letterSpacing:-1.4,color:P.muted,opacity:e(f,70,105),transform:`translateY(${(1-e(f,70,105))*16}px)`}}>Lose the runaround.</div>
    <Phone name="mobile-projects" x={p?605:1510} y={p?1370:620} scale={p?mix(1.1,1.36,t):mix(1.02,1.10,t)} ry={mix(-38,-12,t)} rx={mix(9,3,t)} rz={mix(13,-7,t)}/>
  </Stage>;
}
function RevealProduct({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,74);
  return <Stage>
    <Title f={f} lines={p?['Your business.','Together.']:['Your business. Together.']} x={p?540:960} y={p?152:105} center size={p?112:106} width={p?1020:1800}/>
    <Label x={p?540:960} y={p?425:251} center size={p?30:27}>PROJECTS. PEOPLE. MONEY.</Label>
    <WebPanel name="desktop-projects" x={p?400:895} y={p?1090:670} w={p?1350:1390} h={p?980:725} scale={p?.79:mix(.89,.97,t)} ry={mix(11,2,t)} rx={mix(6,0,t)} panY={p?0:-10}/>
    <Phone name="mobile-projects" x={p?778:1563} y={p?1220:661} scale={p?1.10:.76} ry={mix(-17,-5,t)} rz={p?5:6}/>
    <FinePrint portrait={p}/>
  </Stage>;
}
function Projects({f,p}:{f:number;p:boolean}) {
  const push=e(f,15,240);
  return <Stage dark>
    <Label x={p?76:97} y={p?97:85} dark size={p?24:20}>ONE CONNECTED WORKSPACE</Label>
    <Title f={f} lines={p?['Every job.','Every detail.']:['Every job.','Every detail.']} x={p?76:98} y={p?165:214} size={p?113:111} width={p?990:900} dark/>
    {p?<><Phone name="mobile-projects" x={575} y={1164} scale={1.37} ry={mix(-12,0,push)} rz={mix(-4,1,push)}/></>:<WebPanel name="desktop-projects" x={1560} y={598} w={1270} h={857} scale={mix(.91,1.03,push)} ry={mix(-9,-2,push)} rx={2} zoom={1.06} panX={-35} panY={-9}/>}
    <Label x={p?76:105} y={p?450:889} dark size={p?28:25} style={{letterSpacing:-.6,whiteSpace:'normal',maxWidth:p?900:545}}>Customers, documents, status.<br/>Right where the work is.</Label>
    <FinePrint portrait={p} dark/>
  </Stage>;
}
function Estimate({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,70); const shift=e(f,155,180);
  return <Stage>
    <Label x={p?74:96} y={p?93:77} size={p?23:19}>KEEP THE MOMENTUM</Label>
    <Title f={f} lines={p?['From first','estimate.']:['From first estimate.']} x={p?74:95} y={p?170:142} size={p?113:105} width={p?1000:1730}/>
    {p?<Phone name="mobile-estimate" other="mobile-invoice" cross={shift} x={560} y={1195} scale={1.42} ry={mix(-8,0,t)} rz={mix(4,0,t)}/>:<WebPanel name="desktop-estimate" other="desktop-invoice" cross={shift} x={1048} y={740} w={1540} h={840} scale={mix(.94,1.01,t)} ry={mix(6,0,t)} zoom={1} panX={0} panY={-30-e(f,65,195)*100}/>}
    <div style={{position:'absolute',left:p?78:95,top:p?413:273,color:P.blue,fontSize:p?48:42,fontWeight:550,letterSpacing:-1.5,opacity:e(f,145,175),transform:`translateY(${(1-e(f,145,175))*15}px)`}}>To final invoice.</div>
    <FinePrint portrait={p}/>
  </Stage>;
}
function Invoices({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,85);
  return <Stage>
    <Title f={f} lines={p?['Good work.','Clear numbers.']:['Good work.','Clear numbers.']} x={p?78:110} y={p?162:233} size={p?112:107} width={p?1000:850}/>
    <Label x={p?83:117} y={p?463:505} size={p?29:26} style={{letterSpacing:-.5,whiteSpace:'normal',maxWidth:p?900:530}}>Estimates. Invoices. Payments.<br/>One connected view.</Label>
    <Phone name="mobile-invoice" other="mobile-invoice-paid" cross={e(f,86,107)} x={p?559:1370} y={p?1200:614} scale={p?1.4:mix(1.36,1.06,t)} ry={mix(13,-6,t)} rz={mix(7,3,t)}/>
    <FinePrint portrait={p}/>
  </Stage>;
}
function Field({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,95);
  return <Stage dark>
    <Title f={f} lines={p?['Not tied','to a desk.']:['Not tied','to a desk.']} x={p?77:103} y={p?168:277} size={p?123:121} width={p?1010:930} dark/>
    <Label x={p?84:110} y={p?486:569} dark size={p?29:27} style={{letterSpacing:-.6}}>The whole picture. In your pocket.</Label>
    <Phone name="mobile-projects" x={p?575:1303} y={p?1193:605} scale={p?1.38:mix(1.30,.99,t)} ry={mix(-24,-10,t)} rz={mix(-9,-6,t)}/>
    {!p&&<Phone name="mobile-invoice" x={1676} y={703} scale={.66} ry={-12} rz={8} opacity={e(f,28,72)*.92}/>}
    <FinePrint portrait={p} dark/>
  </Stage>;
}
function Numbers({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,150);
  return <Stage>
    <Title f={f} lines={p?['Know where','you stand.']:['Know where you stand.']} x={p?74:960} y={p?150:90} center={!p} size={p?120:107} width={p?1000:1810}/>
    <Label x={p?82:960} y={p?460:234} center={!p} size={p?29:27} style={{letterSpacing:-.6}}>Costs. Cash flow. Clarity.</Label>
    <WebPanel name="desktop-dashboard-financial" x={p?557:963} y={p?1143:677} w={p?1440:1630} h={p?1070:782} scale={p?.95:mix(.93,1.01,t)} rx={mix(7,0,t)} zoom={p?1.35:1.07} panX={p?-170:-38} panY={p?0:-15}/>
    <FinePrint portrait={p}/>
  </Stage>;
}
function AivaReveal({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,92);const w=p?452:340;
  return <Stage dark>
    <AbsoluteFill style={{background:`radial-gradient(ellipse at 50% 59%,#1d3548${Math.round(48*t).toString(16).padStart(2,'0')} 0%,#07090d00 54%)`}}/>
    <div style={{position:'absolute',left:p?540:960,top:p?665:315,transform:`translate(-50%,-50%) scale(${mix(.8,1,t)})`,width:w,height:w,opacity:e(f,0,30)}}><Img src={staticFile('brand/aiva-dark-complete.png')} style={{width:'100%',height:'100%',objectFit:'contain'}}/></div>
    <Title f={f} delay={17} lines={['Meet AIVA.']} x={p?540:960} y={p?960:520} center size={p?146:135} width={p?1060:1700} dark/>
    <Label x={p?540:960} y={p?1172:700} center dark size={p?35:32} style={{letterSpacing:-.7}}>Your work. In context.</Label>
    <FinePrint portrait={p} dark preview/>
  </Stage>;
}
function Ask({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,75);
  return <Stage>
    <Brand kind="aiva" x={p?74:94} y={p?70:62} width={p?92:75}/>
    <Label x={p?184:192} y={p?98:84} size={p?24:21}>AIVA</Label>
    <Title f={f} lines={p?['Less searching.','More knowing.']:['Less searching.','More knowing.']} x={p?76:102} y={p?213:265} size={p?107:109} width={p?1000:920}/>
    <Label x={p?81:110} y={p?499:551} size={p?28:27} style={{letterSpacing:-.5,whiteSpace:'normal',maxWidth:p?890:480}}>Ask about the work.<br/>Get the context that matters.</Label>
    <Phone name="mobile-aiva-context" other="mobile-aiva" cross={e(f,185,205)} x={p?558:1395} y={p?1215:617} scale={p?1.38:mix(1.17,1.04,t)} ry={mix(-11,-3,t)} rz={mix(4,0,t)}/>
    <FinePrint portrait={p} preview/>
  </Stage>;
}
function Action({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,180);
  return <Stage dark>
    <Title f={f} lines={p?['From a decision.','To a next step.']:['From a decision.','To a next step.']} x={p?77:98} y={p?149:173} size={p?99:100} width={p?1010:930} dark/>
    {p?<Phone name="mobile-aiva" x={565} y={1181} scale={1.41} ry={mix(8,0,t)}/>:<WebPanel name="desktop-aiva" x={1420} y={656} w={870} h={748} scale={mix(.96,1.02,t)} ry={mix(-5,-1,t)} zoom={2.7} panX={-1479} panY={-e(f,10,150)*235}/>}
    <Label x={p?80:108} y={p?464:467} dark size={p?28:26} style={{letterSpacing:-.5,whiteSpace:'normal',maxWidth:p?925:570}}>Conversations become context.<br/>Follow-ups stay yours to review.</Label>
    <FinePrint portrait={p} dark preview/>
  </Stage>;
}
function Together({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,92);
  return <Stage>
    <Title f={f} lines={p?['Less switching.','Less chasing.']:['Less switching. Less chasing.']} x={p?540:960} y={p?164:99} center size={p?107:99} width={p?1050:1820}/>
    <WebPanel name="desktop-projects" x={p?490:900} y={p?1080:685} w={p?1260:1325} h={p?980:737} scale={p?.76:mix(.84,.95,t)} rx={mix(7,0,t)} ry={0}/>
    <Phone name="mobile-aiva" x={p?804:1508} y={p?1227:683} scale={p?1.02:.78} ry={-6} rz={6}/>
    <FinePrint portrait={p}/>
  </Stage>;
}
function Finale({f,p}:{f:number;p:boolean}) {
  const t=e(f,0,52);
  return <Stage dark>
    <div style={{position:'absolute',left:p?540:960,top:p?594:275,transform:`translate(-50%,-50%) scale(${mix(.94,1,t)})`,width:p?560:510,height:p?230:190,opacity:e(f,0,24)}}>
      <Brand dark x={0} y={p?57:46} width={p?237:219}/>
      <div style={{position:'absolute',left:p?282:259,top:p?86:65,fontSize:p?52:43,fontWeight:300,color:'#687180'}}>+</div>
      <Brand kind="aiva" dark x={p?355:323} y={0} width={p?225:200}/>
    </div>
    <Title f={f} delay={5} lines={p?['OfficeAdmin','+ AIVA']:['OfficeAdmin + AIVA']} x={p?540:960} y={p?802:444} center size={p?104:105} width={p?1040:1780} dark/>
    <div style={{position:'absolute',left:0,right:0,top:p?1128:613,textAlign:'center',fontSize:p?52:47,fontWeight:450,lineHeight:1.2,letterSpacing:-1.7,opacity:e(f,52,86)}}>Run the work.<br/><span style={{color:'#8b99aa'}}>Not the runaround.</span></div>
    <div style={{position:'absolute',left:0,right:0,top:p?1422:811,textAlign:'center',fontSize:p?37:30,fontWeight:550,color:'#70bfeb',letterSpacing:-.8,opacity:e(f,96,124)}}>officeadmin.io</div>
    <div style={{position:'absolute',left:p?88:145,right:p?88:145,bottom:p?103:63,textAlign:'center',fontSize:p?23:18,lineHeight:1.55,color:'#909ba9',opacity:e(f,35,60)}}>Actual app interface with fictional demo data.<br/>AIVA is a private preview. Feature availability varies by release.</div>
  </Stage>;
}
const SCENES=[Opening,RevealProduct,Projects,Estimate,Invoices,Field,Numbers,AivaReveal,Ask,Action,Together,Finale];
export function FilmV2({sound=true}:{sound?:boolean}) {
  useFont();const frame=useCurrentFrame();const {width}=useVideoConfig();const p=width<1400;
  let idx=V2_CUTS.findIndex((s,i)=>i<V2_CUTS.length-1&&frame>=s*30&&frame<V2_CUTS[i+1]*30);
  if(idx<0)idx=SCENES.length-1;const Scene=SCENES[idx];const local=frame-V2_CUTS[idx]*30;
  return <AbsoluteFill style={{fontFamily:'FilmInter,Inter,Arial,sans-serif',WebkitFontSmoothing:'antialiased',fontVariantNumeric:'tabular-nums'}}>
    <style>{`*{box-sizing:border-box}body{margin:0}img{display:block}svg{flex-shrink:0}`}</style>
    <Scene f={local} p={p}/>
    {sound&&<Audio src={staticFile('audio/v2/master.m4a')}/>}
  </AbsoluteFill>;
}
