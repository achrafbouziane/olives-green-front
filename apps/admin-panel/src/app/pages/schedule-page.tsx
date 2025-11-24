import { useState } from 'react';
import { useJobs, useServices } from '@olives-green/data-access';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, parseISO
} from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, User, Briefcase
} from 'lucide-react';

interface SchedulePageProps {
  serviceFilter?: string;
}

type ViewMode = 'MONTH' | 'WEEK';

export function SchedulePage({ serviceFilter }: SchedulePageProps) {
  const { jobs, isLoading } = useJobs();
  const { services } = useServices();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [hoveredJob, setHoveredJob] = useState<{ id: string, x: number, y: number } | null>(null);

  // --- AUTH CONTEXT ---
  const userRole = localStorage.getItem('user_role');
  const userId = localStorage.getItem('user_id');

  // --- CALENDAR MATH ---
  let calendarDays: Date[] = [];
  if (viewMode === 'MONTH') {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    let day = startDate;
    while (day <= endDate) { calendarDays.push(day); day = addDays(day, 1); }
  } else {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    calendarDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  }

  // --- FILTERING ---
  const getServiceType = (title: string) => {
    if (!title) return 'Other';
    const lowerTitle = title.toLowerCase();
    const found = services.find(s => lowerTitle.includes(s.title.toLowerCase()));
    return found ? found.title : 'Other';
  };

  const filteredJobs = jobs.filter(j => {
    // 1. Security Filter: Employees see ONLY their jobs
    if (userRole === 'EMPLOYEE') {
        if (!userId || j.assignedEmployeeId !== userId) return false;
    }

    // 2. Service Filter
    if (serviceFilter) {
        const type = getServiceType(j.title);
        return type === serviceFilter || (j.title || '').toLowerCase().includes(serviceFilter.toLowerCase());
    }
    return true;
  });

  const getJobsForDay = (date: Date) => {
    return filteredJobs.filter(j => {
        if (!j.scheduledDate) return false;
        const jobDate = typeof j.scheduledDate === 'string' ? parseISO(j.scheduledDate) : j.scheduledDate;
        return isSameDay(jobDate, date);
    });
  };

  // --- TOOLTIP ---
  const handleMouseEnter = (e: React.MouseEvent, jobId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipWidth = 320; 
    const tooltipHeight = 250; 
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let x = rect.right + 10;
    if (x + tooltipWidth > screenWidth) x = rect.left - tooltipWidth - 10;
    let y = rect.top;
    if (y + tooltipHeight > screenHeight) y = screenHeight - tooltipHeight - 20;

    setHoveredJob({ id: jobId, x, y });
  };

  const handleMouseLeave = () => setHoveredJob(null);
  const activeTooltipJob = hoveredJob ? jobs.find(j => j.id === hoveredJob.id) : null;

  // --- NAVIGATION ---
  const next = () => setCurrentDate(viewMode === 'MONTH' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1));
  const prev = () => setCurrentDate(viewMode === 'MONTH' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.valueAsDate) setCurrentDate(e.target.valueAsDate); };

  if (isLoading) return <div className="w-full h-96 flex items-center justify-center text-slate-400">Loading Schedule...</div>;

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)] relative">
       
       {/* Tooltip */}
       {activeTooltipJob && hoveredJob && (
         <div className="fixed z-50 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 pointer-events-none" style={{ top: hoveredJob.y, left: hoveredJob.x }}>
            <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
               <h4 className="font-bold text-slate-800 text-sm leading-tight">{activeTooltipJob.clientName}</h4>
               <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-slate-100 border border-slate-200 text-slate-600">{activeTooltipJob.status}</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
               <div className="flex items-start gap-2"><Briefcase size={14} className="text-slate-400 mt-0.5 shrink-0"/><span className="font-medium text-slate-700">{activeTooltipJob.title}</span></div>
               <div className="flex items-center gap-2"><Clock size={14} className="text-slate-400 shrink-0"/><span>{activeTooltipJob.scheduledDate ? format(parseISO(activeTooltipJob.scheduledDate.toString()), 'MMM do, h:mm a') : 'Unscheduled'}</span></div>
               {activeTooltipJob.propertyAddress && <div className="flex items-start gap-2"><MapPin size={14} className="text-slate-400 mt-0.5 shrink-0"/><span className="leading-tight">{activeTooltipJob.propertyAddress}</span></div>}
            </div>
         </div>
       )}

       {/* Header */}
       <div className="p-4 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-center gap-4 bg-white rounded-t-xl sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CalendarIcon size={20} /></div>
              <div>
                  <h2 className="text-xl font-bold text-slate-800 flex gap-2 items-center">{viewMode === 'MONTH' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(calendarDays[0], 'MMM do')}`}</h2>
                  <p className="text-xs text-slate-500 font-medium">{filteredJobs.length} jobs scheduled</p>
              </div>
          </div>

          <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 p-1 rounded-lg">
                 <button onClick={() => setViewMode('MONTH')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'MONTH' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Month</button>
                 <button onClick={() => setViewMode('WEEK')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'WEEK' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Week</button>
              </div>
              <div className="h-6 w-px bg-slate-200"></div>
              <input type="date" className="pl-3 pr-2 py-1.5 border border-slate-200 rounded-md text-sm text-slate-600 outline-none cursor-pointer" onChange={handleDateInput} value={format(currentDate, 'yyyy-MM-dd')} />
              <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                  <button onClick={prev} className="p-1.5 hover:bg-white rounded-md"><ChevronLeft size={18} /></button>
                  <button onClick={goToToday} className="px-3 py-1.5 text-xs font-bold hover:bg-white rounded-md">Today</button>
                  <button onClick={next} className="p-1.5 hover:bg-white rounded-md"><ChevronRight size={18} /></button>
              </div>
          </div>
       </div>
       
       {/* Grid */}
       <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
         <div className="grid grid-cols-7 border-b border-slate-200 bg-white shrink-0">
            {weekDays.map(day => <div key={day} className="py-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">{day}</div>)}
         </div>
         <div className={`grid grid-cols-7 flex-1 overflow-y-auto divide-x divide-y divide-slate-200 bg-slate-100 ${viewMode === 'MONTH' ? 'auto-rows-fr' : 'min-h-full'}`}>
            {calendarDays.map((day) => {
               const isCurrentMonth = isSameMonth(day, currentDate);
               const isTodayDate = isSameDay(day, new Date());
               const dayJobs = getJobsForDay(day);
               const displayJobs = viewMode === 'MONTH' ? dayJobs.slice(0, 4) : dayJobs;
               const remainingJobs = dayJobs.length - displayJobs.length;

               return (
                 <div key={day.toString()} className={`flex flex-col p-1 transition-colors hover:bg-white relative ${viewMode === 'MONTH' ? 'min-h-[100px]' : 'min-h-[200px]'} ${!isCurrentMonth && viewMode === 'MONTH' ? 'bg-slate-50/60 text-slate-300' : 'bg-white'} ${isTodayDate ? 'bg-blue-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1 px-1 pt-1">
                        <span className={`text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-blue-600 text-white' : ''}`}>{format(day, 'd')}</span>
                        {dayJobs.length > 0 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-full border border-emerald-100">{dayJobs.length}</span>}
                    </div>
                    <div className="flex-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar px-0.5 pb-1">
                        {displayJobs.map(job => (
                           <Link key={job.id} to={`/jobs/${job.id}`} onMouseEnter={(e) => handleMouseEnter(e, job.id)} onMouseLeave={handleMouseLeave} className={`group block text-[10px] rounded border transition-all shadow-sm overflow-hidden relative ${job.status === 'COMPLETED' ? 'bg-slate-50 text-slate-400 opacity-70' : 'bg-white text-slate-700 hover:border-blue-400 hover:shadow-md'}`}>
                              <div className={`h-1 w-full ${job.status === 'SCHEDULED' ? 'bg-blue-500' : job.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                              <div className="p-1.5">
                                <div className="font-bold truncate leading-tight">{job.clientName || 'Unknown'}</div>
                                <div className="flex items-center gap-1 text-slate-400 mt-1"><Clock size={8}/><span className="font-mono">{job.scheduledDate ? format(parseISO(job.scheduledDate.toString()), 'h:mm a') : '?'}</span></div>
                              </div>
                           </Link>
                        ))}
                        {remainingJobs > 0 && <div className="text-[10px] text-center text-slate-400 font-medium py-1 bg-slate-50 rounded border border-dashed border-slate-200">+ {remainingJobs} more</div>}
                    </div>
                 </div>
               );
            })}
         </div>
       </div>
    </div>
  );
}