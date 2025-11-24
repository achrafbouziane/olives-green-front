import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJobById, useJobActions, useUsers, useJobs } from '@olives-green/data-access';
import { JobStatus, JobVisitDTO } from '@olives-green/shared-types';
import { Card, Button } from '@olives-green/shared-ui';
import { PhotoManager } from '../components/photo-manager'; // ✅ Import new component

import { 
  ArrowLeft, Calendar, MapPin, User, Clock, Save, Users, 
  FileCheck, ExternalLink, Play, CheckSquare, LogOut, CheckCircle, FileText, AlertTriangle, Lock
} from 'lucide-react';
import { format } from 'date-fns';

export function JobDetail() {
  const { id } = useParams();
  const { job, isLoading, refetch } = useJobById(id);
  const { scheduleJob, updateStatus, checkIn, updateVisit, isProcessing } = useJobActions();
  const { users } = useUsers(); 
  const { jobs: allJobs } = useJobs(); 
  
  const userRole = localStorage.getItem('user_role') || 'EMPLOYEE';
  const isAdmin = userRole === 'ADMIN';

  // --- STATE ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(''); 
  
  const [activeVisit, setActiveVisit] = useState<JobVisitDTO | null>(null);
  const [visitNotes, setVisitNotes] = useState('');
  const [visitTasks, setVisitTasks] = useState<string>(''); 
  
  // ✅ UPDATED: Now using Array for Photos
  const [visitPhotos, setVisitPhotos] = useState<string[]>([]); 

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'LOGS'>('DETAILS');

  // --- LOAD DATA ---
  useEffect(() => {
    if (job) {
      if (job.scheduledDate) {
         const justDate = job.scheduledDate.toString().split('T')[0];
         setStartDate(justDate); 
         setEndDate(justDate);   
      }
      if (job.assignedEmployeeId) setSelectedEmployeeId(job.assignedEmployeeId);

      if (job.visits && job.visits.length > 0) {
          const sortedVisits = [...job.visits].sort((a,b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
          const latest = sortedVisits[0];

          if (!latest.checkOutTime) {
              setActiveVisit(latest);
              setVisitNotes(latest.notes || '');
              setVisitTasks(latest.tasksCompleted?.join(', ') || '');
              // ✅ LOAD ARRAY DIRECTLY
              setVisitPhotos(latest.afterPhotoUrls || []);
              if (activeTab !== 'LOGS') setActiveTab('LOGS');
          }
      }
    }
  }, [job]);

  const getAvailableUsers = () => {
    if (!startDate) return users;
    const s = new Date(startDate);
    const busyIds = allJobs.filter(j => {
        if (j.id === job?.id || j.status === 'COMPLETED' || j.status === 'INVOICED') return false;
        if (!j.scheduledDate || !j.assignedEmployeeId) return false;
        const jDate = new Date(j.scheduledDate.toString().split('T')[0]);
        return jDate.getTime() === s.getTime();
    }).map(j => j.assignedEmployeeId);
    return users.filter(u => !busyIds.includes(u.id));
  };
  const availableUsers = getAvailableUsers();

  // --- ACTIONS ---
  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job || !isAdmin) return;
    if (newStatus === 'COMPLETED' && job.status !== 'IN_PROGRESS') {
        if(!window.confirm(`You are marking this job as COMPLETED, but it is currently ${job.status}. Continue?`)) return;
    }
    try {
        const success = await updateStatus(job.id, newStatus);
        if (success) await refetch();
        else alert("Failed to update status.");
    } catch (error) { console.error(error); }
  };

  const handleScheduleSave = async () => {
    if (!job || !isAdmin) return;
    const isoStartTime = `${startDate}T09:00:00`; 
    const isoEndTime = `${endDate || startDate}T17:00:00`;

    const success = await scheduleJob(job.id, {
      jobId: job.id,
      assignedEmployeeId: selectedEmployeeId,
      startTime: isoStartTime, 
      endTime: isoEndTime,     
      notes: "Updated via Admin Panel"
    });
    if (success) {
        if (job.status === 'PENDING') await updateStatus(job.id, 'SCHEDULED');
        await refetch();
        alert('Schedule Updated Successfully!');
    }
  };

  const handleCheckIn = async () => {
      if (!job || !selectedEmployeeId) {
          alert("Please assign an employee first.");
          return;
      }
      if (await checkIn(job.id, selectedEmployeeId)) {
          await refetch();
          alert("Checked In!");
      }
  };

  const handleUpdateVisit = async (isCheckout = false) => {
      if (!activeVisit) return;
      const success = await updateVisit(activeVisit.id, {
          notes: visitNotes,
          tasks: visitTasks.split(',').map(t => t.trim()).filter(Boolean),
          // ✅ PASS ARRAY DIRECTLY
          afterPhotos: visitPhotos, 
          endTime: isCheckout ? new Date().toISOString() : undefined
      });
      if (success) {
          await refetch();
          if (isCheckout) {
              setActiveVisit(null); 
              alert("Checked out successfully!");
              if (job?.status === 'IN_PROGRESS') {
                  if (window.confirm("Job finished? Mark as COMPLETED now?")) {
                      handleStatusChange('COMPLETED');
                  }
              }
          } else {
              alert("Log updated.");
          }
      }
  };

  // --- SMART ACTION BUTTON ---
  const renderMainAction = () => {
      if (!isAdmin) return null;
      if (isProcessing) return <Button disabled className="bg-slate-300 text-white">Processing...</Button>;

      switch(job?.status) {
          case 'PENDING':
              return (
                <Button onClick={() => handleStatusChange('SCHEDULED')} disabled={!startDate || !selectedEmployeeId} className="bg-purple-600 text-white shadow-md hover:bg-purple-700">
                    <Calendar size={16} className="mr-2"/> {startDate ? 'Confirm & Schedule' : 'Set Date to Proceed'}
                </Button>
              );
          case 'SCHEDULED':
              return (
                <Button onClick={() => handleStatusChange('IN_PROGRESS')} className="bg-blue-600 text-white shadow-md hover:bg-blue-700">
                    <Play size={16} className="mr-2"/> Force Start Job
                </Button>
              );
          case 'IN_PROGRESS':
              return (
                <Button onClick={() => handleStatusChange('COMPLETED')} className="bg-emerald-600 text-white shadow-md hover:bg-emerald-700">
                    <CheckCircle size={16} className="mr-2"/> Mark Completed
                </Button>
              );
          case 'COMPLETED':
              return (
                <Button onClick={() => handleStatusChange('INVOICED')} variant="secondary" className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                    <FileText size={16} className="mr-2"/> Finalize / Invoice
                </Button>
              );
          default: return null;
      }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!job) return <div className="p-10 text-center text-red-500">Job not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
       <Link to="/jobs" className="flex items-center text-slate-500 mb-6 hover:text-emerald-600 transition-colors">
         <ArrowLeft size={16} className="mr-2" /> Back to Jobs
       </Link>

       {/* HEADER */}
       <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                <span className={`px-3 py-1 rounded-full font-bold text-xs border uppercase tracking-wide
                    ${job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse' : 
                    job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {job.status.replace('_', ' ')}
                </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                <span>ID: {job.id}</span>
                {!isAdmin && <span className="flex items-center gap-1 text-amber-600"><Lock size={10}/> Employee View</span>}
            </div>
         </div>
         <div className="flex items-center gap-3">{renderMainAction()}</div>
       </div>

       {/* TABS */}
       <div className="flex gap-6 border-b border-slate-200 mb-6 px-2">
           <button onClick={() => setActiveTab('DETAILS')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'DETAILS' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Job Details</button>
           <button onClick={() => setActiveTab('LOGS')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'LOGS' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Daily Logs ({job.visits?.length || 0})</button>
       </div>

       {/* --- TAB: JOB DETAILS --- */}
       {activeTab === 'DETAILS' && (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-6">
                <Card>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={18}/> Client Info</h3>
                    <div className="space-y-4">
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Name</label><p className="font-medium text-lg text-slate-800">{job.clientName}</p></div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Service Address</label>
                            <div className="mt-1 bg-slate-50 p-3 rounded border border-slate-100 text-sm">
                                <div className="flex gap-2 items-start"><MapPin size={16} className="text-emerald-600 shrink-0 mt-0.5"/><span className="leading-snug">{job.propertyAddress || "No address available"}</span></div>
                                {job.propertyAddress && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.propertyAddress)}`} target="_blank" className="text-xs text-blue-600 font-bold block mt-2 ml-6 hover:underline">View on Map <ExternalLink size={10} className="inline"/></a>}
                            </div>
                        </div>
                    </div>
                </Card>
                <Card><h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileCheck size={18}/> Origin</h3><p className="text-xs text-slate-500 mb-3">Based on Quote #{job.quoteId.substring(0,8)}</p><Link to={`/quotes/${job.quoteId}`}><Button variant="outline" className="w-full text-xs">View Original Quote</Button></Link></Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                <Card className={job.status === 'COMPLETED' ? 'opacity-80' : ''}>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Calendar size={20} className="text-blue-600"/> Scheduling</h3>
                        {job.scheduledDate && !isAdmin && <span className="text-xs bg-slate-100 px-2 py-1 rounded flex items-center gap-1"><Lock size={10}/> Read Only</span>}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Job Date</label>
                            <input type="date" className="w-full p-2.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50" value={startDate} onChange={(e) => { setStartDate(e.target.value); setEndDate(e.target.value); }} disabled={!isAdmin} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Assigned Team</label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-3 text-slate-400" />
                                <select className="w-full pl-10 p-2.5 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50" value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} disabled={!isAdmin}>
                                    <option value="">-- Select Team --</option>
                                    {availableUsers.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                                    {selectedEmployeeId && !availableUsers.find(u => u.id === selectedEmployeeId) && <option value={selectedEmployeeId} disabled>Current (Busy)</option>}
                                </select>
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex justify-end pt-2">
                            <Button onClick={handleScheduleSave} disabled={isProcessing || !startDate || !selectedEmployeeId} className="px-6"><Save size={16} className="mr-2"/> Update Schedule</Button>
                        </div>
                    )}
                </Card>
                
                {/* ADMIN OVERRIDE */}
                {isAdmin && (
                    <Card className="border-dashed border-slate-300 bg-slate-50/50">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-600 flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-amber-500"/> Admin Override</h3></div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {['PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED'].map((status) => (
                                <button key={status} onClick={() => handleStatusChange(status as JobStatus)} disabled={job.status === status || isProcessing} className={`py-2 px-1 rounded border text-[10px] font-bold transition-all ${job.status === status ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}>{status.replace('_', ' ')}</button>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </div>
       )}

       {/* --- TAB: DAILY LOGS --- */}
       {activeTab === 'LOGS' && (
           <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in">
               <div>
                   <h3 className="font-bold text-slate-700 mb-4">Today's Activity</h3>
                   {activeVisit ? (
                       <Card className="border-l-4 border-l-blue-500 shadow-sm">
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1"><Play size={10} className="fill-current"/> In Progress</div>
                                   <div className="text-sm text-slate-500">Checked in at: {format(new Date(activeVisit.checkInTime), 'h:mm a')}</div>
                               </div>
                               <Button onClick={() => handleUpdateVisit(true)} variant="danger" className="text-xs h-8"><LogOut size={14} className="mr-1"/> Check Out</Button>
                           </div>

                           <div className="space-y-4">
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 mb-1">Daily Notes</label>
                                   <textarea className="w-full p-3 border rounded-md text-sm h-24 focus:ring-2 focus:ring-blue-500" placeholder="Describe work done..." value={visitNotes} onChange={e => setVisitNotes(e.target.value)}/>
                               </div>
                               <div>
                                   <label className="block text-xs font-bold text-slate-500 mb-1">Tasks (comma separated)</label>
                                   <div className="relative"><CheckSquare size={16} className="absolute left-3 top-2.5 text-slate-400"/><input className="w-full pl-9 p-2 border rounded-md text-sm" placeholder="Mowed lawn, Cleaned up..." value={visitTasks} onChange={e => setVisitTasks(e.target.value)} /></div>
                               </div>
                               
                               {/* ✅ NEW PHOTO MANAGER COMPONENT */}
                               <PhotoManager 
                                  photos={visitPhotos} 
                                  onChange={setVisitPhotos} 
                                  readOnly={false}
                               />

                               <Button onClick={() => handleUpdateVisit(false)} className="w-full mt-2" disabled={isProcessing}>Save Log Entry</Button>
                           </div>
                       </Card>
                   ) : (
                       <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
                           <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3 text-slate-400"><Clock size={24}/></div>
                           <p className="text-slate-500 font-medium">No active visit.</p>
                           {(job.status === 'SCHEDULED' || job.status === 'IN_PROGRESS') ? (
                                <>
                                    <p className="text-xs text-slate-400 mb-4">Start the timer when you arrive at the job site.</p>
                                    <Button onClick={handleCheckIn} disabled={!selectedEmployeeId || isProcessing} variant="primary" className="text-xs"><Play size={14} className="mr-2"/> Start Work</Button>
                                </>
                           ) : (
                                <p className="text-xs text-red-400 mt-2">Job must be Scheduled or In Progress to check in.</p>
                           )}
                       </div>
                   )}
               </div>
               <div>
                   <h3 className="font-bold text-slate-700 mb-4">Visit History</h3>
                   <div className="space-y-3">
                       {job.visits && job.visits.length > 0 ? (
                           [...job.visits].sort((a,b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()).map((visit) => (
                               <div key={visit.id} className="bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
                                   <div className="flex justify-between mb-2">
                                       <span className="font-bold text-sm text-slate-800">{format(new Date(visit.checkInTime), 'MMM dd, yyyy')}</span>
                                       <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                                           {format(new Date(visit.checkInTime), 'h:mm a')} - {visit.checkOutTime ? format(new Date(visit.checkOutTime), 'h:mm a') : 'Active'}
                                       </span>
                                   </div>
                                   {visit.notes && <p className="text-sm text-slate-600 mb-2 italic pl-2 border-l-2 border-slate-200">"{visit.notes}"</p>}
                                   {visit.tasksCompleted && visit.tasksCompleted.length > 0 && (
                                       <div className="flex flex-wrap gap-2 mb-2">
                                           {visit.tasksCompleted.map((t, i) => <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">{t}</span>)}
                                       </div>
                                   )}
                                   {/* VIEW PHOTOS IN HISTORY */}
{visit.afterPhotoUrls && visit.afterPhotoUrls.length > 0 && (
                                      <div className="mt-3 pt-3 border-t border-slate-50">
                                          <PhotoManager 
                                            photos={visit.afterPhotoUrls} 
                                            onChange={() => {}} 
                                            readOnly={true} 
                                          />
                                      </div>
                                   )}
                               </div>
                           ))
                       ) : (
                           <p className="text-sm text-slate-400 italic p-4 border border-slate-100 rounded bg-slate-50">No past visits recorded.</p>
                       )}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}