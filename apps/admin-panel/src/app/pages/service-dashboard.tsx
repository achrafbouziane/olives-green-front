import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useServiceBySlug, useQuotes, useJobs } from '@olives-green/data-access';
import { ServiceEditor } from './service-editor';
import { QuoteList } from './quote-list';
import { JobList } from './job-list';
import { SchedulePage } from './schedule-page';
import { Card, Button } from '@olives-green/shared-ui';
import { 
  LayoutDashboard, 
  FileText, 
  Hammer, 
  Calendar as CalendarIcon, 
  Edit, 
  ArrowLeft,
  ExternalLink,
  Plus
} from 'lucide-react';

export function ServiceDashboard() {
  const { slug } = useParams();
  
  // 1. Fetch Data for Context & Stats
  const { service, isLoading: serviceLoading } = useServiceBySlug(slug);
  const { quotes } = useQuotes();
  const { jobs } = useJobs();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUOTES' | 'JOBS' | 'SCHEDULE' | 'CONTENT'>('OVERVIEW');

  if (serviceLoading) return <div className="p-20 text-center text-slate-500">Loading Service...</div>;
  if (!service) return <div className="p-20 text-center text-red-500">Service not found</div>;

  // 2. Define Filter Key
  // We use the Service Title (e.g., "Landscaping") to filter the lists
  const FILTER_KEY = service.title;

  // 3. Calculate Overview Stats (Parent Logic)
  // We filter here just to show the numbers on the cards
  const serviceQuotes = quotes.filter(q => q.title.toLowerCase().includes(FILTER_KEY.toLowerCase()));
  const serviceJobs = jobs.filter(j => j.title.toLowerCase().includes(FILTER_KEY.toLowerCase()));
  
  const pendingCount = serviceQuotes.filter(q => q.status === 'REQUESTED').length;
  const activeJobCount = serviceJobs.filter(j => ['SCHEDULED', 'IN_PROGRESS'].includes(j.status)).length;
  const totalRevenue = serviceQuotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
  const conversionRate = serviceQuotes.length > 0 ? Math.round((serviceJobs.length / serviceQuotes.length) * 100) : 0;

  // --- INTERNAL COMPONENT: Quick Stats ---
  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-white border-l-4 border-emerald-500 shadow-sm">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Revenue</div>
        <div className="text-2xl font-bold text-slate-800 mt-1">
            ${totalRevenue.toLocaleString()}
        </div>
      </Card>
      <Card className="bg-white border-l-4 border-blue-500 shadow-sm">
         <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pending Requests</div>
         <div className="text-2xl font-bold text-slate-800 mt-1">{pendingCount}</div>
      </Card>
      <Card className="bg-white border-l-4 border-amber-500 shadow-sm">
         <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Jobs</div>
         <div className="text-2xl font-bold text-slate-800 mt-1">{activeJobCount}</div>
      </Card>
      <Card className="bg-white border-l-4 border-purple-500 shadow-sm">
         <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">Conversion Rate</div>
         <div className="text-2xl font-bold text-slate-800 mt-1">
            {conversionRate}%
         </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
         <div>
            <Link to="/services" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 text-sm font-medium transition-colors">
                <ArrowLeft size={16}/> Back to Services
            </Link>
            <div className="flex items-center gap-3">
                {service.imageUrl && (
                    <img src={service.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-200"/>
                )}
                <h1 className="text-3xl font-bold text-slate-800">
                    {service.title} <span className="text-slate-300 font-light">| Manager</span>
                </h1>
            </div>
         </div>
         <div className="flex gap-2">
             {/* Link to Manual Quote Creation pre-tagged with this service */}
             <Link to={`/quotes/new?service=${service.title}`}>
                <Button variant="primary"><Plus size={16} className="mr-2"/> New Quote</Button>
             </Link>
             <a href={`/service/${service.pageSlug}`} target="_blank" rel="noreferrer">
                <Button variant="secondary"><ExternalLink size={16} className="mr-2"/> Public Page</Button>
             </a>
         </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-slate-200 mb-6 flex gap-8 overflow-x-auto">
         {[
           { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
           { id: 'QUOTES', label: 'Quotes', icon: FileText, count: pendingCount },
           { id: 'JOBS', label: 'Jobs', icon: Hammer, count: activeJobCount },
           { id: 'SCHEDULE', label: 'Schedule', icon: CalendarIcon },
           { id: 'CONTENT', label: 'Page Content', icon: Edit },
         ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-emerald-600 text-emerald-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
               <tab.icon size={16}/> {tab.label}
               {/* Notification Badge */}
               {tab.count !== undefined && tab.count > 0 && (
                   <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">
                       {tab.count}
                   </span>
               )}
            </button>
         ))}
      </div>

      {/* CONTENT AREA */}
      <div className="animate-in fade-in duration-300 min-h-[400px]">
         
         {/* 1. OVERVIEW TAB */}
         {activeTab === 'OVERVIEW' && (
             <div className="space-y-8">
                <QuickStats />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Widget: Recent Quotes */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Recent Requests</h3>
                            <button onClick={() => setActiveTab('QUOTES')} className="text-xs text-blue-600 hover:underline">View All</button>
                        </div>
                        {/* Reuse QuoteList with 'slice' logic isn't possible via props easily, so we just show the filtered list constrained by height or let it flow. 
                            For a dashboard widget, we usually just show the main list or a simplified version. 
                            Here we reuse the full component but it will show all. */}
                        <div className="max-h-[400px] overflow-y-auto border rounded-xl shadow-sm">
                           <QuoteList serviceFilter={FILTER_KEY} />
                        </div>
                    </div>

                    {/* Widget: Active Jobs */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700">Active Jobs</h3>
                            <button onClick={() => setActiveTab('JOBS')} className="text-xs text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto border rounded-xl shadow-sm">
                           <JobList serviceFilter={FILTER_KEY} />
                        </div>
                    </div>
                </div>
             </div>
         )}

         {/* 2. QUOTES TAB */}
         {activeTab === 'QUOTES' && (
            <div>
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-700">Quote Requests for {service.title}</h2>
                </div>
                <QuoteList serviceFilter={FILTER_KEY} />
            </div>
         )}

         {/* 3. JOBS TAB */}
         {activeTab === 'JOBS' && (
            <div>
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-700">Job Management</h2>
                </div>
                <JobList serviceFilter={FILTER_KEY} />
            </div>
         )}

         {/* 4. SCHEDULE TAB */}
         {activeTab === 'SCHEDULE' && (
             <div>
                 <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-700">{service.title} Schedule</h2>
                    <p className="text-sm text-slate-500">Only showing jobs related to this service.</p>
                 </div>
                 <SchedulePage serviceFilter={FILTER_KEY} />
             </div>
         )}
         
         {/* 5. CONTENT TAB */}
         {activeTab === 'CONTENT' && (
             <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                 {/* We reuse the ServiceEditor. 
                     Note: ServiceEditor expects to read 'slug' from URL, which matches here. 
                     It handles its own fetching/saving. */}
                 <ServiceEditor /> 
             </div>
         )}
      </div>
    </div>
  );
}