import React, {useEffect, useLayoutEffect, useRef, useState, type CSSProperties} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Flagship scene, film seconds 6-16. Canonical animation time is 30 fps.
 * All product pixels are source-authentic DOM, not redrawn product screens.
 * This is an editorial assembly/selection, not a recording of autonomous work.
 * No changes to the parent's film, snapshot exporter, assets, or audio.
 */
type Rect = {x: number; y: number; width: number; height: number};
type Target = {id: string; kind: string; rect: Rect; text: string};
type Snapshot = {width: number; height: number; html: string; css: string;
  targets: Target[]; fragments: Record<string, {html: string; width: number; height: number}>; sourceMethod: string};
type Loaded = {snapshot: Snapshot; css: Map<string, string>};
const SNAPSHOT = new Map<string, Promise<Loaded>>();
let fontPromise: Promise<FontFace> | undefined;
const C = {paper: '#f2f4f5', ink: '#11161c', blue: '#0284c7', slate: '#64717e', dark: '#07090c'};
export const ASSEMBLY_BEATS = [
  {frame: 0, seconds: 6, event: 'Cut into separated, source-authentic interface layers'},
  {frame: 15, seconds: 6.5, event: 'Navigation and header lock onto the workspace'},
  {frame: 45, seconds: 7.5, event: 'Project groups arrive on independent depth planes'},
  {frame: 75, seconds: 8.5, event: 'Rows seat inside their corresponding groups'},
  {frame: 114, seconds: 9.8, event: 'All layers settle into the real application layout'},
  {frame: 145, seconds: 10.833333, event: 'Deliberate camera push to the active project'},
  {frame: 189, seconds: 12.3, event: 'Cursor selects the same fictional Cedar Court project'},
  {frame: 211, seconds: 13.033333, event: 'Selected real project row lifts out of its exact screen position'},
  {frame: 254, seconds: 14.466667, event: 'Readable project detail hold'},
  {frame: 286, seconds: 15.533333, event: 'Optional match-cut exit into next scene'},
];
export const bounded = (x: number) => Math.max(0, Math.min(1, x));
export const blend = (a: number, b: number, t: number) => a + (b - a) * t;
export const ramp = (f: number, a: number, b: number) => bounded((f - a) / (b - a));
// Quintic camera movement has zero endpoint velocity and acceleration.
export const travel = (f: number, a: number, b: number) => {
  const t = ramp(f, a, b); return t * t * t * (t * (t * 6 - 15) + 10);
};
export const land = (f: number, a: number, b: number) => 1 - Math.pow(1 - ramp(f, a, b), 4);

function loadSource(): Promise<Loaded> {
  const key = 'projects';
  if (!SNAPSHOT.has(key)) SNAPSHOT.set(key, (async () => {
    const response = await fetch(staticFile('ui-dom/projects.json'));
    if (!response.ok) throw new Error(`Authentic project snapshot: HTTP ${response.status}`);
    const snapshot: Snapshot = await response.json();
    for (const id of ['sidebar', 'topbar', 'section-0', 'section-1', 'section-2', 'row-2']) {
      if (!snapshot.fragments[id] || !snapshot.targets.some(t => t.id === id)) throw new Error(`Missing source fragment ${id}`);
    }
    if (snapshot.width !== 1440 || snapshot.height !== 980) throw new Error('Project snapshot geometry changed. Recheck assembly anchors.');
    const css = new Map<string, string>();
    for (const match of snapshot.css.matchAll(/\.(d\d+)\{[^}]*\}/g)) css.set(match[1], match[0]);
    if (!css.size) throw new Error('No frozen computed source styles found');
    if (!fontPromise) {
      const face = new FontFace('FilmInter', `url(${staticFile('fonts/Inter.woff2')})`, {weight: '100 900'});
      fontPromise = face.load().then(font => { document.fonts.add(font); return font; });
    }
    await fontPromise;
    return {snapshot, css};
  })());
  return SNAPSHOT.get(key)!;
}
function useSource() {
  const [source, setSource] = useState<Loaded | null>(null);
  const [gate] = useState(() => delayRender('Assembly: authentic product DOM and font', {timeoutInMilliseconds: 90000}));
  useEffect(() => {
    let active = true;
    loadSource().then(s => {if (active) setSource(s);}).catch(cancelRender);
    return () => {active = false; continueRender(gate);};
  }, [gate]);
  useLayoutEffect(() => {if (source) continueRender(gate);}, [source, gate]);
  return source;
}

/** Exact source markup, with only unused computed-style rules removed. */
function ProductPiece({source, fragment, frame, mode = 'plain', hideRow = false}:
  {source: Loaded; fragment?: string; frame: number; mode?: 'plain' | 'shell' | 'sidebar' | 'section'; hideRow?: boolean}) {
  const host = useRef<HTMLDivElement>(null);
  const [gate] = useState(() => delayRender(`Assembly piece ${fragment || 'shell'}`, {timeoutInMilliseconds: 90000}));
  useLayoutEffect(() => {
    if (!host.current) return;
    const part = fragment ? source.snapshot.fragments[fragment] : null;
    const html = part?.html || source.snapshot.html;
    const used = new Set(Array.from(html.matchAll(/class="([^"]*)"/g)).flatMap(m => m[1].split(/\s+/)));
    const css = Array.from(used).map(k => source.css.get(k) || '').join('\n');
    const root = host.current.shadowRoot || host.current.attachShadow({mode: 'open'});
    root.innerHTML = `<style>:host{display:block;pointer-events:none} ${css}
      *{animation:none!important;transition:none!important;caret-color:transparent!important}
      [data-piece-root]{position:relative;width:${part?.width || source.snapshot.width}px;height:${part?.height || source.snapshot.height}px}
      [data-piece-root]>[data-motion]{position:relative!important;inset:auto!important;margin:0!important;transform:none}
      </style><div data-piece-root>${html}</div><style data-frame-css></style>`;
    for (const el of root.querySelectorAll<HTMLElement>('[data-scroll-y]')) {
      el.scrollTop = Number(el.dataset.scrollY); el.scrollLeft = Number(el.dataset.scrollX);
    }
    Promise.all(Array.from(root.querySelectorAll<HTMLImageElement>('img')).map(img => img.decode()))
      .then(() => continueRender(gate)).catch(cancelRender);
    return () => continueRender(gate);
  }, [source, fragment, gate]);
  useLayoutEffect(() => {
    const root = host.current?.shadowRoot; if (!root) return;
    const css: string[] = [];
    const set = (id: string, rule: string) => css.push(`[data-motion="${id}"]{${rule}}`);
    if (mode === 'shell') {
      for (const id of ['sidebar', 'topbar', 'section-0', 'section-1', 'section-2']) set(id, 'opacity:0!important');
      set('heading-0', `opacity:${land(frame, 24, 47)}!important`);
      set('button-0', `clip-path:inset(0 ${(1-land(frame, 58, 86))*100}% 0 0 round 8px)!important`);
    }
    if (mode === 'sidebar') {
      for (const t of source.snapshot.targets.filter(t => t.kind === 'nav')) {
        const index = Number(t.id.slice(4));
        const arrival = land(frame, 12 + Math.min(index, 24) * 1.1, 29 + Math.min(index, 24) * 1.1);
        set(t.id, `opacity:${arrival}!important;transform:translateX(${-26*(1-arrival)}px)!important`);
      }
    }
    if (mode === 'section') {
      const index = Number((fragment || 'section-0').split('-')[1]);
      const start = [12, 25, -45][index];
      const progress = land(frame, start, start + 30);
      set(`row-${index}`, `opacity:${land(frame, start, start+9)}!important;transform:translateX(${(1-progress)*(160+index*32)}px)!important`);
    }
    if (hideRow) set('row-2', 'opacity:0!important');
    const style = root.querySelector('[data-frame-css]'); if (style) style.textContent = css.join('\n');
  }, [source, frame, mode, fragment, hideRow]);
  return <div ref={host} style={{width: fragment ? source.snapshot.fragments[fragment].width : 1440,
    height: fragment ? source.snapshot.fragments[fragment].height : 980}} />;
}

export function assemblyCamera(f: number, portrait: boolean) {
  const arc = travel(f, 0, 108), push = travel(f, 145, 181), away = travel(f, 207, 251);
  const rest = portrait ? .72 : 1.04;
  const focus = portrait ? 2.15 : 1.90;
  // Target is the project name, not the geometric centre of the screen.
  const nameX = portrait ? 156 : 332, nameY = portrait ? 995 : 547;
  const focusX = nameX - (309-720)*focus;
  const focusY = nameY - (545-(portrait?490:360))*focus;
  return {
    x: blend(blend(portrait?555:790, portrait?540:960, arc), focusX, push),
    y: blend(blend(portrait?1100:588, portrait?1077:636, arc), focusY, push),
    scale: blend(blend(portrait?.89:.91, rest, arc), focus, push) * blend(1, .92, away),
    rx: blend(43, 0, arc), ry: blend(-19, 0, arc), rz: blend(-11, 0, arc),
    opacity: blend(1, .12, away), blur: away*3,
  };
}
function Slab({children, rect, frame, enter, offset, opacity = 1, row = false, clipHeight}:
  {children: React.ReactNode; rect: Rect; frame: number; enter: [number, number]; offset: [number,number,number]; opacity?: number; row?: boolean; clipHeight?: number}) {
  const q = land(frame, enter[0], enter[1]);
  const shadow = (1-q);
  return <div style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.width, height: clipHeight ?? rect.height, overflow:clipHeight?'hidden':undefined,
    transform: `translate3d(${offset[0]*(1-q)}px,${offset[1]*(1-q)}px,${offset[2]*(1-q)+.2}px) rotateX(${(1-q)*-9}deg)`,
    transformStyle: 'preserve-3d', opacity,
    borderRadius: row ? 9 : 0, background: row ? '#f7f7f6' : '#fff',
    boxShadow: `0 ${shadow*26}px ${4+shadow*68}px rgba(15,30,44,${shadow*.23}),0 1px 0 rgba(255,255,255,.8) inset`}}>
    {shadow>.01 && <div style={{position:'absolute',inset:0,background:'#d8e0e5',borderRadius:row?9:0,transform:'translateZ(-5px)'}}/>}
    {children}
  </div>;
}
function Pointer({frame, portrait}: {frame: number; portrait: boolean}) {
  const q = travel(frame, 164, 187), click = Math.sin(Math.PI*ramp(frame, 189, 199));
  const x = blend(portrait?955:1680, portrait?614:830, q);
  const y = blend(portrait?1305:832, portrait?1015:565, q);
  const o = land(frame, 160, 166)*(1-land(frame, 201, 209));
  return <div style={{position:'absolute',left:x,top:y,opacity:o,zIndex:9,transform:`scale(${1-click*.17})`}}>
    <svg width={44} height={52} viewBox="0 0 44 52" style={{filter:'drop-shadow(0 3px 2px #0005)'}}>
      <path d="M5 3V40L15 30L24 48L31 44L23 27H39Z" fill="white" stroke="#11161c" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  </div>;
}
function Headline({frame, portrait}: {frame:number; portrait:boolean}) {
  const gone = travel(frame, 134, 152);
  const light = travel(frame,64,94);
  const ink = `rgb(${blend(244,17,light)},${blend(247,22,light)},${blend(250,28,light)})`;
  const style: CSSProperties = {position:'absolute',left:portrait?77:112,top:portrait?211:84,
    color:ink,lineHeight:.98,fontWeight:690,fontSize:portrait?132:106,letterSpacing:portrait?-7.3:-6.3,
    transform:`translateY(${-110*gone}px)`,opacity:1-gone,zIndex:3};
  return <div style={style}>
    <div style={{overflow:'hidden',paddingBottom:14}}><div style={{transform:`translateY(${(1-land(frame,0,17))*112}%)`}}>Everything.</div></div>
    <div style={{position:portrait?'relative':'absolute',left:portrait?0:633,top:portrait?0:0,overflow:'hidden',paddingBottom:14}}>
      <div style={{whiteSpace:'nowrap',color:C.blue,transform:`translateY(${(1-land(frame,64,85))*112}%)`}}>Connected.</div>
    </div>
  </div>;
}

export type AssemblyHeroProps = {f?: number; p?: boolean; exitToNext?: boolean};
export function AssemblyHero({f, p, exitToNext = false}: AssemblyHeroProps) {
  const actualFrame = useCurrentFrame(), config = useVideoConfig();
  const frame = f ?? actualFrame * 30 / config.fps;
  const portrait = p ?? config.width < config.height;
  const w = portrait ? 1080 : 1920, h = portrait ? 1920 : 1080;
  const viewportHeight = portrait ? 980 : 720;
  const originY = viewportHeight / 2;
  const source = useSource();
  if (!source) return <AbsoluteFill style={{background:C.paper}}/>;
  const camera = assemblyCamera(frame, portrait);
  const target = (id: string) => source.snapshot.targets.find(t => t.id === id)!.rect;
  const select = land(frame, 189, 203), lift = travel(frame, 207, 252);
  const dim = travel(frame, 207, 241), end = exitToNext ? travel(frame,286,300) : 0;
  const cardRect = target('row-2');
  const sourceRowX = camera.x + (cardRect.x-720)*camera.scale;
  const sourceRowY = camera.y + (cardRect.y-originY)*camera.scale;
  const displayScale = portrait ? 1.94 : 2.0;
  const rowScale = blend(camera.scale,displayScale,lift);
  const rowX = blend(sourceRowX,portrait?104:207,lift);
  const rowY = blend(sourceRowY,portrait?994:552,lift);
  const hideRow = frame >= 207;
  return <AbsoluteFill style={{background:C.paper,color:C.ink,fontFamily:'FilmInter,Arial,sans-serif',WebkitFontSmoothing:'antialiased',overflow:'hidden'}}>
    <style>{`*{box-sizing:border-box}body{margin:0}::selection{background:transparent}`}</style>
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 56% 53%,#fff 0%,#f2f4f5 74%)'}}/>
    <AbsoluteFill style={{background:'radial-gradient(ellipse at 62% 42%,#172b3b 0%,#07090c 68%)',opacity:1-travel(frame,64,94)}}/>
    {/* A quiet floor shadow is tied to the actual assembly, not an ambient loop. */}
    <div style={{position:'absolute',left:w*.16,top:portrait?1425:926,width:w*.68,height:portrait?145:96,
      background:'#152f47',opacity:.07*(1-dim),filter:'blur(45px)',borderRadius:'50%',transform:`scaleX(${blend(.8,1,travel(frame,0,106))})`}}/>
    <Headline frame={frame} portrait={portrait}/>
    <div style={{position:'absolute',inset:0,perspective:2400,perspectiveOrigin:'50% 50%',opacity:camera.opacity,filter:camera.blur?`blur(${camera.blur}px)`:undefined}}>
      <div style={{position:'absolute',left:camera.x-720,top:camera.y-originY,width:1440,height:viewportHeight,
        transform:`rotateX(${camera.rx}deg) rotateY(${camera.ry}deg) rotateZ(${camera.rz}deg) scale(${camera.scale})`,
        transformOrigin:'50% 50%',transformStyle:'preserve-3d'}}>
        <div style={{position:'absolute',inset:0,borderRadius:12,background:'#f7f7f6',
          boxShadow:'0 40px 100px #1b324826,0 0 0 1px #cfd8df66',opacity:blend(.17,1,land(frame,20,79))}}>
          <div style={{position:'absolute',inset:0,overflow:'hidden',borderRadius:12}}>
            <ProductPiece source={source} frame={frame} mode="shell"/>
          </div>
        </div>
        <Slab rect={target('sidebar')} frame={frame} enter={[0,55]} offset={[-540,35,220]} opacity={land(frame,-10,9)} clipHeight={viewportHeight}>
          <ProductPiece source={source} fragment="sidebar" frame={frame} mode="sidebar"/>
        </Slab>
        <Slab rect={target('topbar')} frame={frame} enter={[12,66]} offset={[170,-270,350]} opacity={land(frame,-3,12)}>
          <ProductPiece source={source} fragment="topbar" frame={frame}/>
        </Slab>
        {[0,1,2].map(index => <Slab key={index} rect={target(`section-${index}`)} frame={frame}
          enter={[[17,79],[30,94],[45,110]][index] as [number,number]}
          offset={[[230,-108,400],[350,4,500],[420,132,640]][index] as [number,number,number]}
          opacity={index===2?1:land(frame,index*5,index*5+12)} row>
            <ProductPiece source={source} fragment={`section-${index}`} frame={frame} mode="section" hideRow={index===2&&hideRow}/>
        </Slab>)}
        {/* Hover/selection is an editorial cue around the real row, not altered data. */}
        <div style={{position:'absolute',left:cardRect.x,top:cardRect.y,width:cardRect.width,height:cardRect.height,
          pointerEvents:'none',opacity:select*(1-lift),borderRadius:7,background:'#0284c709',
          boxShadow:`0 0 0 ${1.1+select*.7}px ${C.blue},0 0 0 ${select*6}px #0284c714`,transform:'translateZ(1px)'}}/>
      </div>
    </div>
    <Pointer frame={frame} portrait={portrait}/>
    {hideRow && <div style={{position:'absolute',left:rowX,top:rowY,width:cardRect.width,height:cardRect.height,
      transform:`scale(${rowScale})`,transformOrigin:'top left',zIndex:10,
      boxShadow:`0 ${lift*17}px ${lift*50}px #17324a26,0 0 0 1px #0284c744`,borderRadius:7,background:'#f7f7f6'}}>
        <ProductPiece source={source} fragment="row-2" frame={999}/>
    </div>}
    <div style={{position:'absolute',left:portrait?106:208,top:portrait?741:338,
      fontSize:portrait?111:124,fontWeight:680,lineHeight:1,letterSpacing:portrait?-6:-7,
      opacity:land(frame,232,250),transform:`translateY(${(1-land(frame,230,254))*37}px)`,zIndex:11}}>Every detail.</div>
    <div style={{position:'absolute',left:portrait?110:214,top:portrait?1185:747,
      opacity:land(frame,253,269),fontSize:portrait?26:25,lineHeight:1.5,color:C.slate,zIndex:11}}>
      Same project. One connected workspace.
    </div>
    <div style={{position:'absolute',left:portrait?77:112,bottom:portrait?113:43,
      display:'flex',alignItems:'center',gap:13,fontSize:portrait?18:15,fontWeight:500,color:frame<78?'#97a7b5':'#74818d',letterSpacing:.4,zIndex:12}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:C.blue}}/>
      Actual app interface · Fictional demo data · Editorial motion
    </div>
    {exitToNext && <AbsoluteFill style={{background:C.dark,zIndex:20,clipPath:`inset(0 ${(1-end)*100}% 0 0)`}}/>}
  </AbsoluteFill>;
}
