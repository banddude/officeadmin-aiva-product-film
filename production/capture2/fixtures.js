// Fictional in-memory UI capture data. Never connected to production.
// Money and line quantities use the source application's hundredths convention.
const org={id:'film-demo-org',name:'Northline Electric',slug:'northline-electric',role:'owner',memberCount:4,defaultCurrency:'USD',country:'US',logo:null,documentLogo:'/fixture-document-wordmark.svg',createdAt:'2026-01-01T00:00:00Z'};
const user={id:'film-demo-user',name:'Alex Lee',email:'alex@example.com',image:null};
const project={id:'film-demo-project',name:'Cedar Court | EV Charging',status:'active',priority:'high',billingType:'fixed',color:'#0284c7',budget:1845000,hourlyRate:12500,totalHours:48,totalBilled:1845000,estimatedHours:64,startDate:'2026-10-05',endDate:'2026-11-06',category:'EV Charging',tags:['Commercial'],waitingOn:[],contact:{id:'film-demo-customer',name:'Cedar Court'},members:[]};
const projects=[{...project,id:'film-demo-02',name:'Harbor House | Service Upgrade',contact:{name:'Harbor House'},status:'estimating',priority:'normal',budget:790000,totalBilled:0,totalHours:0},{...project,id:'film-demo-03',name:'Southport Plaza | Commissioning',contact:{name:'Southport Plaza'},status:'bid_sent',budget:1260000,totalBilled:0,totalHours:4},project];
const contact={id:'film-demo-customer',name:'Cedar Court',email:'facilities@example.com',addresses:{billing:{line1:'100 Example Avenue',city:'Los Angeles',state:'CA',postalCode:'90012',country:'US'}}};
const lines=[['Make-ready infrastructure',1,795000],['Charging-station installation',6,112500],['Testing and commissioning',1,240000],['Permit and inspection coordination',1,135000]].map(([description,quantity,unitPrice],i)=>({id:'film-line-'+i,description,lineType:'item',quantity:quantity*100,unitPrice,amount:quantity*unitPrice,projectId:project.id,accountId:null,taxRateId:null,account:null,discountPercent:0,amountInvoiced:0}));
const common={id:'film-demo-document',issueDate:'2026-10-08',subtotal:1845000,taxTotal:0,total:1845000,notes:'Install and commission six Level 2 charging stations at Cedar Court. Includes make-ready infrastructure, testing, and closeout documentation.',reference:'Cedar Court EV Charging',contactId:contact.id,contact,projectId:project.id,projects:[{id:project.id,name:project.name}],documentsUrl:null,customFields:{jobName:'Cedar Court EV Charging'},lines};
const quote={...common,quoteNumber:'EST-01028',expiryDate:'2026-11-08',status:'accepted',exclusions:['Utility service upgrades and unforeseen concealed conditions.'],signature:{signerName:'Jordan Morgan',signedAt:'2026-10-09T16:20:00Z'},sentAt:'2026-10-08T16:00:00Z',pdfCustomerFormat:'itemized',materialPos:[],partialInvoices:[],invoicedSubtotal:0,remainingSubtotal:1845000,workflow:null};
const invoice={...common,issueDate:'2026-10-10',invoiceNumber:'INV-01042',dueDate:'2026-11-08',status:'paid',amountPaid:1845000,amountDue:0,suppressReminders:false};
const messages=[
 {id:'demo-message-1',source:'team',outbound:true,body:'What is left to close out Cedar Court?',createdAt:'2026-10-14T16:38:00Z',timestamp:'2026-10-14T16:38:00Z',sentAt:'2026-10-14T16:38:00Z',senderUserId:user.id,senderName:user.name,media:[],status:'sent',reactions:[]},
 {id:'demo-message-2',source:'team',outbound:false,body:'The charging stations are commissioned. The project still needs the inspection sign-off and closeout package.\n\nThe site conversation and project notes agree on those next steps.',createdAt:'2026-10-14T16:38:10Z',timestamp:'2026-10-14T16:38:10Z',sentAt:'2026-10-14T16:38:10Z',senderUserId:'a1111111-1111-1111-1111-111111111111',senderName:'AIVA',senderKind:'aiva',media:[],status:'sent',reactions:[]},
 {id:'demo-message-3',source:'team',outbound:true,body:'Draft the customer update for me.',createdAt:'2026-10-14T16:39:00Z',timestamp:'2026-10-14T16:39:00Z',sentAt:'2026-10-14T16:39:00Z',senderUserId:user.id,senderName:user.name,media:[],status:'sent',reactions:[]},
 {id:'demo-message-4',source:'team',outbound:false,body:'Draft for your review. Not sent.\n\nHi Jordan, the six charging stations are commissioned. We are preparing the inspection sign-off and closeout package. We will send those together once the final documentation is ready.',createdAt:'2026-10-14T16:39:10Z',timestamp:'2026-10-14T16:39:10Z',sentAt:'2026-10-14T16:39:10Z',senderUserId:'a1111111-1111-1111-1111-111111111111',senderName:'AIVA',senderKind:'aiva',media:[],status:'sent',reactions:[]}
];
window.__FILM__={org,user,project,projects,contact,quote,invoice,messages};
const cache=new Map();
const empty={data:[],entries:[],notifications:[],candidates:[],items:[],members:[],files:[],signatures:[],warnings:[],payments:[],properNouns:[],counts:{},pagination:{total:0,page:1,limit:25,totalPages:1}};
function response(url){
 if(!url)return undefined;
 const u=new URL(String(url),'http://capture.local'),p=u.pathname;
 if(p==='/api/v1/me')return {user,role:'owner',organizationId:org.id,isSiteAdmin:true,googleConnected:false,memberId:'film-member'};
 if(p==='/api/v1/organization')return {organization:org,organizations:[org]};
 if(p.endsWith('/billing-schedule'))return {contract:{quoteId:quote.id,quoteNumber:quote.quoteNumber,projectId:project.id,status:'accepted',currencyCode:'USD',subtotal:1845000,total:1845000},draws:[],progress:{contractSubtotalCents:1845000,scheduledCents:0,billedCents:0,remainingCents:1845000,nextDrawId:null,nextDrawLabel:null,nextDrawAmountCents:0}};
 if(p==='/api/v1/onboarding/status')return {isComplete:true,completedCount:5,totalCount:5,steps:{company:true,project:true,stripe:true,team:true,document:true}};
 if(p==='/api/v1/reports/cash-flow-forecast')return {forecastPeriod:{start:'2026-10-19',end:'2026-11-09',weeks:4},totalInflows:7600000,totalOutflows:4100000,netForecast:3500000,weeks:[['2026-10-19',1600000,900000,700000],['2026-10-26',2500000,1200000,2000000],['2026-11-02',1400000,900000,2500000],['2026-11-09',2100000,1100000,3500000]].map(([weekOf,inflows,outflows,cumulativeNet])=>({weekOf,inflows,outflows,net:inflows-outflows,cumulativeNet,entryCount:3}))};
 if(p.startsWith('/api/v1/quotes/'))return {quote};
 if(p==='/api/v1/invoices/film-demo-document')return {invoice,payments:[{id:'demo-payment',paymentNumber:'PMT-00412',date:'2026-10-12',amount:1845000,method:'bank_transfer',reference:'Cedar Court',notes:null}]};
 if(p.endsWith('/compliance'))return {warnings:[]};
 if(p.endsWith('/snapshot'))return {recipient:null};
 if(p.endsWith('/signatures'))return {signatures:[]};
 if(p==='/api/v1/projects')return {data:projects,projects,pagination:{total:3,page:1,limit:25,totalPages:1},counts:{all:3,active:1,bidding:1,bid_sent:1}};
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
 if(p==='/api/v1/entries')return {entries:[{id:'entry-01',entryNumber:1042,date:'2026-10-12',description:'Cedar Court | Customer payment',status:'posted',totalDebit:'18450.00'},{id:'entry-02',entryNumber:1041,date:'2026-10-11',description:'Materials | Charging installation',status:'posted',totalDebit:'4720.00'},{id:'entry-03',entryNumber:1040,date:'2026-10-10',description:'Northline Electric | Field labor',status:'posted',totalDebit:'3800.00'}]};
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
