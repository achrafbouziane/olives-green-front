import { useQuotes, useUpdateQuoteStatus } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import {
  AlertCircle,
  Check,
  Send,
  FileText,
  Plus,
  ExternalLink
} from 'lucide-react';
import { QuoteStatus } from '@olives-green/shared-types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Props to make this list reusable in Service Dashboards
interface QuoteListProps {
  serviceFilter?: string;
}

export function QuoteList({ serviceFilter }: QuoteListProps) {
  const { quotes, isLoading, error, refetch } = useQuotes();
  const { updateStatus, isLoading: isUpdating } = useUpdateQuoteStatus();

  const handleAction = async (id: string, action: QuoteStatus) => {
    if (isUpdating) return;
    const success = await updateStatus(id, action);
    if (success) refetch();
  };

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading quotes...</div>;
  if (error) return <div className="p-10 text-center text-red-500"><AlertCircle /> {error}</div>;

  // Filter Logic: If serviceFilter is passed, show only matching quotes
  const filteredQuotes = serviceFilter 
    ? quotes.filter(q => q.title.toLowerCase().includes(serviceFilter.toLowerCase())) 
    : quotes;

  if (filteredQuotes.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
         {/* Header is still visible so you can create the first quote */}
         {!serviceFilter && <ListHeader />} 
         
         <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 mt-6">
            <div className="mx-auto w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-3">
              <FileText className="text-slate-400" />
            </div>
            <h3 className="text-slate-600 font-bold">No Quotes Found</h3>
            <p className="text-slate-400 text-sm">There are no requests available.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Only show Main Header if NOT inside a Dashboard (standalone page) */}
      {!serviceFilter && <ListHeader />}

      <Card className="p-0 overflow-hidden shadow-sm border-0">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Customer / Request</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredQuotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{quote.title}</div>
                  <div className="text-xs text-slate-500">
                    Created {quote.createdAt ? format(new Date(quote.createdAt), 'MMM dd') : 'Recently'}
                  </div>
                </td>
                <td className="p-4">
                  <BadgeStatus status={quote.status} />
                </td>
                <td className="p-4 font-mono text-sm text-slate-700">
                  ${(quote.totalAmount || 0).toLocaleString()}
                </td>
                <td className="p-4 flex items-center gap-2">
                  <Link to={`/quotes/${quote.id}`}>
                    <Button variant="secondary" className="h-8 px-3 text-xs">Manage</Button>
                  </Link>
                  
                  {/* Quick Action: Mark as Sent */}
                  {quote.status === 'REQUESTED' && (
                     <button 
                       onClick={() => handleAction(quote.id, 'ESTIMATE_SENT')} 
                       className="h-8 w-8 flex items-center justify-center rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" 
                       title="Mark Estimate Sent"
                     >
                       <Send size={14}/>
                     </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// Extracted Header Component
function ListHeader() {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quote Requests</h1>
        <Link to="/quotes/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" /> New Manual Quote
          </Button>
        </Link>
      </div>
    );
}

function BadgeStatus({ status }: { status: QuoteStatus }) {
  const styles: Record<string, string> = {
    REQUESTED: 'bg-blue-100 text-blue-700',
    ESTIMATE_SENT: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    DEPOSIT_PAID: 'bg-purple-100 text-purple-700',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}