import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useJobs, useServices } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import { Calendar, Filter, Search, ArrowUpDown, ArrowUp, ArrowDown, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { JobDTO } from '@olives-green/shared-types';

interface JobListProps {
  serviceFilter?: string;
  hideControls?: boolean;
}

type SortKey = keyof JobDTO | 'scheduledDate';

export function JobList({ serviceFilter, hideControls }: JobListProps) {
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { services, isLoading: servicesLoading } = useServices();

  // --- AUTH CONTEXT ---
  const userRole = localStorage.getItem('user_role');
  const userId = localStorage.getItem('user_id'); 

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
    key: 'scheduledDate', direction: 'desc' 
  });

  // --- DYNAMIC SERVICES ---
  const getServiceType = (title: string) => {
    if (!title) return 'Other';
    const lowerTitle = title.toLowerCase();
    const found = services.find(s => lowerTitle.includes(s.title.toLowerCase()));
    return found ? found.title : 'Other';
  };

  const availableTabs = useMemo(() => {
    const types = new Set<string>(['ALL']);
    services.forEach(s => types.add(s.title));
    if (jobs.some(j => getServiceType(j.title) === 'Other')) types.add('Other');
    return Array.from(types);
  }, [services, jobs]);

  useEffect(() => {
    if (serviceFilter) {
        const type = getServiceType(serviceFilter);
        setActiveTab(type !== 'Other' ? type : 'ALL');
    }
  }, [serviceFilter, services]);

  // --- SORTING ---
  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="ml-1 text-slate-300 opacity-50" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} className="ml-1 text-emerald-600" /> 
      : <ArrowDown size={14} className="ml-1 text-emerald-600" />;
  };

  // --- FILTERING ---
  const processedJobs = useMemo(() => {
    let data = jobs.filter(job => {
        // 1. SECURITY CHECK: If Employee, strictly match assigned ID
        if (userRole === 'EMPLOYEE') {
            if (!userId || job.assignedEmployeeId !== userId) return false;
        }

        const jobType = getServiceType(job.title);
        const jobTitle = (job.title || '').toLowerCase();
        const clientName = (job.clientName || '').toLowerCase();
        const filterLower = (serviceFilter || '').toLowerCase();
        const searchLower = searchQuery.toLowerCase();

        let matchesService = true;
        if (serviceFilter) {
           const filterType = getServiceType(serviceFilter);
           matchesService = jobType === filterType || jobTitle.includes(filterLower);
        } else if (activeTab !== 'ALL') {
           matchesService = jobType === activeTab;
        }

        const matchesSearch = jobTitle.includes(searchLower) || clientName.includes(searchLower) || job.id.toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;

        return matchesService && matchesSearch && matchesStatus;
    });

    return data.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [jobs, activeTab, serviceFilter, searchQuery, statusFilter, sortConfig, userRole, userId]);

  const isLoading = jobsLoading || servicesLoading;

  if (isLoading) return <div className="p-20 text-center text-slate-400 flex flex-col items-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>Loading jobs...</div>;

  return (
    <div className="w-full space-y-6">
      
      {/* --- HEADER CONTROLS --- */}
      {!hideControls && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
           <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
              
              {/* TABS */}
              {!serviceFilter ? (
                <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                  <div className="flex gap-2">
                    {availableTabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                          activeTab === tab 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab === 'ALL' ? 'All Jobs' : tab}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                   <Filter size={16} className="text-emerald-600"/>
                   Filtered by: <span className="font-bold text-slate-900">{serviceFilter}</span>
                </div>
              )}

              {/* SEARCH & FILTER */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                 <div className="relative flex-1 sm:w-64">
                    <Search size={16} className="absolute left-3 top-3 text-slate-400"/>
                    <input 
                      type="text" 
                      placeholder="Search by title, client, ID..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
                 <select 
                   className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none"
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                 >
                   <option value="ALL">All Status</option>
                   <option value="PENDING">Pending</option>
                   <option value="SCHEDULED">Scheduled</option>
                   <option value="IN_PROGRESS">In Progress</option>
                   <option value="COMPLETED">Completed</option>
                   <option value="INVOICED">Invoiced</option>
                 </select>
              </div>
           </div>
        </div>
      )}

      {/* --- TABLE CARD --- */}
      <Card className={`p-0 overflow-hidden border-slate-200 ${hideControls ? 'shadow-none border-0' : 'shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => handleSort('title')}>
                   <div className="flex items-center gap-1">Job Details <SortIcon column="title"/></div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => handleSort('status')}>
                   <div className="flex items-center gap-1">Status <SortIcon column="status"/></div>
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors group" onClick={() => handleSort('scheduledDate')}>
                   <div className="flex items-center gap-1">Schedule <SortIcon column="scheduledDate"/></div>
                </th>
                {!hideControls && <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {processedJobs.length > 0 ? (
                  processedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                           <div className="mt-1 p-2 bg-emerald-50 text-emerald-600 rounded-lg hidden sm:block">
                              <Briefcase size={18} />
                           </div>
                           <div>
                              <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                                {job.title || 'Untitled Job'}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500 font-medium">{job.clientName || 'Unknown Client'}</span>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] font-mono text-slate-400">#{job.id.substring(0,8)}</span>
                              </div>
                           </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${
                          job.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          job.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          job.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                             job.status === 'COMPLETED' ? 'bg-emerald-500' : 
                             job.status === 'SCHEDULED' ? 'bg-blue-500' : 
                             job.status === 'IN_PROGRESS' ? 'bg-indigo-500' : 
                             'bg-amber-500'
                          }`}></span>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                         {job.scheduledDate ? (
                           <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar size={16} className="text-slate-400"/> 
                              <span className="font-medium">{format(new Date(job.scheduledDate), 'MMM dd, yyyy')}</span>
                           </div>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-slate-400 bg-slate-100">
                              Unscheduled
                           </span>
                         )}
                      </td>
                      {!hideControls && (
                          <td className="p-4 text-right">
                            <Link to={`/jobs/${job.id}`}>
                              <Button variant="secondary" className="text-xs py-1.5 h-auto border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 bg-white hover:bg-emerald-50">
                                Manage
                              </Button>
                            </Link>
                          </td>
                      )}
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan={4} className="p-16 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Filter size={32} className="opacity-50"/>
                              </div>
                              <h3 className="text-slate-600 font-bold mb-1">No jobs found</h3>
                              <p className="text-sm">
                                {userRole === 'EMPLOYEE' 
                                    ? "No jobs have been assigned to you yet." 
                                    : "No jobs found matching your filters."}
                              </p>
                              {userRole !== 'EMPLOYEE' && <button onClick={() => {setSearchQuery(''); setStatusFilter('ALL');}} className="mt-4 text-emerald-600 text-sm font-bold hover:underline">Clear Filters</button>}
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}