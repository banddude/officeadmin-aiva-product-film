import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FilmV4, V4_FPS, V4_FRAMES} from './v4-film';

const Root = () => (
  <>
    <Composition
      id="V4Film"
      component={FilmV4}
      width={1920}
      height={1080}
      fps={V4_FPS}
      durationInFrames={V4_FRAMES}
      defaultProps={{sound: true}}
    />
    <Composition
      id="V4Vertical"
      component={FilmV4}
      width={1080}
      height={1920}
      fps={V4_FPS}
      durationInFrames={V4_FRAMES}
      defaultProps={{sound: true}}
    />
    <Composition
      id="V4Visuals"
      component={FilmV4}
      width={1920}
      height={1080}
      fps={V4_FPS}
      durationInFrames={V4_FRAMES}
      defaultProps={{sound: false}}
    />
    <Composition
      id="V4VerticalVisuals"
      component={FilmV4}
      width={1080}
      height={1920}
      fps={V4_FPS}
      durationInFrames={V4_FRAMES}
      defaultProps={{sound: false}}
    />
  </>
);

registerRoot(Root);
