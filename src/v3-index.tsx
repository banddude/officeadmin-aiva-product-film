import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {FilmV3} from './v3-film';
const Root=()=> <>{[false,true].map(p=><React.Fragment key={String(p)}><Composition id={p?'V3Vertical':'V3Film'} component={FilmV3} width={p?1080:1920} height={p?1920:1080} fps={30} durationInFrames={2700} defaultProps={{sound:true}}/><Composition id={p?'V3VerticalVisuals':'V3Visuals'} component={FilmV3} width={p?1080:1920} height={p?1920:1080} fps={30} durationInFrames={2700} defaultProps={{sound:false}}/></React.Fragment>)}</>;
registerRoot(Root);
