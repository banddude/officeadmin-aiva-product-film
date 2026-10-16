import React from 'react';
import {createRoot} from 'react-dom/client';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
import {SidebarProvider,SidebarInset} from '@/components/ui/sidebar';
import {AppSidebar} from '@/components/dashboard/sidebar';
import {Topbar} from '@/components/dashboard/topbar';
import {PageToolbarProvider,PageToolbar} from '@/components/dashboard/page-toolbar';
import {ThreadHeaderProvider} from '@/components/dashboard/thread-header-context';
import {ChatLayer} from '@/components/chat/chat-layer';
import {Toaster as SonnerToaster} from 'sonner';
// Same app-wide toaster as app/layout.tsx, mounted so any error toast is visible in proofs.
const Toaster=()=><SonnerToaster position="top-center" theme="light" toastOptions={{classNames:{toast:'bg-card text-foreground border border-border rounded-xl shadow-md',description:'text-muted-foreground'}}}/>;
import ProjectsPage from '@/app/(dashboard)/projects/page';
import QuoteDetailClient from '@/app/(dashboard)/sales/estimates/[id]/quote-detail-client';
import ProjectLayout from '@/app/(dashboard)/projects/[id]/layout';
import ProjectOverviewPage from '@/app/(dashboard)/projects/[id]/page';
import ProjectTakeoffPage from '@/app/(dashboard)/projects/[id]/takeoff/page';
import ChangeOrdersPage from '@/app/(dashboard)/projects/[id]/change-orders/page';
import DraftApprovalsPage from '@/app/(dashboard)/draft-approvals/page';
import PortalQuoteDetailPage from '@/app/portal/[token]/quotes/[id]/page';
import PortalLayout from '@/app/portal/[token]/layout';
import InvoiceDetailClient from '@/app/(dashboard)/sales/[id]/invoice-detail-client';
import ScheduleClient from '@/app/(dashboard)/time/schedule/schedule-client';
import TimeClockClient from '@/app/(dashboard)/time/clock/clock-client';
import {DashboardClient} from '@/app/(dashboard)/dashboard/dashboard-client';
import PunchListPage from '@/app/(dashboard)/projects/[id]/punch-list/page';
import ProjectDailyReportsPage from '@/app/(dashboard)/projects/[id]/daily-reports/page';
import CostingPage from '@/app/(dashboard)/projects/[id]/costing/page';
import AccountingLayout from '@/app/(dashboard)/accounting/layout';
import BankAccountDetailLayout from '@/app/(dashboard)/accounting/banking/[id]/(detail)/layout';
import BankAccountOverviewPage from '@/app/(dashboard)/accounting/banking/[id]/(detail)/page';

const w=window as any;
const mode=w.__FILM__.screen;
w.__filmMode=mode;
for(const message of w.__FILM__.messages){message.at=message.createdAt;delete message.status;}
const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,refetchOnWindowFocus:false}}});
const project=(page:React.ReactNode)=><ProjectLayout>{page}</ProjectLayout>;
function Content(){
 if(mode.startsWith('estimate-'))return <QuoteDetailClient id={w.__FILM__.params.id}/>;
 if(mode.startsWith('takeoff-'))return project(<ProjectTakeoffPage/>);
 if(mode==='status-card')return project(<ProjectOverviewPage/>);
 if(mode.startsWith('change-orders-'))return project(<ChangeOrdersPage/>);
 if(mode.startsWith('draft-'))return <DraftApprovalsPage/>;
 if(mode.startsWith('invoice-'))return <InvoiceDetailClient id={w.__FILM__.params.id}/>;
 if(mode==='schedule-week')return <ScheduleClient/>;
 if(mode.startsWith('time-clock'))return <TimeClockClient/>;
 if(mode==='member-today'||mode==='dashboard')return <DashboardClient/>;
 if(mode==='punch-list')return project(<PunchListPage/>);
 if(mode==='daily-report')return project(<ProjectDailyReportsPage/>);
 if(mode==='job-costing')return project(<CostingPage/>);
 if(mode==='bank-feed')return <AccountingLayout><BankAccountDetailLayout><BankAccountOverviewPage/></BankAccountDetailLayout></AccountingLayout>;
 return <ProjectsPage/>;
}
// This nesting and responsive shell are taken from the app's dashboard layout.
// ChatLayer itself owns its actual desktop dock / mobile Sheet presentation.
function App(){
 if(mode.startsWith('portal-'))return <QueryClientProvider client={client}><PortalLayout><PortalQuoteDetailPage/></PortalLayout><Toaster/></QueryClientProvider>;
 return <QueryClientProvider client={client}><SidebarProvider defaultOpen={true}><AppSidebar/><div className="flex h-[100dvh] min-h-[100dvh] min-w-0 flex-1 flex-col"><ThreadHeaderProvider><Topbar/><div className="flex min-h-0 min-w-0 flex-1"><SidebarInset className="min-w-0 bg-content-bg"><PageToolbarProvider><div className="mx-auto w-full max-w-[1250px] flex-1 px-[max(0.75rem,env(safe-area-inset-left))] py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-[max(1.5rem,env(safe-area-inset-left))] sm:py-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"><PageToolbar/><Content/></div></PageToolbarProvider></SidebarInset><ChatLayer/></div></ThreadHeaderProvider></div></SidebarProvider><Toaster/></QueryClientProvider>;
}
createRoot(document.getElementById('root')!).render(<App/>);
