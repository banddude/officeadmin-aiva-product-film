import overrides from './overrides.mjs';
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {execFileSync} from 'node:child_process';
const here=path.dirname(new URL(import.meta.url).pathname);const film=path.resolve(here,'../..');const app=process.env.OFFICEADMIN_SOURCE||'/home/ubuntu/code/officeadmin-books';const require=createRequire(import.meta.url);const esbuild=require(require.resolve('esbuild',{paths:[film]}));
const noop='()=>{}';const mods={
 'lib/hooks/use-api':`export const useApi=(url)=>({data:window.__filmApi(url),isLoading:false,isError:false,error:null,refetch:()=>{}});export const apiFetch=async url=>window.__filmApi(url);export const apiQueryKey=(org,url)=>['api',org,url];`,
 'lib/auth-client':`export const useSession=()=>({data:{user:window.__FILM__.user},status:'authenticated'});export const signOut=${noop};export const signIn=${noop};export const getSession=async()=>({user:window.__FILM__.user});`,
 'lib/hooks/use-active-org-id':`export const useActiveOrgId=()=>window.__FILM__.org.id;export const readActiveOrgId=()=>window.__FILM__.org.id;export const writeActiveOrgId=${noop};export const clearActiveOrgId=${noop};`,
 'lib/org/active-org':`export const readActiveOrgId=()=>window.__FILM__.org.id;export const writeActiveOrgId=${noop};export const clearActiveOrgId=${noop};export const seedActiveOrgId=${noop};`,
 'lib/hooks/use-org-currency':`export const useOrgCurrency=()=>'USD';`,
 'lib/hooks/use-document-title':`export const useDocumentTitle=${noop};`,
 'lib/hooks/use-entity-title':`export const useEntityTitle=${noop};`,
 'lib/hooks/use-smart-back':`export const useSmartBack=()=>()=>{};export const NavigationHistoryTracker=()=>null;`,
 'lib/hooks/use-cross-org-deep-link':`export const useCrossOrgDeepLink=()=>({isResolving:false,isSwitching:false,resolving:false,error:null,status:'idle'});`,
 'lib/hooks/use-pdf-preview-deep-link':`export const usePdfPreviewDeepLink=${noop};`,
 'lib/hooks/use-confirm':`export const useConfirm=()=>({confirm:async()=>false,dialog:null});`,
 'lib/hooks/use-api-mutation':`export const useApiMutation=()=>({mutate:${noop},mutateAsync:async()=>{throw Error('Demo mutation disabled')},isPending:false});`,
 'lib/offline/use-offline-collection':`export const useOfflineCollection=()=>({offlineData:[]});`,
 'lib/offline/store':`export const getRecord=async()=>undefined;export const hydrateCollection=async()=>{};export const getRecords=async()=>[];export const getAllRecords=async()=>[];export const putRecord=async()=>{};export const deleteRecord=async()=>{};export const subscribe=${noop};`,
 'components/offline/sync-indicator':`export const SyncIndicator=()=>null;`,
 'components/dashboard/create-drawer':`export const useCreateDrawer=()=>({open:${noop},close:${noop}});export const CreateDrawerProvider=({children})=>children;`,
 'lib/hooks/use-badges':`export const useBadges=()=>({teamUnread:0,teamUnreadAllOrgs:0,phoneUnread:0,notifUnread:0,aivaUnread:0,billsTotal:4,invoicesTotal:12});`,
 'lib/hooks/use-badges-realtime':`export const useBadgesRealtime=${noop};`,
 'lib/hooks/use-app-badge-sync':`export const useAppBadgeSync=${noop};`,
 'lib/hooks/use-prefetch-on-hover':`export const usePrefetchOnHover=()=>()=>{};`,
 'lib/hooks/use-idle-prefetch':`export const useIdlePrefetch=${noop};`,
 'lib/hooks/use-realtime':`export const useRealtime=${noop};`,
 'lib/hooks/use-deferred-after-paint':`export const useDeferredAfterPaint=()=>true;`,
 'lib/dev-delay':`export const devDelay=async()=>{};`,
 'lib/billing/use-native-purchase-blocked':`export const useNativePurchaseBlocked=()=>true;`,
 'components/dashboard/edit-profile-dialog':`export const AccountDialog=()=>null;`,
 'components/pdf/pdf-preview-modal':`export const PdfPreviewModal=()=>null;`,
 'components/dashboard/send-document-dialog':`export const SendDocumentDialog=()=>null;`,
 'components/sales/reconcile-send-dialog':`export const ReconcileSendDialog=()=>null;`,
 'components/dashboard/file-uploader':`export const FileUploader=()=>null;`,
 'components/dashboard/payment-attachment-viewer':`export const PaymentAttachmentViewer=()=>null;`,
 'components/aiva/aiva-status-menu':`export const AivaStatusPopover=({children})=>children;`,
 'components/aiva/aiva-status-deep-link':`export const useAivaStatusDeepLink=${noop};`,
 'components/chat/chat-layer-context':`const n=()=>{};export const useChatLayer=()=>({active:window.__filmMode==='aiva'?{kind:'aiva'}:null,aivaOpen:window.__filmMode==='aiva',identity:{title:'AIVA',avatar:{kind:'aiva'}},openAiva:n,closeChat:n,openTeam:n,openMessages:n,setIdentity:n,teamOpen:false});export const ChatLayerProvider=({children})=>children;`,
 'hooks/use-chat-layer-overlay':`export const useChatLayerOverlay=()=>window.innerWidth<768;`,
 'lib/hooks/use-native-read-aloud':`export const useNativeReadAloudAvailable=()=>false;export const useNativeReadAloud=()=>({available:false});`,
 'components/messages/link-file-dialog':`export const LinkFileDialog=()=>null;`,
};
mods['lib/hooks/use-native-read-aloud'] += 'export const useHeadphoneSettingsAvailable=()=>false;';
mods['lib/org/active-org'] += "export const ACTIVE_ORG_STORAGE_KEY='film-demo-org';";
mods['components/chat/chat-layer-context'] += "export const requestOpenAgentTerminal=()=>{};export const CHAT_LAYER_OPEN_EVENT='film-demo-chat';";
mods['lib/offline/store'] += ['setRecordState','mergeServerRows','getCursor','setCursor','maxUpdatedAt','evictOverCap'].map(n=>'export const '+n+'=async()=>undefined;').join('');
mods['components/chat'] = `export {AivaChatButton} from '@/components/chat/aiva-chat-button';export {MessagesChatButton} from '@/components/chat/messages-chat-button';export {useChatLayer,ChatLayerProvider} from '@/components/chat/chat-layer-context';export const ChatLayer=()=>null;`;
mods['lib/messages/autocorrect'] = `export const warmHarperCorrections=()=>{};export const autocorrectOutboundText=async(text)=>({text,changes:[]});`;
Object.assign(mods,overrides);
// Only nonvisual services and unopened dialogs are isolated. Core UI remains imported from source.
const plugin={name:'source-faithful-capture',setup(b){
 b.onResolve({filter:/^(react|react-dom)(\/.*)?$/},a=>({path:require.resolve(a.path,{paths:[film]})}));
 b.onResolve({filter:/^@\//},a=>{const key=a.path.slice(2);if(key in mods)return {path:key,namespace:'fixture'};const stem=path.join(app,key);return {path:[stem,stem+'.tsx',stem+'.ts',stem+'.jsx',stem+'.js',path.join(stem,'index.tsx'),path.join(stem,'index.ts')].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile())||stem};});
 b.onResolve({filter:/^next\//},a=>({path:a.path,namespace:'next-shim'}));
 b.onResolve({filter:/^next-themes$/},a=>({path:a.path,namespace:'theme-shim'}));
 // Resolve stubs imported relatively as well as through @ aliases.
 b.onResolve({filter:/^\.\.?\//},a=>{const absolute=path.resolve(a.resolveDir,a.path).replace(/\.(tsx?|jsx?)$/,'');const key=path.relative(app,absolute);if(key in mods)return {path:key,namespace:'fixture'};});
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({contents:mods[a.path],loader:'jsx',resolveDir:app}));
 b.onLoad({filter:/.*/,namespace:'theme-shim'},()=>({contents:`export const useTheme=()=>({theme:'light',resolvedTheme:'light',setTheme:()=>{}});export const ThemeProvider=({children})=>children;`,loader:'jsx'}));
 b.onLoad({filter:/.*/,namespace:'next-shim'},a=>({contents:a.path==='next/link'?`import React from 'react';export default React.forwardRef(function Link({href,children,prefetch,replace,scroll,legacyBehavior,...p},ref){return <a {...p} ref={ref} href={typeof href==='string'?href:'#'} onClick={e=>e.preventDefault()}>{children}</a>});`:a.path==='next/image'?`import React from 'react';export default function Image({src,alt,fill,priority,unoptimized,quality,placeholder,blurDataURL,onLoadingComplete,...p}){return <img src={typeof src==='string'?src:src?.src} alt={alt||''} {...p}/>}`:a.path==='next/navigation'?`export const useRouter=()=>({push:()=>{},replace:()=>{},refresh:()=>{},back:()=>{},prefetch:()=>{}});export const usePathname=()=>window.__FILM__.pathname||'/projects';export const useSearchParams=()=>new URLSearchParams(window.__FILM__.search||'');export const useParams=()=>window.__FILM__.params||{};export const redirect=()=>{};export const notFound=()=>{};`:`export default ()=>null;`,loader:'jsx',resolveDir:app}));
}};
await esbuild.build({entryPoints:[here+'/entry.tsx'],bundle:true,format:'iife',platform:'browser',external:['fs'],outfile:here+'/bundle.js',plugins:[plugin],jsx:'automatic',nodePaths:[app+'/node_modules',film+'/node_modules'],loader:{'.svg':'dataurl','.png':'dataurl','.woff2':'dataurl'},define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_APP_URL':'""'},mainFields:['browser','module','main'],metafile:true,write:true}).then(r=>fs.writeFileSync(here+'/metafile.json',JSON.stringify(r.metafile)));
const postcss=require(require.resolve('postcss',{paths:[film]}));const tw=require(require.resolve('@tailwindcss/postcss',{paths:[app]}));const css=fs.readFileSync(app+'/app/globals.css','utf8')+'\n@source "'+here+'/entry.tsx";\n';
const out=await postcss([tw()]).process(css,{from:app+'/app/globals.css',to:here+'/styles.css'});fs.writeFileSync(here+'/styles.css',out.css);
const story=JSON.parse(fs.readFileSync(film+'/production/v5/story-data.json','utf8'));
const visible=JSON.stringify(story).replace(/"_note":"[^"]*",?/,'');if(/\u2014/.test(visible))throw Error('Em dash in story data');
fs.writeFileSync(here+'/story.js','// Generated from production/v5/story-data.json by build.mjs. Do not edit.\nwindow.__STORY__='+JSON.stringify(story)+';\n');
fs.writeFileSync(here+'/index.html',`<!doctype html><html class="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/styles.css"><style>@font-face{font-family:CaptureInter;src:url(/fonts/Inter.woff2)}body{font-family:CaptureInter,Arial,sans-serif;margin:0}</style></head><body><div id="root"></div><script src="/story.js"></script><script src="/fixtures.js"></script><script src="/bundle.js"></script></body></html>`);
fs.writeFileSync(here+'/isolation-manifest.json',JSON.stringify({sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:app,encoding:'utf8'}).trim(),sourceRoot:app,nonvisualStubs:Object.keys(mods),storyData:'production/v5/story-data.json',method:'Actual imported client UI and CSS. Fictional API fixtures from V5 story data, no production connection.'},null,2));console.log('CAPTURE BUNDLE READY');
