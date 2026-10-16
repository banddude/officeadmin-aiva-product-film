import React from 'react';
import {AbsoluteFill,Composition,registerRoot} from 'remotion';
import {Fonts,Finish} from './kit';
import {FilmV5,V5_FPS,V5_FRAMES} from './film';
import {UiDom} from './dom';
import {PhotoRangeWall,PhotoSubpanel,PhotoEvRoute,PhotoReceipt} from './photos';
import {HookCouch,AivaArrives,EndCard} from './scenes-night';
import {WallSurprise} from './scenes-day';
import {TakeoffEstimate,LateCatch,Card} from './scenes-ui';

// Style frames for AIVA's quality gate. shot -> scene at a representative frame.
const SHOTS:Record<string,()=>React.ReactNode>={
 'hook':()=> <HookCouch f={86}/>,
 'aiva':()=> <AivaArrives f={72}/>,
 'end':()=> <EndCard f={96}/>,
 'wall':()=> <WallSurprise f={78} ui={<div style={{display:'flex',flexDirection:'column',gap:18,alignItems:'flex-start'}}>
  <div style={{fontFamily:'Inter',fontWeight:700,fontSize:20,letterSpacing:3,color:'#0284c7'}}>CHANGE ORDER · SIGNED ON JEN'S PHONE</div>
  <Card name="mobile-change-orders-approved" frag="co-row" w={376} h={104} scale={1.75} radius={18}/>
  <Card name="mobile-change-orders-approved" frag="contract-revised" w={378} h={70} scale={1.75} radius={18}/>
 </div>}/>,
 'takeoff':()=> <TakeoffEstimate f={96}/>,
 'catch':()=> <LateCatch f={80}/>,
 'photo-range-wall':()=> <PhotoRangeWall/>,'photo-subpanel':()=> <PhotoSubpanel/>,'photo-ev-route':()=> <PhotoEvRoute/>,'photo-receipt':()=> <PhotoReceipt/>,
};
function Still({shot}:{shot:string}){return <AbsoluteFill><Fonts/>{(SHOTS[shot]||SHOTS.hook)()}</AbsoluteFill>}

const Root=()=> <>
 <Composition id="V5Film" component={FilmV5} width={1920} height={1080} fps={V5_FPS} durationInFrames={V5_FRAMES} defaultProps={{vertical:false,sound:true}}/>
 <Composition id="V5Vertical" component={FilmV5} width={1080} height={1920} fps={V5_FPS} durationInFrames={V5_FRAMES} defaultProps={{vertical:true,sound:true}}/>
 <Composition id="V5Visuals" component={FilmV5} width={1920} height={1080} fps={V5_FPS} durationInFrames={V5_FRAMES} defaultProps={{vertical:false}}/>
 <Composition id="V5VerticalVisuals" component={FilmV5} width={1080} height={1920} fps={V5_FPS} durationInFrames={V5_FRAMES} defaultProps={{vertical:true}}/>
 <Composition id="V5Still" component={Still} width={1920} height={1080} fps={30} durationInFrames={1} defaultProps={{shot:'hook'}} calculateMetadata={({props})=>String(props.shot).startsWith('photo-')?{width:960,height:720}:{}}/>
</>;
registerRoot(Root);
