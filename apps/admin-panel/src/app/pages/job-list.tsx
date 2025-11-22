import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import { Calendar, Hammer, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface JobListProps {
  serviceFilter?: string; // Optional strict filter
}

export function JobList({ serviceFilter }: JobListProps) {
  const { jobs, isLoading } = useJobs();
  // If serviceFilter exists, default to it. Otherwise default to 'ALL'
  const [activeTab, setActiveTab] = useState(serviceFilter || 'ALL');

  // Force update if prop changes
  useEffect(() => {
    if (serviceFilter) setActiveTab(serviceFilter);
  }, [serviceFilter]);

  // Helper to categorize jobs based on Title
  const getServiceType = (title: string) => {
    if (title.toLowerCase().includes('christmas') || title.toLowerCase().includes('light')) return 'Christmas';
    if (title.toLowerCase().includes('landscape') || title.toLowerCase().includes('mowing')) return 'Landscaping';
    return 'Other';
  };

  const filteredJobs = jobs.filter(job => {
    // Strict Prop Filter Strategy
    if (serviceFilter) {
       return job.title.toLowerCase().includes(serviceFilter.toLowerCase());
    }
    // Tab Strategy (Legacy behavior if no prop passed)
    if (activeTab === 'ALL') return true;
    return getServiceType(job.title) === activeTab;
  });

  return (
    <div className="w-full">
      {/* ONLY show tabs if NO serviceFilter is provided (Global Admin View) */}
      {!serviceFilter && (
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          {['ALL', 'Landscaping', 'Christmas'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab ? 'text-emerald-600 border-emerald-600' : 'text-slate-500 border-transparent'
              }`}
            >
              {tab === 'ALL' ? 'All Jobs' : `${tab} Jobs`}
            </button>
          ))}
        </div>
      )}

      <Card className="p-0 overflow-hidden border-0 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Job Title</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Schedule</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredJobs.map((job) => (
              <tr key={job.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{job.title}</div>
                  <div className="text-sm text-slate-500">{job.clientName}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                    job.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600">
                   {job.scheduledStartDate ? (
                     <div className="flex items-center gap-2"><Calendar size={14}/> {format(new Date(job.scheduledStartDate), 'MMM dd')}</div>
                   ) : <span className="text-slate-400 italic">Unscheduled</span>}
                </td>
                <td className="p-4">
                  <Link to={`/jobs/${job.id}`}>
                    <Button variant="secondary" className="text-xs py-1 h-8">Manage</Button>
                  </Link>
                </td>
              </tr>
            ))}
            {filteredJobs.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400">No active jobs found.</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}