import { useState } from 'react';
import { useJobs } from '@olives-green/data-access';
import { format, isSameDay, addDays, startOfWeek, addWeeks, subWeeks, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

interface SchedulePageProps {
  serviceFilter?: string;
}

export function SchedulePage({ serviceFilter }: SchedulePageProps) {
  // Using the real hook from your library
  const { jobs, isLoading } = useJobs();
  
  // State to manage the currently viewed week
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate the start of the week based on the current reference date
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Navigation Handlers
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter jobs based on service type
  const filteredJobs = serviceFilter 
    ? jobs.filter(j => j.title.toLowerCase().includes(serviceFilter.toLowerCase()))
    : jobs;

  const getJobsForDay = (date: Date) => {
    return filteredJobs.filter(j => 
      j.scheduledStartDate && isSameDay(new Date(j.scheduledStartDate), date)
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
       
       {/* --- Header & Controls --- */}
       <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white sticky top-0 z-10">
          <div>
              {/* Only show large title if standalone (no filter) */}
              {!serviceFilter && (
                  <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                      <CalendarIcon className="text-emerald-600" size={24}/> Schedule
                  </h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-lg font-semibold text-slate-700">
                    {format(weekStart, 'MMMM yyyy')}
                  </h2>
                  <span className="text-slate-400 text-sm hidden md:inline">
                    (Week of {format(weekStart, 'MMM do')})
                  </span>
              </div>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
              <button onClick={prevWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all" title="Previous Week">
                  <ChevronLeft size={20} />
              </button>
              <button onClick={goToToday} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  Today
              </button>
              <button onClick={nextWeek} className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all" title="Next Week">
                  <ChevronRight size={20} />
              </button>
          </div>
       </div>
       
       {/* --- Calendar Grid --- */}
       <div className="flex-1 overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-7 min-h-full divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50">
           {days.map((day) => {
             const isCurrentDay = isSameDay(day, new Date()); // Real "Today"
             const dayJobs = getJobsForDay(day);
             
             return (
               <div key={day.toString()} className={`flex flex-col min-h-[200px] md:min-h-0 transition-colors ${isCurrentDay ? 'bg-blue-50/50' : 'bg-white'}`}>
                  
                  {/* Day Header */}
                  <div className={`p-3 text-center border-b border-slate-100 sticky top-0 bg-inherit z-10 ${isCurrentDay ? 'bg-blue-100/50' : ''}`}>
                     <div className={`text-xs font-bold uppercase tracking-wider ${isCurrentDay ? 'text-blue-600' : 'text-slate-400'}`}>
                         {format(day, 'EEE')}
                     </div>
                     <div className={`text-xl font-bold mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isCurrentDay ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'}`}>
                         {format(day, 'dd')}
                     </div>
                  </div>
                  
                  {/* Jobs List for the Day */}
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                     {dayJobs.length > 0 ? (
                         dayJobs.map(job => (
                           <Link 
                              key={job.id} 
                              to={`/jobs/${job.id}`} 
                              className="group block p-3 bg-white rounded-lg shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-200"
                           >
                              <div className="flex items-start justify-between mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-slate-600 bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 border border-slate-200 group-hover:border-emerald-200`}>
                                      {job.status === 'SCHEDULED' ? 'Scheduled' : job.status}
                                  </span>
                              </div>
                              <div className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover:text-emerald-700 transition-colors truncate">
                                  {job.clientName || 'Unknown Client'}
                              </div>
                              <div className="text-xs text-slate-500 mb-2 line-clamp-2 flex items-start gap-1">
                                  <Briefcase size={12} className="mt-0.5 shrink-0" /> 
                                  {job.title}
                              </div>
                              
                              <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                                  <div className="flex items-center gap-1">
                                      <Clock size={12} /> 
                                      <span className="font-mono">
                                        {job.scheduledStartDate ? format(new Date(job.scheduledStartDate), 'h:mm a') : 'All Day'}
                                      </span>
                                  </div>
                                  {/* Optional: Show assigned employee avatar or icon here if data exists */}
                                  <User size={12} />
                              </div>
                           </Link>
                         ))
                     ) : (
                         // Empty State for the day
                         <div className="h-32 flex flex-col items-center justify-center text-slate-300 opacity-40 hover:opacity-100 transition-opacity group cursor-default">
                             <div className="w-8 h-8 border-2 border-slate-200 rounded-full flex items-center justify-center mb-1 group-hover:border-slate-400">
                                 <PlusIcon className="text-slate-400" />
                             </div>
                             <span className="text-[10px] font-medium">Free</span>
                         </div>
                     )}
                  </div>
               </div>
             )
           })}
         </div>
       </div>
    </div>
  );
}

// Helper Icon for Empty State
function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 ${className}`}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    )
}