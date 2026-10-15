import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FilmV2, V2_FPS, V2_FRAMES} from './v2-film';
const Root=()=> <>
  <Composition id="OfficeAdminFilmV2" component={FilmV2} width={1920} height={1080} fps={V2_FPS} durationInFrames={V2_FRAMES} defaultProps={{sound:true}}/>
  <Composition id="OfficeAdminReelV2" component={FilmV2} width={1080} height={1920} fps={V2_FPS} durationInFrames={V2_FRAMES} defaultProps={{sound:true}}/>
  <Composition id="V2LandscapeVisuals" component={FilmV2} width={1920} height={1080} fps={V2_FPS} durationInFrames={V2_FRAMES} defaultProps={{sound:false}}/>
  <Composition id="V2PortraitVisuals" component={FilmV2} width={1080} height={1920} fps={V2_FPS} durationInFrames={V2_FRAMES} defaultProps={{sound:false}}/>
</>;
registerRoot(Root);
