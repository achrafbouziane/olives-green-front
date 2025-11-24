import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useServiceBySlug, useQuotes, useJobs } from '@olives-green/data-access';
import { ServiceEditor } from './service-editor';
import { QuoteList } from './quote-list';
import { JobList } from './job-list';
import { SchedulePage } from './schedule-page';
import { Card, Button } from '@olives-green/shared-ui';
import { 
  LayoutDashboard, FileText, Hammer, Calendar as CalendarIcon, Edit, 
  ArrowLeft, ExternalLink, Plus, Clock, ChevronRight, User
} from 'lucide-react';
import { format } from 'date-fns';

export function ServiceDashboard() {
  const { slug } = useParams();
  
  const { service, isLoading: serviceLoading } = useServiceBySlug(slug);
  const { quotes } = useQuotes();
  const { jobs } = useJobs();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUOTES' | 'JOBS' | 'SCHEDULE' | 'CONTENT'>('OVERVIEW');

  if (serviceLoading) return <div className="p-20 text-center text-slate-500">Loading Service...</div>;
  if (!service) return <div className="p-20 text-center text-red-500">Service not found</div>;

  // --- DYNAMIC FILTER LOGIC ---
  const FILTER_KEY = service.title; 

  const serviceQuotes = quotes.filter(q => (q.title || '').toLowerCase().includes(FILTER_KEY.toLowerCase()));
  const serviceJobs = jobs.filter(j => (j.title || '').toLowerCase().includes(FILTER_KEY.toLowerCase()));
  
  const pendingCount = serviceQuotes.filter(q => q.status === 'REQUESTED').length;
  const activeJobCount = serviceJobs.filter(j => ['SCHEDULED', 'IN_PROGRESS'].includes(j.status)).length;
  const totalRevenue = serviceQuotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0);
  const conversionRate = serviceQuotes.length > 0 ? Math.round((serviceJobs.length / serviceQuotes.length) * 100) : 0;

  // --- HELPER COMPONENTS FOR DASHBOARD ---
  
  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white border-l-4 border-emerald-500 shadow-sm p-5 rounded-r-xl">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</div>
        <div className="text-2xl font-bold text-slate-800 mt-1">${totalRevenue.toLocaleString()}</div>
      </div>
      <div className="bg-white border-l-4 border-blue-500 shadow-sm p-5 rounded-r-xl">
         <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Requests</div>
         <div className="text-2xl font-bold text-slate-800 mt-1">{pendingCount}</div>
      </div>
      <div className="bg-white border-l-4 border-amber-500 shadow-sm p-5 rounded-r-xl">
         <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Jobs</div>
         <div className="text-2xl font-bold text-slate-800 mt-1">{activeJobCount}</div>
      </div>
      <div className="bg-white border-l-4 border-purple-500 shadow-sm p-5 rounded-r-xl">
         <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Conversion Rate</div>
         <div className="text-2xl font-bold text-slate-800 mt-1">{conversionRate}%</div>
      </div>
    </div>
  );

  // Lightweight List for Quotes Widget
  const RecentQuotesWidget = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText size={18} className="text-blue-500"/> Recent Requests</h3>
            <button onClick={() => setActiveTab('QUOTES')} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">View All</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            {serviceQuotes.length > 0 ? (
                <div className="space-y-2">
                    {serviceQuotes.slice(0, 5).map(quote => (
                        <Link to={`/quotes/${quote.id}`} key={quote.id} className="block p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{quote.requestDetails?.match(/Client: (.*?)(?:\n|$)/)?.[1] || 'Guest'}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{quote.title}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono text-xs font-bold text-slate-700">${quote.totalAmount?.toLocaleString() || 0}</div>
                                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        quote.status === 'REQUESTED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                    }`}>{quote.status.replace('_',' ')}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                    <FileText size={32} className="opacity-20 mb-2"/>
                    <p className="text-sm">No requests found</p>
                </div>
            )}
        </div>
        <div className="p-3 border-t border-slate-100 text-center">
            <Link to="/quotes/new" className="text-xs font-bold text-emerald-600 hover:underline flex items-center justify-center gap-1"><Plus size={12}/> Create Manual Quote</Link>
        </div>
    </div>
  );

  // Lightweight List for Jobs Widget
  const ActiveJobsWidget = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Hammer size={18} className="text-amber-500"/> Upcoming Jobs</h3>
            <button onClick={() => setActiveTab('JOBS')} className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">View All</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            {serviceJobs.length > 0 ? (
                <div className="space-y-2">
                    {serviceJobs.slice(0, 5).map(job => (
                        <Link to={`/jobs/${job.id}`} key={job.id} className="block p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${job.status === 'SCHEDULED' ? 'bg-blue-500' : job.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{job.clientName || 'Unknown Client'}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{job.title}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {job.scheduledDate ? (
                                        <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                            <Clock size={10}/> {format(new Date(job.scheduledDate), 'MMM dd')}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] italic text-slate-400">Unscheduled</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                    <Hammer size={32} className="opacity-20 mb-2"/>
                    <p className="text-sm">No active jobs</p>
                </div>
            )}
        </div>
        <div className="p-3 border-t border-slate-100 text-center">
            <button onClick={() => setActiveTab('SCHEDULE')} className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">View Full Schedule <ChevronRight size={12}/></button>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 mt-2">
         <div>
            <Link to="/services" className="text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 text-sm font-medium transition-colors">
                <ArrowLeft size={16}/> Back to Services
            </Link>
            <div className="flex items-center gap-4">
                {service.imageUrl ? (
                    <img src={service.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-200"/>
                ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-400">
                        {service.title.charAt(0)}
                    </div>
                )}
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{service.title}</h1>
                    <p className="text-slate-500 text-sm font-medium">Service Dashboard</p>
                </div>
            </div>
         </div>
         <div className="flex gap-3">
             <Link to={`/quotes/new?service=${service.title}`}>
                <Button variant="primary" className="shadow-lg shadow-emerald-100"><Plus size={18} className="mr-2"/> New Quote</Button>
             </Link>
             <a href={`/service/${service.pageSlug}`} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="bg-white border border-slate-200 hover:bg-slate-50"><ExternalLink size={18} className="mr-2"/> Public Page</Button>
             </a>
         </div>
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200 mb-8 flex gap-8 overflow-x-auto">
         {[
           { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
           { id: 'QUOTES', label: 'Quotes', icon: FileText, count: pendingCount },
           { id: 'JOBS', label: 'Jobs', icon: Hammer, count: activeJobCount },
           { id: 'SCHEDULE', label: 'Schedule', icon: CalendarIcon },
           { id: 'CONTENT', label: 'Page Content', icon: Edit },
         ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 flex items-center gap-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
               <tab.icon size={16}/> {tab.label}
               {tab.count !== undefined && tab.count > 0 && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>}
            </button>
         ))}
      </div>

      {/* BODY */}
      <div className="animate-in fade-in duration-300 min-h-[400px]">
         {activeTab === 'OVERVIEW' && (
             <div className="space-y-8">
                <QuickStats />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[450px]">
                    <RecentQuotesWidget />
                    <ActiveJobsWidget />
                </div>
             </div>
         )}
         
         {/* These tabs use the FULL COMPLEX COMPONENTS you requested */}
         {activeTab === 'QUOTES' && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">All Quotes</h2>
                </div>
                <QuoteList serviceFilter={FILTER_KEY} />
            </div>
         )}

         {activeTab === 'JOBS' && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">All Jobs</h2>
                </div>
                <JobList serviceFilter={FILTER_KEY} />
            </div>
         )}

         {activeTab === 'SCHEDULE' && (
             <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Service Schedule</h2>
                 </div>
                 <SchedulePage serviceFilter={FILTER_KEY} />
             </div>
         )}
         
         {activeTab === 'CONTENT' && (
             <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                 <ServiceEditor /> 
             </div>
         )}
      </div>
    </div>
  );
}