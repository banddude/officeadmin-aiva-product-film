// Data/service boundaries only. ChatLayer, ChatSurface, MessageThread,
// Composer, AppSidebar, Topbar and the business pages remain actual app source.
export default {
 'lib/messages/autocorrect': `export const warmHarperCorrections=()=>{};export const autocorrectOutboundText=async(text)=>({text,changes:[]});export const extractAutocorrectChanges=()=>[];export const buildAutocorrectRevertBody=(text)=>text;`,
 'components/chat/chat-layer-context': `const n=()=>{};const avatar={kind:'person',userId:'a1111111-1111-1111-1111-111111111111',name:'AIVA',image:null};const active={kind:'aiva'};const identity={title:'AIVA',avatar};export const useChatLayer=()=>({active:window.__filmMode.startsWith('aiva')?active:null,aivaOpen:window.__filmMode.startsWith('aiva'),identity,openAiva:n,closeChat:n,openAgentTerminal:n,openTeam:n,openMessages:n,setIdentity:n,rememberAivaDm:n,autoFocus:false,teamOpen:false});export const ChatLayerProvider=({children})=>children;export const requestOpenAgentTerminal=n;export const CHAT_LAYER_OPEN_EVENT='film-demo-chat';`,
 'lib/hooks/use-aiva-chat': `const avatar={kind:'person',userId:'a1111111-1111-1111-1111-111111111111',name:'AIVA',image:null};const no=async()=>{throw Error('Demo is read-only')};export const useAivaChat=()=>({messages:window.__filmMode==='aiva-context'?window.__FILM__.messages.slice(0,2):window.__FILM__.messages,currentUserId:'film-demo-user',headerAvatar:avatar,isLoading:false,isError:false,error:null,hasData:true,uploadFile:no,onSend:no,refetchThread:()=>{},orgLogoUrl:null,readReceipts:new Map()});`,
 'lib/hooks/use-cross-org-chats': `export const useCrossOrgChat=()=>({});export const useCrossOrgChats=()=>({});export const useMyConversations=()=>({data:{conversations:[]},conversations:[],isLoading:false,refetch:()=>{}});`,
 'lib/hooks/use-messages-realtime': `export const useMessagesRealtime=()=>{};`,
 'components/aiva/agent-terminal-panel': `export const AgentTerminalPanel=()=>null;`,
};
