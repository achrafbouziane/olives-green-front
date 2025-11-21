import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiClient, usePayment } from '@olives-green/data-access';
import { QuoteDTO } from '@olives-green/shared-types';
import { CheckCircle, XCircle, FileText, Loader2, ShieldCheck, AlertTriangle, Printer, Download } from 'lucide-react';
import { Button, Card } from '@olives-green/shared-ui';
import { useReactToPrint } from 'react-to-print';

// REPLACE WITH YOUR STRIPE PUBLISHABLE KEY
const stripePromise = loadStripe('pk_test_51SVVzlLyHibnAGj8ddjsCUyzyr7KTFaGVwWM4vMPPfcR0dZkpdRnTESpY8CybO3aniWCFaqzWXVgJ5txqreGqHKa000XP6Y7vM'); 

// --- SUB-COMPONENT: The Payment Form ---
function CheckoutForm({ quoteId, token, amount, fee, onSuccess }: { quoteId: string, token: string, amount: number, fee: number, onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    // 1. Confirm Payment with Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', 
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // 2. Notify Backend (Job Service) that deposit is paid
      try {
        await apiClient.post(`/job-service/api/v1/quotes/${quoteId}/pay-deposit?token=${token}&amount=${amount}`);
        onSuccess();
      } catch (err) {
        setErrorMessage("Payment succeeded but system update failed. Please contact support.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
          <AlertTriangle size={16} /> {errorMessage}
        </div>
      )}
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full py-4 text-lg shadow-lg shadow-emerald-200">
        {isProcessing ? 'Processing...' : `Pay $${(amount + fee).toFixed(2)}`}
      </Button>
      <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
        <ShieldCheck size={12} /> Payments secured by Stripe
      </div>
    </form>
  );
}

// --- MAIN PAGE ---
export function EstimateApprovalPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { createPaymentIntent } = usePayment();

  const [quote, setQuote] = useState<QuoteDTO | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'paid' | 'error'>('loading');
  
  // PDF Print Ref
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Estimate-${id}`,
  });

  const depositAmount = quote ? quote.totalAmount * 0.5 : 0;
  const processingFee = depositAmount * 0.03; 
  const totalCharge = depositAmount + processingFee;

  useEffect(() => {
    if (!id || !token) {
        setStatus('error');
        return;
    }
    
    apiClient.get<QuoteDTO>(`/job-service/api/v1/quotes/${id}`)
      .then(res => {
        setQuote(res.data);
        setStatus(res.data.status === 'DEPOSIT_PAID' || res.data.status === 'APPROVED' ? 'paid' : 'ready');
      })
      .catch(() => setStatus('error'));
  }, [id, token]);

  const initPayment = async () => {
    if (!quote) return;
    await apiClient.post(`/job-service/api/v1/quotes/${id}/approve-estimate?token=${token}`);
    const res = await createPaymentIntent({ quoteId: quote.id, amount: depositAmount, currency: 'usd' });
    if (res?.clientSecret) setClientSecret(res.clientSecret);
  };

  const handleReject = async () => {
    if (!quote) return;
    if (window.confirm("Reject this estimate?")) {
        await apiClient.post(`/job-service/api/v1/quotes/${id}/reject`);
        window.location.href = "/";
    }
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={40}/></div>;
  if (status === 'error' || !quote) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold text-xl">Invalid Link</div>;

  if (status === 'paid') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl max-w-lg w-full border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-600 mb-6">Your deposit has been received. A job has been created.</p>
          <a href="/" className="text-emerald-600 hover:underline font-medium">Return to Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-end mb-6 print:hidden">
           <button onClick={() => handlePrint()} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all">
             <Printer size={18} /> Print / Download PDF
           </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT: INVOICE (PRINTABLE) */}
          <div className="space-y-6">
            <div ref={componentRef} className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none">
               <div className="flex justify-between items-start mb-10 border-b border-slate-100 pb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="bg-emerald-600 p-1.5 rounded"><FileText className="text-white w-4 h-4" /></div>
                       <span className="font-bold text-xl text-slate-800">OlivesGreen</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mt-4">Estimate</h1>
                    <p className="text-slate-500 text-sm mt-1">Quote #{quote.id.substring(0, 8)}</p>
                  </div>
                  <div className="text-right text-sm text-slate-500">
                    <p className="font-bold text-slate-700">Date Issued</p>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
               </div>
               
               <div className="space-y-6 mb-10">
                 {quote.lineItems.map((item, idx) => (
                   <div key={idx} className="flex justify-between py-4 border-b border-slate-50 last:border-0">
                     <div className="pr-8">
                       <p className="font-bold text-slate-800 text-lg mb-1">{item.description.split('\n')[0]}</p>
                       <p className="text-sm text-slate-500 whitespace-pre-line">{item.description.split('\n').slice(1).join('\n')}</p>
                       <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">Quantity: {item.quantity}</p>
                     </div>
                     <p className="font-bold text-slate-900 text-xl">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                   </div>
                 ))}
               </div>

               <div className="bg-slate-50 p-6 rounded-xl">
                 <div className="flex justify-between mb-3 text-slate-600"><span>Subtotal</span> <span>${quote.totalAmount.toFixed(2)}</span></div>
                 <div className="flex justify-between mb-3 text-slate-600"><span>Deposit Due (50%)</span> <span>${depositAmount.toFixed(2)}</span></div>
                 <div className="flex justify-between mb-4 text-slate-500 text-sm"><span>Processing Fee (3%)</span> <span>${processingFee.toFixed(2)}</span></div>
                 <div className="flex justify-between text-2xl font-extrabold text-slate-900 pt-4 border-t border-slate-200">
                   <span>Total Due Now</span>
                   <span className="text-emerald-600">${totalCharge.toFixed(2)}</span>
                 </div>
               </div>

               {/* MOCKUPS SECTION (Printed) */}
               {quote.mockupImageUrls && quote.mockupImageUrls.length > 0 && (
                <div className="mt-10 pt-10 border-t border-slate-100 print:break-before-page">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Project Visuals</h3>
                   <div className="grid grid-cols-1 gap-6">
                      {quote.mockupImageUrls.map((url, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                           <img src={url} alt="Mockup" className="w-full h-auto" />
                        </div>
                      ))}
                   </div>
                </div>
               )}
               
               <div className="mt-12 text-center text-xs text-slate-400 pt-8 border-t border-slate-100">
                 Thank you for choosing OlivesGreen Services.
               </div>
            </div>
          </div>

          {/* RIGHT: PAYMENT (Not Printed) */}
          <div className="print:hidden space-y-6">
             <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 sticky top-6">
               <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                 <ShieldCheck className="text-emerald-500"/> Secure Payment
               </h2>
               
               {!clientSecret ? (
                 <div className="text-center py-8">
                   <p className="text-slate-600 mb-8">Review the estimate on the left. When ready, click below to pay the deposit securely.</p>
                   <Button onClick={initPayment} className="w-full py-4 text-lg shadow-lg shadow-emerald-100 hover:-translate-y-1 transition-all">
                     Approve & Pay ${totalCharge.toFixed(2)}
                   </Button>
                 </div>
               ) : (
                 <Elements stripe={stripePromise} options={{ clientSecret }}>
                   <CheckoutForm 
                     quoteId={quote.id} 
                     token={token || ''} 
                     amount={depositAmount} 
                     fee={processingFee} 
                     onSuccess={() => {
                        setStatus('paid');
                        setQuote({ ...quote, status: 'DEPOSIT_PAID' });
                     }} 
                   />
                 </Elements>
               )}
             </div>
             
             {!clientSecret && (
                <button onClick={handleReject} className="w-full py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium">
                  Reject Estimate
                </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}