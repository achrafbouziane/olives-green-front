import { useState, useMemo } from 'react';
import { useQuotes, useUpdateQuoteStatus } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import { AlertCircle, Send, FileText, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, User } from 'lucide-react';
import { QuoteStatus, QuoteDTO } from '@olives-green/shared-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface QuoteListProps {
  serviceFilter?: string;
  hideControls?: boolean;
}

type SortKey = keyof QuoteDTO | 'clientName';

export function QuoteList({ serviceFilter, hideControls }: QuoteListProps) {
  const { quotes, isLoading, error, refetch } = useQuotes();
  const { updateStatus, isLoading: isUpdating } = useUpdateQuoteStatus();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({ 
    key: 'createdAt', direction: 'desc' 
  });

  // Helper
  const getClientName = (quote: QuoteDTO) => {
    const match = quote.requestDetails?.match(/Client: (.*?)(?:\n|$)/);
    return match ? match[1] : 'Guest User';
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="ml-1 text-slate-300 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="ml-1 text-emerald-600" /> : <ArrowDown size={14} className="ml-1 text-emerald-600" />;
  };

  const processedQuotes = useMemo(() => {
    if (!quotes) return [];
    let data = quotes.filter(q => {
        const title = (q.title || '').toLowerCase();
        const client = getClientName(q).toLowerCase();
        const search = searchQuery.toLowerCase();
        const idString = q.id.toLowerCase();
        
        if (serviceFilter && !title.includes(serviceFilter.toLowerCase())) return false;
        if (searchQuery && !title.includes(search) && !client.includes(search) && !idString.includes(search)) return false;
        if (statusFilter !== 'ALL' && q.status !== statusFilter) return false;

        return true;
    });

    return data.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof QuoteDTO];
        let bValue: any = b[sortConfig.key as keyof QuoteDTO];
        if (sortConfig.key === 'clientName') { aValue = getClientName(a); bValue = getClientName(b); }
        if (!aValue) aValue = ''; if (!bValue) bValue = '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [quotes, serviceFilter, searchQuery, statusFilter, sortConfig]);

  const handleAction = async (id: string, action: QuoteStatus) => {
    if (isUpdating) return;
    const success = await updateStatus(id, action);
    if (success) refetch();
  };

  if (isLoading) return <div className="p-20 text-center text-slate-400">Loading quotes...</div>;

  return (
    <div className="w-full space-y-6">
      {!hideControls && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText size={20}/></div>
              <h1 className="text-lg font-bold text-slate-800">{serviceFilter ? `${serviceFilter} Requests` : 'All Quote Requests'}</h1>
           </div>
           
           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
               <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400"/>
                  <input type="text" placeholder="Search requests..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
               </div>
               <select className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                 <option value="ALL">All Status</option>
                 <option value="REQUESTED">Requested</option>
                 <option value="ESTIMATE_SENT">Sent</option>
                 <option value="APPROVED">Approved</option>
                 <option value="REJECTED">Rejected</option>
               </select>
               {!serviceFilter && (
                  <Link to="/quotes/new">
                    <Button variant="primary" className="whitespace-nowrap py-2.5"><Plus size={18} className="mr-2" /> New Quote</Button>
                  </Link>
               )}
           </div>
        </div>
      )}

      <Card className={`p-0 overflow-hidden border-slate-200 ${hideControls ? 'shadow-none border-0' : 'shadow-sm'}`}>
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('clientName')}>Client <SortIcon column="clientName"/></th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('title')}>Request <SortIcon column="title"/></th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('status')}>Status <SortIcon column="status"/></th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleSort('totalAmount')}>Value <SortIcon column="totalAmount"/></th>
              {!hideControls && <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {processedQuotes.length > 0 ? (
                processedQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                    {getClientName(quote).charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800 text-sm">{getClientName(quote)}</div>
                                    <div className="text-xs text-slate-400 font-mono">#{quote.id.substring(0,6)}</div>
                                </div>
                            </div>
                        </td>
                        <td className="p-4">
                            <div className="text-sm font-medium text-slate-700">{quote.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{quote.createdAt ? format(new Date(quote.createdAt), 'MMM dd, yyyy') : '-'}</div>
                        </td>
                        <td className="p-4"><BadgeStatus status={quote.status} /></td>
                        <td className="p-4 font-mono text-sm font-bold text-slate-700">${(quote.totalAmount || 0).toLocaleString()}</td>
                        {!hideControls && (
                            <td className="p-4 flex justify-end items-center gap-2">
                                <Link to={`/quotes/${quote.id}`}><Button variant="secondary" className="h-8 px-3 text-xs bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700">Review</Button></Link>
                                {quote.status === 'REQUESTED' && (
                                    <button onClick={() => handleAction(quote.id, 'ESTIMATE_SENT')} className="h-8 w-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 shadow-sm transition-all hover:scale-105" title="Mark Sent">
                                        <Send size={14}/>
                                    </button>
                                )}
                            </td>
                        )}
                    </tr>
                ))
            ) : (
                <tr><td colSpan={5} className="p-16 text-center text-slate-400"><FileText size={32} className="mx-auto mb-2 opacity-30"/><p>No quotes found.</p></td></tr>
            )}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

function BadgeStatus({ status }: { status: QuoteStatus }) {
  const styles: Record<string, string> = {
    REQUESTED: 'bg-blue-50 text-blue-700 border-blue-200',
    ESTIMATE_SENT: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DEPOSIT_PAID: 'bg-purple-50 text-purple-700 border-purple-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status] || 'bg-gray-100 border-gray-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}