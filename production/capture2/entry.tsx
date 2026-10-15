import React from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {SidebarProvider,SidebarInset} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/dashboard/sidebar';
import {Topbar} from '@/components/dashboard/topbar';
import {PageToolbarProvider,PageToolbar} from '@/components/dashboard/page-toolbar';
import {ThreadHeaderProvider} from '@/components/dashboard/thread-header-context';
import {ChatLayer} from '@/components/chat/chat-layer';
import ProjectsPage from '@/app/(dashboard)/projects/page';
import QuoteDetailClient from '@/app/(dashboard)/sales/estimates/[id]/quote-detail-client';
import InvoiceDetailClient from '@/app/(dashboard)/sales/[id]/invoice-detail-client';
import {DashboardClient} from '@/app/(dashboard)/dashboard/dashboard-client';

const w=window as any;
const mode=new URLSearchParams(location.search).get('screen')||'projects';
w.__filmMode=mode;
for(const message of w.__FILM__.messages){message.at=message.createdAt;delete message.status;}
const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,refetchOnWindowFocus:false}}});
function Content(){
 if(mode==='estimate')return <QuoteDetailClient id="film-demo-document"/>;
 if(mode==='invoice')return <InvoiceDetailClient id="film-demo-document"/>;
 if(mode==='dashboard')return <DashboardClient/>;
 return <ProjectsPage/>;
}
// This nesting and responsive shell are taken from the app's dashboard layout.
// ChatLayer itself owns its actual desktop dock / mobile Sheet presentation.
function App(){return <QueryClientProvider client={client}><SidebarProvider defaultOpen={true}><AppSidebar/><div className="flex h-[100dvh] min-h-[100dvh] min-w-0 flex-1 flex-col"><ThreadHeaderProvider><Topbar/><div className="flex min-h-0 min-w-0 flex-1"><SidebarInset className="min-w-0 bg-content-bg"><PageToolbarProvider><div className="mx-auto w-full max-w-[1250px] flex-1 px-[max(0.75rem,env(safe-area-inset-left))] py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-[max(1.5rem,env(safe-area-inset-left))] sm:py-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"><PageToolbar/><Content/></div></PageToolbarProvider></SidebarInset><ChatLayer/></div></ThreadHeaderProvider></div></SidebarProvider></QueryClientProvider>}
createRoot(document.getElementById('root')!).render(<App/>);
