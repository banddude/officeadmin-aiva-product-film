// Fictional in-memory UI capture data. Never connected to production.
// Money and line quantities use the source application's hundredths convention.
const org={id:'film-demo-org',name:'Northline Electric',slug:'northline-electric',role:'owner',memberCount:4,defaultCurrency:'USD',country:'US',logo:null,documentLogo:'/fixture-document-wordmark.svg',createdAt:'2026-01-01T00:00:00Z'};
const user={id:'film-demo-user',name:'Alex Lee',email:'alex@example.com',image:null};
const project={id:'film-demo-project',name:'Juniper Café | Commercial TI',status:'active',priority:'high',billingType:'fixed',color:'#0284c7',budget:2080000,hourlyRate:12500,totalHours:76,totalBilled:2080000,estimatedHours:112,startDate:'2026-10-05',endDate:'2026-11-13',category:'Commercial TI',tags:['Commercial','Tenant Improvement'],waitingOn:['Lighting change-order approval'],contact:{id:'film-demo-customer',name:'Juniper Café'},members:[]};
const projects=[project,{...project,id:'film-demo-service',name:'Garcia Residence | 200A Service Upgrade',contact:{name:'Garcia Residence'},status:'active',priority:'normal',budget:860000,totalBilled:0,totalHours:6,category:'Residential Service',tags:['Residential'],waitingOn:['Utility release']},{...project,id:'film-demo-ev',name:'Cedar Court | EV Charging',contact:{name:'Cedar Court'},status:'active',priority:'normal',budget:1845000,totalBilled:0,totalHours:14,category:'EV Charging',tags:['Commercial','EV'],waitingOn:['Friday inspection']}];
const contact={id:'film-demo-customer',name:'Juniper Café',email:'projects@example.com',addresses:{billing:{line1:'220 Example Street',city:'Los Angeles',state:'CA',postalCode:'90012',country:'US'}}};
const lines=[['Lighting and power rough-in',1,840000],['Panel and feeder modifications',1,495000],['Devices, lighting trim, and controls',1,560000],['Permit and inspection coordination',1,185000]].map(([description,quantity,unitPrice],i)=>({id:'film-line-'+i,description,lineType:'item',quantity:quantity*100,unitPrice,amount:quantity*unitPrice,projectId:project.id,accountId:null,taxRateId:null,account:null,discountPercent:0,amountInvoiced:0}));
const common={id:'film-demo-document',issueDate:'2026-10-08',subtotal:2080000,taxTotal:0,total:2080000,notes:'Electrical tenant improvement for Juniper Café. Includes lighting and receptacle rough-in, panel and feeder modifications, device and lighting trim, controls, testing, and permit coordination.',reference:'Juniper Café Commercial TI',contactId:contact.id,contact,projectId:project.id,projects:[{id:project.id,name:project.name}],documentsUrl:null,customFields:{jobName:'Juniper Café Commercial TI'},lines};
const quote={...common,quoteNumber:'EST-01408',expiryDate:'2026-11-08',status:'accepted',exclusions:['Fire alarm, low-voltage cabling, utility fees, and unforeseen concealed conditions.'],signature:{signerName:'Jordan Morgan',signedAt:'2026-10-09T16:20:00Z'},sentAt:'2026-10-08T16:00:00Z',pdfCustomerFormat:'itemized',materialPos:[],partialInvoices:[],invoicedSubtotal:0,remainingSubtotal:2080000,workflow:null};
const invoice={...common,issueDate:'2026-10-10',invoiceNumber:'INV-01422',dueDate:'2026-11-08',status:'paid',amountPaid:2080000,amountDue:0,suppressReminders:false};
const messages=[
 {id:'demo-message-1',source:'team',outbound:true,body:'What needs my attention today?',createdAt:'2026-10-14T16:38:00Z',timestamp:'2026-10-14T16:38:00Z',sentAt:'2026-10-14T16:38:00Z',senderUserId:user.id,senderName:user.name,media:[],status:'sent',reactions:[]},
 {id:'demo-message-2',source:'team',outbound:false,body:"Juniper: lighting change awaits approval.\nGarcia: utility release for Thursday.\nCedar Court: inspection Friday at 10:00.",createdAt:'2026-10-14T16:38:10Z',timestamp:'2026-10-14T16:38:10Z',sentAt:'2026-10-14T16:38:10Z',senderUserId:'a1111111-1111-1111-1111-111111111111',senderName:'AIVA',senderKind:'aiva',media:[],status:'sent',reactions:[]},
 {id:'demo-message-3',source:'team',outbound:true,body:'Draft the updates.',createdAt:'2026-10-14T16:39:00Z',timestamp:'2026-10-14T16:39:00Z',sentAt:'2026-10-14T16:39:00Z',senderUserId:user.id,senderName:user.name,media:[],status:'sent',reactions:[]},
 {id:'demo-message-4',source:'team',outbound:false,body:'Three project updates drafted.\nReady for your review. Nothing sent.',createdAt:'2026-10-14T16:39:10Z',timestamp:'2026-10-14T16:39:10Z',sentAt:'2026-10-14T16:39:10Z',senderUserId:'a1111111-1111-1111-1111-111111111111',senderName:'AIVA',senderKind:'aiva',media:[],status:'sent',reactions:[]}
];

const scheduleEmployees=[
 {userId:'crew-maya',name:'Maya Chen',email:'maya@example.com'},
 {userId:'crew-chris',name:'Chris Wilson',email:'chris@example.com'},
 {userId:'crew-devin',name:'Devin Brooks',email:'devin@example.com'}
];
const scheduleProjects=projects.map(p=>({id:p.id,name:p.name,billingType:p.billingType,status:p.status,description:p.category,siteAddress:p.id==='film-demo-project'?'220 Example Street, Los Angeles, CA':p.id==='film-demo-service'?'45 Example Drive, Los Angeles, CA':'100 Example Avenue, Los Angeles, CA',lastScheduledAt:'2026-10-14T16:00:00Z',recentShiftCount:2}));
const scheduledShifts=[
 {id:'shift-01',employeeUserId:'crew-maya',employeeName:'Maya Chen',employeeEmail:'maya@example.com',contactId:null,contactName:null,eventType:'shift',projectId:'film-demo-project',projectName:'Juniper Café | Commercial TI',projectContactName:'Juniper Café',projectSiteAddress:'220 Example Street',scheduledStart:'2026-10-12T14:00:00Z',scheduledEnd:'2026-10-12T22:30:00Z',breakMinutes:30,notes:'Lighting and power rough-in',status:'completed',tasks:[{id:'t1',title:'Complete dining-room rough-in',status:'done'}]},
 {id:'shift-02',employeeUserId:'crew-chris',employeeName:'Chris Wilson',employeeEmail:'chris@example.com',contactId:null,contactName:null,eventType:'shift',projectId:'film-demo-service',projectName:'Garcia Residence | 200A Service Upgrade',projectContactName:'Garcia Residence',projectSiteAddress:'45 Example Drive',scheduledStart:'2026-10-13T15:00:00Z',scheduledEnd:'2026-10-13T20:00:00Z',breakMinutes:0,notes:'Panel prep and utility coordination',status:'completed',tasks:[{id:'t2',title:'Confirm utility release',status:'in_progress'}]},
 {id:'shift-03',employeeUserId:'crew-devin',employeeName:'Devin Brooks',employeeEmail:'devin@example.com',contactId:null,contactName:null,eventType:'shift',projectId:'film-demo-ev',projectName:'Cedar Court | EV Charging',projectContactName:'Cedar Court',projectSiteAddress:'100 Example Avenue',scheduledStart:'2026-10-14T15:00:00Z',scheduledEnd:'2026-10-14T23:00:00Z',breakMinutes:30,notes:'Commissioning and closeout',status:'in_progress',tasks:[{id:'t3',title:'Commission chargers',status:'in_progress'}]},
 {id:'shift-04',employeeUserId:'crew-maya',employeeName:'Maya Chen',employeeEmail:'maya@example.com',contactId:null,contactName:null,eventType:'shift',projectId:'film-demo-project',projectName:'Juniper Café | Commercial TI',projectContactName:'Juniper Café',projectSiteAddress:'220 Example Street',scheduledStart:'2026-10-15T14:00:00Z',scheduledEnd:'2026-10-15T22:30:00Z',breakMinutes:30,notes:'Lighting trim and controls',status:'planned',tasks:[{id:'t4',title:'Install lighting controls',status:'todo'}]},
 {id:'shift-05',employeeUserId:'crew-chris',employeeName:'Chris Wilson',employeeEmail:'chris@example.com',contactId:null,contactName:null,eventType:'shift',projectId:'film-demo-service',projectName:'Garcia Residence | 200A Service Upgrade',projectContactName:'Garcia Residence',projectSiteAddress:'45 Example Drive',scheduledStart:'2026-10-15T14:00:00Z',scheduledEnd:'2026-10-15T22:00:00Z',breakMinutes:30,notes:'Panel swap and inspection',status:'planned',tasks:[{id:'t5',title:'Replace service equipment',status:'todo'}]},
 {id:'shift-06',employeeUserId:'crew-devin',employeeName:'Devin Brooks',employeeEmail:'devin@example.com',contactId:null,contactName:null,eventType:'shift',projectId:'film-demo-ev',projectName:'Cedar Court | EV Charging',projectContactName:'Cedar Court',projectSiteAddress:'100 Example Avenue',scheduledStart:'2026-10-16T17:00:00Z',scheduledEnd:'2026-10-16T19:00:00Z',breakMinutes:0,notes:'Final inspection',status:'planned',tasks:[{id:'t6',title:'Meet inspector',status:'todo'}]}
];

window.__FILM__={org,user,project,projects,contact,quote,invoice,messages};
const cache=new Map();
const empty={data:[],entries:[],notifications:[],candidates:[],items:[],members:[],files:[],signatures:[],warnings:[],payments:[],properNouns:[],counts:{},pagination:{total:0,page:1,limit:25,totalPages:1}};
function response(url){
 if(!url)return undefined;
 const u=new URL(String(url),'http://capture.local'),p=u.pathname;
 if(p==='/api/v1/me')return {user,userId:user.id,role:'owner',organizationId:org.id,isSiteAdmin:true,googleConnected:false,memberId:'film-member'};
 if(p==='/api/v1/organization')return {organization:org,organizations:[org]};
 if(p.endsWith('/billing-schedule'))return {contract:{quoteId:quote.id,quoteNumber:quote.quoteNumber,projectId:project.id,status:'accepted',currencyCode:'USD',subtotal:2080000,total:2080000},draws:[],progress:{contractSubtotalCents:2080000,scheduledCents:0,billedCents:0,remainingCents:2080000,nextDrawId:null,nextDrawLabel:null,nextDrawAmountCents:0}};
 if(p==='/api/v1/onboarding/status')return {isComplete:true,completedCount:5,totalCount:5,steps:{company:true,project:true,stripe:true,team:true,document:true}};
 if(p==='/api/v1/reports/cash-flow-forecast')return {forecastPeriod:{start:'2026-10-19',end:'2026-11-09',weeks:4},totalInflows:7600000,totalOutflows:4100000,netForecast:3500000,weeks:[['2026-10-19',1600000,900000,700000],['2026-10-26',2500000,1200000,2000000],['2026-11-02',1400000,900000,2500000],['2026-11-09',2100000,1100000,3500000]].map(([weekOf,inflows,outflows,cumulativeNet])=>({weekOf,inflows,outflows,net:inflows-outflows,cumulativeNet,entryCount:3}))};
 if(p.startsWith('/api/v1/quotes/'))return {quote};
 if(p==='/api/v1/invoices/film-demo-document')return {invoice,payments:[{id:'demo-payment',paymentNumber:'PMT-00618',date:'2026-10-12',amount:2080000,method:'bank_transfer',reference:'Juniper Café',notes:null}]};
 if(p.endsWith('/compliance'))return {warnings:[]};
 if(p.endsWith('/snapshot'))return {recipient:null};
 if(p.endsWith('/signatures'))return {signatures:[]};
 if(p==='/api/v1/projects')return {data:projects,projects,pagination:{total:3,page:1,limit:25,totalPages:1},counts:{all:3,active:1,bidding:1,bid_sent:1,estimating:1}};
 if(p==='/api/v1/scheduled-shifts')return {shifts:scheduledShifts};
 if(p==='/api/v1/time-off')return {timeOff:[]};
 if(p==='/api/v1/time/clock')return {employees:scheduleEmployees,contacts:[],projects:scheduleProjects,activeEntries:[]};
 if(p.startsWith('/api/v1/projects/'))return {project,data:project};
 if(p==='/api/v1/phone/access')return {canAccessPhone:false};
 if(p==='/api/v1/reports/profit-and-loss')return {totals:{operatingRevenue:9250000,cogs:4320000,grossProfit:4930000,operatingExpenses:2310000,operatingIncome:2620000,otherIncome:0,otherExpenses:0,netIncome:2620000},sections:{operating_revenue:{total:9250000,accounts:[]},cogs:{total:4320000,accounts:[]},operating_expense:{total:2310000,accounts:[{accountId:'a',code:'6100',name:'Field labor',balanceCents:1320000},{accountId:'b',code:'6200',name:'Vehicles and equipment',balanceCents:470000},{accountId:'c',code:'6300',name:'Office and administration',balanceCents:520000}]},other_income:{total:0,accounts:[]},other_expense:{total:0,accounts:[]}}};
 if(p.includes('aged-receivables'))return {bucketTotals:{current:2875000,'1_30':640000,'31_60':0,'61_90':0,over_90:0},grandTotalCents:3515000,parties:[{documents:[{bucket:'current'},{bucket:'current'},{bucket:'1_30'}]}]};
 if(p.includes('aged-payables'))return {bucketTotals:{current:840000,'1_30':0,'31_60':0,'61_90':0,over_90:0},grandTotalCents:840000,parties:[{documents:[{bucket:'current'}]}]};
 if(p.includes('monthly-trends'))return {}; // No trend history in this fictional account; retain full financial totals.
 if(p.includes('budget-vs-actual'))return {comparisons:[]};
 if(p.includes('financial-ratios'))return {ratios:{currentRatio:2.4,quickRatio:2.1,grossMargin:53.3,netMargin:28.3,dso:19,dpo:12}};
 if(p==='/api/v1/dashboard/alerts')return {overdueInvoices:{count:0,total:0},overdueBills:{count:0,total:0},uncategorizedTransactions:0,accountsNeedingReconciliation:[]};
 if(p==='/api/v1/crm/analytics')return {openDeals:4,wonDeals:6,totalPipelineValue:6845000,wonValue:9250000,conversionRate:60};
 if(p==='/api/v1/dashboard/operational')return undefined;
 if(p==='/api/v1/entries')return {entries:[{id:'entry-01',entryNumber:1042,date:'2026-10-12',description:'Juniper Café | Customer payment',status:'posted',totalDebit:'20800.00'},{id:'entry-02',entryNumber:1041,date:'2026-10-11',description:'Materials | Commercial TI',status:'posted',totalDebit:'6120.00'},{id:'entry-03',entryNumber:1040,date:'2026-10-10',description:'Northline Electric | Field labor',status:'posted',totalDebit:'4750.00'}]};
 return empty;
}
window.__filmApi=url=>{const k=String(url);if(!cache.has(k))cache.set(k,response(url));return cache.get(k)};
window.__filmReadLog=[];window.__filmMutationAttempts=[];
window.fetch=async(input,init={})=>{const url=typeof input==='string'?input:input.url;const method=(init.method||input.method||'GET').toUpperCase();if(method!=='GET'&&method!=='HEAD'){window.__filmMutationAttempts.push({url,method});throw Error('Demo capture forbids business mutations')};if(/^https?:/.test(url)&&!url.startsWith(location.origin)){throw Error('External network disabled')};window.__filmReadLog.push(url);if(String(url).includes('/dashboard/payroll-status'))return new Response('{}',{status:404});return new Response(JSON.stringify(window.__filmApi(url)??empty),{status:200,headers:{'Content-Type':'application/json'}})};
window.XMLHttpRequest=class{open(){throw Error('XHR disabled in capture')}};
window.WebSocket=class{constructor(){throw Error('WebSocket disabled in capture')}};
window.process={env:{NODE_ENV:'production'}};
Math.random=()=>0.1;
const RealDate=Date;window.Date=class extends RealDate{constructor(...args){super(...(args.length?args:['2026-10-14T16:41:00Z']))}static now(){return new RealDate('2026-10-14T16:41:00Z').getTime()}};
