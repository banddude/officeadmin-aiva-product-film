import React,{type CSSProperties,type ReactNode} from 'react';
import {AbsoluteFill,Audio,Img,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {useFont} from './design';
import {AssemblyHero} from './v3-assembly-hero';
import {UiDom,pop,smooth,clamp,type DomMotion} from './v3-dom';
const P={dark:'#07090c',paper:'#f2f4f5',white:'#fff',ink:'#11161c',blue:'#0284c7',sky:'#3ba4e0',muted:'#88939e'};
export const CUTS=[0,6,16,29,37,47,58,62,78,84,90];
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const at=(f:number,a:number,b:number)=>smooth(f,a,b);
function Stage({children,dark=false,f=0}:{children:ReactNode;dark?:boolean;f?:number}){return <AbsoluteFill style={{background:dark?P.dark:P.paper,color:dark?'white':P.ink,perspective:2400,overflow:'hidden'}}><AbsoluteFill style={{background:dark?`radial-gradient(ellipse at ${48+5*Math.sin(f/60)}% 80%,#12324b66,transparent 64%)`:'radial-gradient(ellipse at 50% 30%,white,transparent 74%)'}}/>{children}</AbsoluteFill>}
function Mark({kind='oa',size=160,dark=false,style={}}:{kind?:'oa'|'aiva';size?:number;dark?:boolean;style?:CSSProperties}){return <Img src={staticFile(`brand/${kind==='oa'?`oa-${dark?'dark':'light'}-trim`:`aiva-${dark?'dark':'light'}-complete`}.png`)} style={{width:size,height:kind==='oa'?size*.5518:size,objectFit:'contain',...style}}/>}
function Text({children,f=999,start=0,x=0,y=0,size=100,color,style={}}:{children:ReactNode;f?:number;start?:number;x?:number;y?:number;size?:number;color?:string;style?:CSSProperties}){const v=pop(f,start,30);return <div style={{position:'absolute',left:x,top:y,fontSize:size,lineHeight:1.0,fontWeight:740,letterSpacing:-size*.058,color,opacity:at(f,start,start+9),transform:`translateY(${(1-v)*size*1.2}px)`,...style}}>{children}</div>}
function Meta({children,x=80,y=70,dark=false}:{children:ReactNode;x?:number;y?:number;dark?:boolean}){return <div style={{position:'absolute',left:x,top:y,fontSize:17,fontWeight:550,letterSpacing:2.1,color:dark?'#9ba8b4':'#687584',textTransform:'uppercase'}}>{children}</div>}
function Plane({children,x,y,w,h,s=1,rx=0,ry=0,rz=0,z=0,opacity=1,card=false,style={}}:{children:ReactNode;x:number;y:number;w:number;h:number;s?:number;rx?:number;ry?:number;rz?:number;z?:number;opacity?:number;card?:boolean;style?:CSSProperties}){return <div style={{position:'absolute',left:x,top:y,width:w,height:h,transform:`translate(-50%,-50%) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`,transformStyle:'preserve-3d',opacity,background:card?'#fff':undefined,borderRadius:card?18:undefined,boxShadow:card?'0 28px 75px #00000028,0 1px 0 #ffffffcc inset':undefined,...style}}>{children}</div>}
function Native({name,fragment,f=9999,motion='none',w=1440,h=980,scroll=0,typing='',words=1}:{name:string;fragment?:string;f?:number;motion?:DomMotion;w?:number;h?:number;scroll?:number;typing?:string;words?:number}){return <UiDom key={name+'/'+(fragment||'full')} name={name} fragment={fragment} frame={f} motion={motion} scrollY={scroll} typing={typing} revealWords={words} style={{width:w,height:h}}/>}
function Cursor({x,y,press=0,opacity=1}:{x:number;y:number;press?:number;opacity?:number}){return <svg width={46} height={56} viewBox="0 0 46 56" style={{position:'absolute',left:x,top:y,opacity,transform:`scale(${1-.15*press})`,filter:'drop-shadow(0 3px 2px #0004)'}}><path d="M5 3V43L16 32L25 51L33 47L24 29H41Z" fill="white" stroke="#131b24" strokeWidth="2.6" strokeLinejoin="round"/></svg>}
function GrainLines({f,w,h}:{f:number;w:number;h:number}){return <svg width={w} height={h} style={{position:'absolute',inset:0,opacity:.45}}>{[0,1,2,3,4,5].map((i)=><path key={i} d={`M -100 ${180+i*142} C ${w*.28} ${300+i*74}, ${w*.61} ${100+i*163}, ${w+200} ${240+i*102}`} stroke={i===2?P.sky:'#52687c'} strokeWidth={i===2?2:1} fill="none" strokeDasharray={`${90+i*40} ${340+i*20}`} strokeDashoffset={-f*(i===2?9:2)}/>)}</svg>}
function Intro({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080,t=at(f,98,168);const scatter=[{name:'projects',id:'section-2',w:1136,h:124,x:p?700:1460,y:p?440:230,s:p?.63:.66,r:-13},{name:'estimate',id:'row-1',w:1134,h:45,x:p?435:460,y:p?1330:850,s:p?.72:.91,r:8},{name:'invoice',id:'payment',w:1136,h:135,x:p?645:1470,y:p?1550:816,s:p?.48:.53,r:-6},{name:'dashboard',id:'metric-0',w:214,h:124,x:p?197:290,y:p?355:260,s:p?1.65:1.4,r:14}];
 return <Stage dark f={f}><GrainLines f={f} w={w} h={h}/>{scatter.map((q,i)=><Plane key={i} x={mix(q.x,w/2,t)+Math.sin((f+i*13)/41)*12*(1-t)} y={mix(q.y,h/2,t)} w={q.w} h={q.h} s={q.s*(1-t*.75)} rz={q.r*(1-t)} rx={-8*(1-t)} ry={(i%2?12:-12)*(1-t)} z={mix(160+i*40,-350,t)} opacity={at(f,i*8,i*8+16)*(1-at(f,122,154))} card><Native name={q.name} fragment={q.id} w={q.w} h={q.h}/></Plane>)}
 <div style={{position:'absolute',inset:0,transform:`scale(${mix(1,1.2,at(f,122,177))})`,opacity:1-at(f,125,164)}}>
 <Text x={p?86:150} y={p?650:364} size={p?146:170} f={f} start={2}>{p?<>YOUR<br/>BUSINESS.</>:'YOUR BUSINESS.'}</Text>
 <Text x={p?86:150} y={p?1020:535} size={p?137:170} f={f} start={22} color={P.sky}>IN MOTION.</Text></div>
 <div style={{position:'absolute',left:w/2,top:h/2,transform:`translate(-50%,-50%) scale(${mix(.6,1,pop(f,127,35))})`,opacity:at(f,127,140)*(1-at(f,172,180))}}><Mark dark size={p?360:390}/></div>
 <div style={{position:'absolute',inset:0,background:P.dark,clipPath:`inset(0 ${100*(1-at(f,166,180))}% 0 0)`}}/>
 </Stage>
}
function Assembly({f,p}:{f:number;p:boolean}){
 if(p)return <MobileAssembly f={f}/>;
 const w=p?1080:1920,h=p?1920:1080;const settle=at(f,25,145),zoom=at(f,196,277);const scale=p?mix(.59,.85,zoom):mix(.85,1.36,zoom);const cx=p?540:960,cy=p?1090:605;const outer={x:cx+(p?0:-200*zoom),y:cy+(p?-150:40)*zoom,w:1440,h:980,s:scale,rx:mix(24,0,settle),ry:mix(-20,0,settle),rz:mix(-7,0,settle)};
 const parts=[{id:'sidebar',x:0,y:0,w:255,h:980,d:0,dx:-380,dy:70,z:260},{id:'topbar',x:256,y:0,w:1184,h:57,d:12,dx:80,dy:-270,z:180},{id:'section-0',x:280,y:165,w:1136,h:124.2,d:28,dx:200,dy:-80,z:510},{id:'section-1',x:280,y:310.2,w:1136,h:124.2,d:44,dx:260,dy:0,z:570},{id:'section-2',x:280,y:455.4,w:1136,h:124.2,d:60,dx:320,dy:90,z:660}];
 return <Stage f={f}><Text x={p?86:110} y={p?180:48} size={p?134:84} f={f} start={3} style={{zIndex:3,opacity:1-at(f,186,220)}}>Everything. In its place.</Text>
 <Plane {...outer} style={{transformStyle:'preserve-3d'}}>
 <div style={{position:'absolute',inset:0,borderRadius:20,background:'#fff',border:'1px solid #ccd4dd',boxShadow:'0 65px 100px #142a4029',opacity:at(f,70,120),overflow:'hidden'}}><div style={{opacity:at(f,118,153)}}><Native name="projects" motion="build" f={f+140}/></div></div>
 {parts.map(q=>{const a=pop(f,q.d,67),o=at(f,q.d,q.d+12)*(1-at(f,155,166));return <div key={q.id} style={{position:'absolute',left:q.x+q.dx*(1-a),top:q.y+q.dy*(1-a),width:q.w,height:q.h,transform:`translateZ(${q.z*(1-a)}px) rotateX(${(1-a)*-12}deg)`,opacity:o,background:'#fff',boxShadow:`0 ${Math.abs(1-a)*35}px ${Math.abs(1-a)*60}px #0c263b33`,borderRadius:q.id.startsWith('section')?9:0}}><Native name="projects" fragment={q.id} w={q.w} h={q.h}/></div>})}
 <div style={{position:'absolute',left:279,top:522.4,width:1138,height:59,border:`2px solid ${P.blue}`,borderRadius:7,boxShadow:`0 0 0 ${5*at(f,185,210)}px #0284c718`,opacity:at(f,184,200)}}/>
 <Cursor x={mix(1200,630,at(f,162,193))} y={mix(760,550,at(f,162,193))} press={Math.sin(Math.PI*clamp((f-195)/12))} opacity={at(f,160,168)*(1-at(f,210,223))}/>
 </Plane>
 <div style={{position:'absolute',left:p?92:120,bottom:p?210:60,fontSize:p?28:22,color:'#607180',opacity:at(f,138,157)}}>Customers. Projects. Documents. One workspace.</div>
 <div style={{position:'absolute',inset:0,background:P.dark,transform:`translateX(${100*(1-at(f,281,300))}%)`}}/>
 </Stage>
}
function MobileAssembly({f}:{f:number}){
 const a=at(f,24,131),zoom=at(f,210,277),sc=mix(2.02,2.34,zoom);
 const parts=[{id:'topbar',x:0,y:0,w:402,h:57,d:0,dx:-80,z:160},{id:'section-0',x:12,y:157,w:378,h:94,d:18,dx:180,z:210},{id:'section-1',x:12,y:271,w:378,h:120,d:36,dx:-180,z:250},{id:'section-2',x:12,y:411,w:378,h:120,d:54,dx:210,z:290}];
 return <Stage f={f}><Text x={84} y={90} size={80} f={f} start={2} style={{opacity:1-at(f,185,220)}}>Everything. In its place.</Text>
 <Plane x={540-25*zoom} y={1100-40*zoom} w={402} h={790} s={sc} rx={mix(18,0,a)} ry={mix(-17,0,a)} rz={mix(-7,0,a)}>
 <div style={{position:'absolute',inset:0,background:'white',borderRadius:16,boxShadow:'0 25px 65px #19354b35',opacity:at(f,64,98),overflow:'hidden'}}><div style={{opacity:at(f,114,145)}}><Native name="mobile-projects" w={402} h={790}/></div></div>
 {parts.map(q=>{const t=pop(f,q.d,61);return <div key={q.id} style={{position:'absolute',left:q.x+q.dx*(1-t),top:q.y,width:q.w,height:q.h,transform:`translateZ(${q.z*(1-t)}px)`,opacity:at(f,q.d,q.d+12)*(1-at(f,144,162)),background:'white',borderRadius:8,boxShadow:`0 ${30*Math.abs(1-t)}px ${50*Math.abs(1-t)}px #0004`}}><Native name="mobile-projects" fragment={q.id} w={q.w} h={q.h}/></div>})}
 <div style={{position:'absolute',left:11,top:440,width:380,height:94,border:`2px solid ${P.blue}`,borderRadius:9,opacity:at(f,182,198)}}/>
 </Plane><div style={{position:'absolute',inset:0,background:P.dark,transform:`translateX(${100*(1-at(f,281,300))}%)`}}/></Stage>
}
function Estimate({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080;const assemble=at(f,25,80),pull=at(f,120,185),close=at(f,274,330);const px=p?540:1020,py=p?1070:643;
 return <Stage dark f={f}>
 <Text x={p?80:100} y={p?155:92} size={p?102:92} f={f} start={0} style={{opacity:1-at(f,150,186)}}>{p?'Build it.':'Build the scope.'}</Text>
 <Text x={p?80:100} y={p?155:92} size={p?102:92} f={f} start={164} style={{opacity:at(f,164,180)*(1-at(f,320,350))}}>{p?'Keep it moving.':'Keep it moving.'}</Text>
 <Plane x={px} y={py+mix(0,-70,close)} w={p?402:1136} h={p?710:620} s={p?mix(1.92,2.03,assemble):mix(1.12,1.16,assemble)} rx={mix(14,0,assemble)} ry={mix(-9,0,assemble)} rz={mix(5,0,assemble)} card style={{overflow:'hidden',opacity:at(f,20,45)*(1-at(f,352,382))}}>
 {p?<Native name="mobile-estimate" f={f-30} motion="estimate" w={402} h={790} scroll={at(f,100,255)*330}/>:<div style={{position:'absolute',left:-280,top:-216}}><Native name="estimate" f={f-30} motion="estimate"/></div>}
 </Plane>
 {!p&&[0,1,2,3].map(i=>{const a=pop(f,7+i*13,49);return <Plane key={i} x={mix(w+560,px,a)} y={mix(py+160+i*82,py+116+i*55,a)} w={1134} h={45} s={p?.8:1.26} ry={mix(-28,0,a)} rz={mix(-6,0,a)} z={180*(1-a)} opacity={at(f,7+i*13,15+i*13)*(1-at(f,69+i*6,86+i*6))} card><Native name="estimate" fragment={`row-${i}`} w={1134} h={45}/></Plane>})}
 <Plane x={mix(p?770:1640,w/2,close)} y={mix(p?1430:874,p?1190:583,close)} w={320} h={59} s={mix(p?.78:1.03,p?2.5:3.8,close)} opacity={at(f,278,298)} card style={{padding:0,boxShadow:'0 20px 90px #0005',background:'#fff'}}><Native name="estimate" fragment="total" w={320} h={59}/></Plane>
 <div style={{position:'absolute',left:p?80:108,bottom:p?77:32,color:'#8fabbf',fontSize:p?25:19,opacity:at(f,180,200)*(1-at(f,330,355))}}>Fictional six-station project · $18,450</div>
 <div style={{position:'absolute',inset:0,background:P.paper,clipPath:`inset(${100*(1-at(f,373,390))}% 0 0 0)`}}/>
 </Stage>
}
function Payment({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080;const count=at(f,10,63),hit=at(f,75,135),out=at(f,187,239);
 return <Stage f={f}>
 <Text x={p?76:100} y={p?140:89} size={p?115:120} f={f} start={3} color={P.blue}>Accepted.</Text>
 <Text x={p?76:100} y={p?290:219} size={p?115:120} f={f} start={24}>Invoiced.</Text>
 <Text x={p?76:100} y={p?440:349} size={p?115:120} f={f} start={80}>Paid.</Text>
 <Plane x={p?540:1240} y={p?1220:653} w={p?402:1136} h={p?720:590} s={p?1.7:.97} ry={mix(-16,0,count)} rx={mix(12,0,count)} rz={mix(5,0,count)} card style={{overflow:'hidden'}}>
 {p?<Native name="mobile-invoice" motion="paid" f={f} w={402} h={790} scroll={mix(450,570,at(f,100,174))}/>:<div style={{position:'absolute',left:-280,top:-420-at(f,109,176)*90}}><Native name="invoice" motion="paid" f={f}/></div>}</Plane>
 <div style={{position:'absolute',left:p?100:760,top:p?1866:972,fontSize:p?26:20,fontWeight:600,color:'#577184',opacity:at(f,89,104)}}>LATER · PAYMENT RECEIVED</div>
 <div style={{position:'absolute',left:w/2,top:p?1844:957,width:mix(40,w-160,hit),height:3,background:P.blue,transform:'translateX(-50%)'}}/>
 <div style={{position:'absolute',inset:0,background:P.dark,clipPath:`inset(0 0 0 ${100*(1-out)}%)`}}/>
 </Stage>
}
function PhoneChrome({children,build=1}:{children:ReactNode;build?:number}){return <div style={{width:434,height:906,position:'relative',transformStyle:'preserve-3d'}}>
 <div style={{position:'absolute',inset:0,borderRadius:72,background:'linear-gradient(118deg,#555e68,#e8edf0 24%,#75818c 61%,#e2e8ed)',transform:`translateZ(${-12-100*(1-build)}px)`,opacity:build,boxShadow:'24px 38px 85px #0008'}}/>
 <div style={{position:'absolute',inset:5,borderRadius:67,background:'#06080b',opacity:build}}/>
 <div style={{position:'absolute',left:16,top:16,width:402,height:874,borderRadius:56,overflow:'hidden',background:'#fff',transform:`translateZ(${70*(1-build)}px)`}}>
 <div style={{position:'absolute',top:60,left:0,width:402,height:790,overflow:'hidden'}}>{children}</div>
 <div style={{position:'absolute',top:0,left:0,width:402,height:60,background:'#fff',opacity:build}}><span style={{position:'absolute',top:23,left:28,font:'700 15px Arial'}}>9:41</span><div style={{position:'absolute',left:140,top:10,width:122,height:35,background:'#020304',borderRadius:23}}/><svg width={55} height={18} viewBox="0 0 55 18" style={{position:'absolute',right:18,top:22}}><path d="M0 14v-3M5 14V8M10 14V5M15 14V2" stroke="#111" strokeWidth="3"/><path d="M23 6q7-6 14 0M26 9q4-4 8 0M29 12h2" stroke="#111" strokeWidth="2" fill="none"/><rect x="41" y="4" width="12" height="10" rx="2" fill="#111"/></svg></div>
 <div style={{position:'absolute',bottom:8,left:133,width:136,height:5,borderRadius:5,background:'#131619',opacity:build}}/>
 </div>
 <div style={{position:'absolute',inset:0,borderRadius:72,border:'1px solid #fff9',opacity:build}}/>
 {[[0,130,28],[0,198,51],[0,270,51],[434,233,80]].map(([l,t,h],i)=><div key={i} style={{position:'absolute',left:l-3,top:t,width:5,height:h,borderRadius:3,background:'#aab7c2',opacity:build}}/>)}</div>}
function Mobile({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080,a=at(f,5,64),change=at(f,116,140),pan=at(f,150,230);
 return <Stage dark f={f}><GrainLines f={f} w={w} h={h}/>
 <Text x={p?78:110} y={p?154:191} size={p?128:132} f={f} start={3}>The whole<br/>business.</Text>
 <Text x={p?78:110} y={p?1650:703} size={p?105:116} f={f} start={94} color={P.sky}>In your hands.</Text>
 <Plane x={p?555:1295} y={p?1040:553} w={434} h={906} s={p?1.12:.95} rx={mix(27,3,a)} ry={mix(-48,-11,a)+14*at(f,220,287)} rz={mix(14,-5,a)} z={180*(1-a)}>
 <PhoneChrome build={a}><div style={{opacity:1-change}}><Native name="mobile-projects" f={f+20} motion="build" w={402} h={790}/></div><div style={{position:'absolute',inset:0,opacity:change}}><Native name="mobile-invoice" w={402} h={790} scroll={pan*490} motion="paid" f={f-140}/></div></PhoneChrome>
 </Plane>
 <div style={{position:'absolute',inset:0,background:P.paper,transform:`translateY(${100*(1-at(f,283,300))}%)`}}/>
 </Stage>
}
function Numbers({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080,a=at(f,20,98),chart=at(f,114,160),move=at(f,197,270);
 const metricW=214.4,metricH=124.4;
 return <Stage f={f}>
 <Text x={p?76:95} y={p?152:87} size={p?113:111} f={f} start={0} style={{opacity:1-at(f,187,232)}}>The numbers.<br/>Not the guesswork.</Text>
 <div style={{position:'absolute',inset:0,transform:`translateY(${-move*(p?180:160)}px)`}}>
 {[0,1,2,3,4].map(i=>{const sc=p?1.84:1.48,xx=p? (i===4?540:i%2?782:295):285+i*336,yy=p?660+Math.floor(i/2)*260:466;const arrival=pop(f,12+i*13,53);return <Plane key={i} x={mix(w/2,xx,arrival)} y={mix(h*.68+200,yy,arrival)} w={metricW} h={metricH} s={sc} rz={mix((i-2)*-13,0,arrival)} ry={mix((i-2)*-16,0,arrival)} z={280*(1-arrival)} opacity={at(f,12+i*13,22+i*13)} card><Native name="dashboard" fragment={`metric-${i}`} f={f-12-i*9} motion="numbers" w={metricW} h={metricH}/></Plane>})}
 {!p&&<Plane x={545} y={789} w={556} h={334.3} s={1.03} rx={mix(30,0,chart)} opacity={chart} card><Native name="dashboard" fragment="chart-4" f={f-70} motion="numbers" w={556} h={334.3}/></Plane>}
 <Plane x={p?540:1280} y={p?1580:790} w={p?1136:556} h={p?367:334.3} s={p?.82:1.03} rx={mix(30,0,chart)} opacity={chart} card><Native name="dashboard" fragment={p?'chart-6':'chart-5'} f={f-40} motion="numbers" w={p?1136:556} h={p?367:334.3}/></Plane>
 </div>
 {!p&&<Plane x={960} y={mix(1450,720,move)} w={1136} h={367} s={1.22} card opacity={move}><Native name="dashboard" fragment="chart-6" f={f-160} motion="numbers" w={1136} h={367}/></Plane>}
 <div style={{position:'absolute',left:p?85:97,bottom:p?80:40,fontSize:p?23:17,color:'#687a89'}}>Illustrative company reporting</div>
 <div style={{position:'absolute',inset:0,background:P.dark,clipPath:`circle(${at(f,302,330)*160}% at 50% 55%)`}}/>
 </Stage>
}
function AivaReveal({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080,a=pop(f,9,48);return <Stage dark f={f}>
 <svg width={w} height={h} style={{position:'absolute',inset:0}}>{[0,1,2,3,4,5,6,7].map(i=>{const r=at(f,i*3,90),ang=i*Math.PI/4;return <path key={i} d={`M ${w/2+Math.cos(ang)*Math.max(w,h)} ${h*.42+Math.sin(ang)*Math.max(w,h)} Q ${w/2+Math.cos(ang+.2)*240} ${h*.42+Math.sin(ang+.2)*240} ${w/2} ${h*.42}`} fill="none" stroke={i%3? '#42657c':P.sky} opacity={(1-at(f,75,112))*.6} strokeWidth={1.8} pathLength={1} strokeDasharray={1} strokeDashoffset={1-r}/>})}</svg>
 <div style={{position:'absolute',left:w/2,top:h*.39,transform:`translate(-50%,-50%) scale(${a}) rotateY(${(1-a)*45}deg)`,filter:`drop-shadow(0 0 ${35*at(f,20,80)}px #208cb438)`}}><Mark kind="aiva" dark size={p?280:245}/></div>
 <Text x={0} y={h*.58} f={f} start={35} size={p?133:125} style={{textAlign:'center',width:'100%'}}>AIVA.</Text>
 <div style={{position:'absolute',top:h*.76,width:'100%',textAlign:'center',fontSize:p?35:29,color:'#adbac6',opacity:at(f,54,75)}}>The context comes with you.</div>
 <Meta x={p?80:90} y={h-65} dark>AIVA · PRIVATE PREVIEW</Meta>
 </Stage>
}
function Chat({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080;const send=at(f,53,80),answer=at(f,95,118),step=at(f,221,258),draft=at(f,285,311),leave=at(f,434,480);
 const scale=p?2.5:2.22;const first='What is left to close out Cedar Court?';const second='Draft the customer update for me.';const typing=f<54?first.slice(0,Math.floor(first.length*clamp((f-9)/43))):f>=190&&f<237?second.slice(0,Math.floor(second.length*clamp((f-190)/42))):'';
 const composerY=p?1630:908;
 const questionX=p?590:1255,questionY=p?461:242,responseX=p?451:803,responseY=p?794:492;
 return <Stage dark f={f}>
 <div style={{position:'absolute',left:p?78:94,top:p?111:71,display:'flex',alignItems:'center',gap:19}}><Mark kind="aiva" dark size={p?65:53}/><span style={{fontSize:p?25:21,letterSpacing:2.2,color:'#a8b8c5'}}>YOUR WORK. IN CONTEXT.</span></div>
 <div style={{position:'absolute',inset:0,opacity:(1-leave)}}>
 <Plane x={w/2} y={composerY} w={375} h={42} s={p?2.45:2.65} opacity={1-at(f,330,365)} card style={{borderRadius:25}}><Native name="aiva" fragment="composer-bar" w={375} h={42} typing={typing}/></Plane>
 <Plane x={mix(w/2,questionX,send)} y={mix(composerY,questionY-step*(p?100:200),send)} w={291.9} h={36.3} s={scale} opacity={at(f,54,61)*(1-step)} style={{filter:'none'}}><Native name="aiva" fragment="message-0" w={291.9} h={36.3}/></Plane>
 <Plane x={responseX} y={responseY-step*(p?160:310)+(1-answer)*120} w={292.5} h={141.5} s={scale} opacity={answer*(1-step)} style={{filter:'none'}}><Native name="aiva" fragment="message-1" w={292.5} h={141.5} words={at(f,107,163)}/></Plane>
 <Plane x={p?600:1245} y={mix(composerY,p?866:427,step)} w={267.1} h={36.3} s={scale} opacity={at(f,237,247)}><Native name="aiva" fragment="message-2" w={267.1} h={36.3}/></Plane>
 <Plane x={p?470:805} y={(p?1205:696)+(1-draft)*85} w={292.5} h={161.75} s={scale} opacity={draft} style={{filter:'none'}}><Native name="aiva" fragment="message-3" w={292.5} h={161.75} words={at(f,297,363)}/></Plane>
 <div style={{position:'absolute',left:p?98:218,top:p?1778:1002,fontSize:p?30:24,color:P.sky,opacity:at(f,367,389)}}>Prepared. Not sent. You stay in control.</div>
 </div>
 <Meta x={p?80:90} y={h-56} dark>AIVA · PRIVATE PREVIEW · DEMO CONVERSATION</Meta>
 <div style={{position:'absolute',inset:0,background:P.paper,transform:`translateX(${100*(1-leave)}%)`}}/>
 </Stage>
}
function Montage({f,p}:{f:number;p:boolean}){
 const w=p?1080:1920,h=p?1920:1080;const a=at(f,6,80),focus=Math.floor(f/45)%4;
 return <Stage f={f}><Text x={p?77:95} y={p?164:94} size={p?121:115} f={f} start={2}>Less switching.</Text><Text x={p?77:95} y={p?310:223} size={p?121:115} f={f} start={18} color={P.blue}>More momentum.</Text>
 <Plane x={p?550:895} y={p?1010:701} w={1440} h={980} s={p?.60:.77} rx={mix(18,4,a)} ry={mix(-17,-5,a)} rz={mix(-6,-2,a)} card style={{overflow:'hidden'}}><Native name={focus===2?'dashboard':focus===1?'estimate':'projects'} motion={focus===2?'numbers':focus===1?'estimate':'build'} f={focus===1?f+135:f+95} scroll={focus===2?520:0}/></Plane>
 <Plane x={p?803:1545} y={p?1310:697} w={434} h={906} s={p?.72:.60} ry={-11} rz={8} opacity={at(f,33,54)}><PhoneChrome><Native name="mobile-aiva" motion="chat" f={f+330} w={402} h={790}/></PhoneChrome></Plane>
 <div style={{position:'absolute',inset:0,background:P.dark,clipPath:`inset(0 ${100*(1-at(f,160,180))}% 0 0)`}}/>
 </Stage>
}
function End({f,p}:{f:number;p:boolean}){const w=p?1080:1920,h=p?1920:1080;return <Stage dark f={f}><div style={{position:'absolute',top:p?470:213,left:w/2,transform:'translateX(-50%)',display:'flex',alignItems:'center',gap:45,opacity:at(f,7,23)}}><Mark size={p?247:245} dark/><span style={{fontSize:32,color:'#6c859a'}}>+</span><Mark kind="aiva" size={p?139:137} dark/></div><Text x={0} y={p?806:457} f={f} start={12} size={p?83:88} style={{width:'100%',textAlign:'center'}}>OfficeAdmin + AIVA</Text><Text x={0} y={p?1060:608} f={f} start={35} size={p?83:76} style={{width:'100%',textAlign:'center'}}>Run the work.</Text><Text x={0} y={p?1160:693} f={f} start={50} size={p?67:57} color="#93a5b5" style={{width:'100%',textAlign:'center'}}>Not the runaround.</Text><div style={{position:'absolute',top:p?1400:851,width:'100%',textAlign:'center',fontSize:p?32:25,color:P.sky,opacity:at(f,68,90)}}>officeadmin.io</div><div style={{position:'absolute',bottom:p?125:62,left:p?90:150,right:p?90:150,textAlign:'center',fontSize:p?20:15,lineHeight:1.6,color:'#7b8b98',opacity:at(f,80,100)}}>Actual interface elements. Fictional demo data. Editorial animation.<br/>AIVA is a private preview. Feature availability varies by release.</div></Stage>}
const IntegratedAssembly=({f,p}:{f:number;p:boolean})=><AssemblyHero f={f} p={p} exitToNext={true}/>;
const SCENES=[Intro,IntegratedAssembly,Estimate,Payment,Mobile,Numbers,AivaReveal,Chat,Montage,End];
export function FilmV3({sound=true}:{sound?:boolean}){useFont();const {width}=useVideoConfig(),p=width<1500;return <AbsoluteFill style={{background:P.dark,fontFamily:'FilmInter,Inter,Arial,sans-serif',WebkitFontSmoothing:'antialiased'}}><style>{`*{box-sizing:border-box}body{margin:0}`}</style>{SCENES.map((Comp,i)=><Sequence key={i} from={CUTS[i]*30} durationInFrames={(CUTS[i+1]-CUTS[i])*30}><Timed Comp={Comp} p={p}/></Sequence>)}{sound&&<Audio src={staticFile('audio/v3/master.m4a')}/>}</AbsoluteFill>}
function Timed({Comp,p}:{Comp:React.ComponentType<{f:number;p:boolean}>;p:boolean}){return <Comp f={useCurrentFrame()} p={p}/>}
