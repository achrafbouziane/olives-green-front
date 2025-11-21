import { useQuotes, useUpdateQuoteStatus } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import {
  Calendar,
  User,
  AlertCircle,
  Check,
  X,
  Clock,
  DollarSign,
  Send,
} from 'lucide-react';
import { QuoteStatus } from '@olives-green/shared-types';
import { Link } from 'react-router-dom'; // Import Link


export function QuoteList() {
  const { quotes, isLoading, error, refetch } = useQuotes();
  const { updateStatus, isLoading: isUpdating } = useUpdateQuoteStatus();

  // Helper to handle quick status updates
  const handleAction = async (id: string, action: QuoteStatus) => {
    if (isUpdating) return;
    const success = await updateStatus(id, action);
    if (success) refetch();
  };

  if (isLoading)
    return (
      <div className="p-10 text-center text-slate-500">Loading quotes...</div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2">
        <AlertCircle /> {error}
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quote Management</h1>
        <Button variant="outline" onClick={refetch}>
          Refresh Data
        </Button>
      </div>

      <Card className="overflow-hidden p-0 border-0 shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Client
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Date
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No quotes found.
                </td>
              </tr>
            ) : (
              quotes.map((quote) => {
                return (
                  <tr
                    key={quote.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="p-4">
                      <BadgeStatus status={quote.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                          <User size={16} />
                        </div>
                        <div>
                          {/* In real app, fetch Customer Name using ID */}
                          <p className="font-medium text-slate-900">Customer</p>
                          <p className="text-xs text-slate-500 font-mono">
                            {quote.customerId.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-800">
                        {quote.title}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-slate-700">
                      ${quote.totalAmount}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <Link to={`/quotes/${quote.id}`}>
                        <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium px-3 py-1 rounded hover:bg-emerald-50 transition-colors">
                          Review / Edit
                        </button>
                      </Link>
                    </td>

                    <td className="p-4">
                      {/* ACTION BUTTONS BASED ON STATUS */}
                      {quote.status === 'REQUESTED' && (
                        <Button
                          variant="primary"
                          className="py-1 px-3 text-xs h-8"
                          // In real app, this opens a modal to Set Price -> Then Sends Estimate
                          onClick={() => alert("Open 'Send Estimate' Modal")}
                        >
                          <Send size={14} className="mr-1" /> Send Estimate
                        </Button>
                      )}

                      {quote.status === 'ESTIMATE_SENT' && (
                        <span className="text-xs text-orange-500 font-medium flex items-center gap-1">
                          <Clock size={14} /> Awaiting Approval
                        </span>
                      )}

                      {quote.status === 'DEPOSIT_PAID' && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <Check size={14} /> Job Created
                        </span>
                      )}

                      {quote.status === 'REJECTED' && (
                        <span className="text-xs text-red-400">Declined</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// Helper Component for Status Badges
function BadgeStatus({ status }: { status: QuoteStatus }) {
  const styles = {
    REQUESTED: 'bg-blue-100 text-blue-700 border-blue-200',
    ESTIMATE_SENT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    DEPOSIT_PAID: 'bg-purple-100 text-purple-700 border-purple-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
  };

  const labels = {
    REQUESTED: 'New Request',
    ESTIMATE_SENT: 'Estimate Sent',
    APPROVED: 'Approved',
    DEPOSIT_PAID: 'Deposit Paid',
    REJECTED: 'Rejected',
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
        styles[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}
