import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {AssemblyHero} from './v3-assembly-hero';

const Root = () => <>
  <Composition id="AssemblyProofLandscape" component={AssemblyHero} width={1920} height={1080} fps={60} durationInFrames={600} defaultProps={{exitToNext:false}}/>
  <Composition id="AssemblyProofPortrait" component={AssemblyHero} width={1080} height={1920} fps={60} durationInFrames={600} defaultProps={{exitToNext:false}}/>
  <Composition id="AssemblyIntegration30" component={AssemblyHero} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={{exitToNext:true}}/>
</>;
registerRoot(Root);
