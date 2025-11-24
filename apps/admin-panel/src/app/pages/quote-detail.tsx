import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuoteById, useAdminQuoteActions, useUpdateQuoteStatus, useJobs } from '@olives-green/data-access';
import { CreateQuoteRequest, CreateLineItemRequest, QuoteStatus } from '@olives-green/shared-types';
import { Card, Button } from '@olives-green/shared-ui';
import { PhotoManager } from '../components/photo-manager'; // ✅ Import
import { 
  MapPin, User, Send, Save, ArrowLeft, Plus, Trash2, ExternalLink, 
  Image as ImageIcon, Lock, AlertTriangle, Hammer, CheckCircle, XCircle 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

export function QuoteDetail() {
  const { id } = useParams();
  
  const { quote, isLoading, refetch } = useQuoteById(id);
  const { updateQuotePrice, sendEstimate, isProcessing } = useAdminQuoteActions();
  const { updateStatus } = useUpdateQuoteStatus();
  const { jobs } = useJobs(); 
  
  const [lineItems, setLineItems] = useState<CreateLineItemRequest[]>([]);
  
  // ✅ Use Array State for Photos
  const [mockups, setMockups] = useState<string[]>([]);

  const isEditable = quote?.status === 'REQUESTED' || quote?.status === 'ESTIMATE_SENT';
  const linkedJob = jobs.find(j => j.quoteId === quote?.id);

  const rawDescription = quote?.requestDetails || quote?.lineItems[0]?.description || '';
  const coordsMatch = rawDescription.match(/Coordinates: ([\d.-]+), ([\d.-]+)/);
  const position = coordsMatch ? { lat: parseFloat(coordsMatch[1]), lng: parseFloat(coordsMatch[2]) } : null;
  const locationMatch = rawDescription.match(/Location: (.*?)(?:\n|$)/);
  const displayLocation = locationMatch ? locationMatch[1] : 'Location info not available';
  const clientMatch = rawDescription.match(/Client: (.*?)(?:\n|$)/);
  const displayClient = clientMatch ? clientMatch[1] : 'Guest User';
  const notesMatch = rawDescription.split('Notes: ');
  const displayNotes = notesMatch.length > 1 ? notesMatch[1] : 'No additional notes.';

  useEffect(() => {
    if (quote) {
      setMockups(quote.mockupImageUrls || []);
      if (quote.lineItems.length > 1 || (quote.lineItems[0] && quote.lineItems[0].unitPrice > 0)) {
         setLineItems(quote.lineItems.map((item: any) => ({
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity
         })));
      } else {
         setLineItems([{ description: `Professional ${quote.title} Service`, unitPrice: 0, quantity: 1 }]);
      }
    }
  }, [quote]);

  // --- ACTIONS ---
  const updateItem = (index: number, field: keyof CreateLineItemRequest, value: any) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };
  const addItem = () => setLineItems([...lineItems, { description: 'Item', unitPrice: 0, quantity: 1 }]);
  const removeItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));
  const calculateTotal = () => lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  
  const handleSave = async () => {
    if (!quote) return;
    const payload: CreateQuoteRequest = {
        customerId: quote.customerId,
        propertyId: quote.propertyId,
        title: quote.title,
        requestDetails: quote.requestDetails || '', 
        lineItems: lineItems,
        mockupImageUrls: mockups // ✅ Save Mockups
    };
    if (await updateQuotePrice(quote.id, payload)) {
        refetch();
        alert("Draft saved!");
    }
  };

  const handleSend = async () => {
    if (!quote) return;
    await handleSave();
    if (await sendEstimate(quote.id)) {
        refetch();
        alert("Estimate Generated & Sent!");
    }
  };

  const handleStatusChange = async (status: QuoteStatus) => {
      if (!quote) return;
      if (!window.confirm(`Are you sure you want to manually mark this quote as ${status}?`)) return;
      if (await updateStatus(quote.id, status)) {
          refetch();
          window.location.reload(); 
      } else {
          alert("Failed to update status");
      }
  };

  const magicLink = quote?.magicLinkToken 
    ? `http://localhost:4200/estimate/${quote.id}?token=${quote.magicLinkToken}` 
    : null;

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!quote) return <div className="p-10 text-center">Not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 px-4">
      <Link to="/quotes" className="flex items-center text-slate-500 mb-6 hover:text-emerald-600 transition-colors">
          <ArrowLeft size={16} className="mr-2"/> Back to Quotes
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{quote.title}</h1>
                <span className={`px-3 py-1 rounded-full font-bold text-xs border uppercase tracking-wide
                    ${quote.status === 'APPROVED' || quote.status === 'DEPOSIT_PAID' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                    quote.status === 'REJECTED' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {quote.status.replace('_', ' ')}
                </span>
            </div>
            <div className="text-xs text-slate-400 font-mono mt-1">ID: {quote.id}</div>
         </div>

         {linkedJob && (
             <Link to={`/jobs/${linkedJob.id}`}>
                 <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                     <Hammer size={18} className="mr-2"/> View Linked Job
                 </Button>
             </Link>
         )}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <Card>
             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><User size={18}/> Request Details</h3>
             <div className="space-y-3">
                <div><label className="text-xs font-bold text-slate-400 uppercase">Name</label><p className="font-medium">{displayClient}</p></div>
                <div><label className="text-xs font-bold text-slate-400 uppercase">Notes</label><div className="bg-slate-50 p-2 rounded text-sm italic text-slate-600 border border-slate-100">"{displayNotes.trim()}"</div></div>
             </div>
           </Card>

           <Card className="p-0 overflow-hidden">
             <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm flex gap-2"><MapPin size={16}/> Location</span>
                {!position && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(displayLocation)}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Google Maps</a>}
             </div>
             {position ? (
                <div className="h-48 w-full">
                  <MapContainer center={position} zoom={15} style={{ height: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={position} icon={icon}><Popup>Job Site</Popup></Marker>
                  </MapContainer>
                </div>
             ) : (
                <div className="p-6 text-center text-slate-400 text-sm">No Map Pin<br/><span className="text-xs">{displayLocation}</span></div>
             )}
           </Card>
           
           <div className="space-y-6">
               {magicLink && (
                 <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                   <h4 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-2"><Send size={14}/> Estimate Sent</h4>
                   <div className="bg-white p-2 rounded border border-emerald-100 text-xs font-mono break-all select-all cursor-text text-slate-500">{magicLink}</div>
                   <a href={magicLink} target="_blank" rel="noreferrer" className="block mt-2 text-center text-xs font-bold text-emerald-700 hover:underline">Open Customer View →</a>
                 </div>
               )}

               <Card className="border-dashed border-slate-300 bg-slate-50/50">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-600 flex items-center gap-2 text-sm"><AlertTriangle size={16} className="text-amber-500"/> Admin Override</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleStatusChange('APPROVED')} disabled={quote.status === 'APPROVED' || isProcessing} className="flex items-center justify-center gap-1 py-2 px-1 rounded border text-[10px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200 transition-all">
                            <CheckCircle size={12}/> Mark Approved
                        </button>
                        <button onClick={() => handleStatusChange('REJECTED')} disabled={quote.status === 'REJECTED' || isProcessing} className="flex items-center justify-center gap-1 py-2 px-1 rounded border text-[10px] font-bold bg-white hover:bg-red-50 text-red-700 border-red-200 transition-all">
                            <XCircle size={12}/> Mark Rejected
                        </button>
                        <button onClick={() => handleStatusChange('DEPOSIT_PAID')} disabled={quote.status === 'DEPOSIT_PAID' || isProcessing} className="col-span-2 py-2 px-1 rounded border text-[10px] font-bold bg-white hover:bg-purple-50 text-purple-700 border-purple-200 transition-all">
                             Mark Deposit Paid (Force Job Create)
                        </button>
                    </div>
               </Card>
           </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
           
           {/* ✅ NEW: PHOTO MANAGER FOR MOCKUPS */}
           <Card>
             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><ImageIcon size={18}/> Project Mockups</h3>
             {!isEditable && <span className="text-xs text-slate-400 flex items-center gap-1 mb-2"><Lock size={12}/> Locked</span>}
             
             <PhotoManager 
                photos={mockups} 
                onChange={setMockups} 
                readOnly={!isEditable} 
             />
           </Card>

           <Card>
             <div className="flex justify-between mb-6">
               <h2 className="text-xl font-bold text-slate-800">Estimate Breakdown</h2>
               <div className="flex items-center gap-3">
                   {!isEditable && <div className="flex items-center gap-1 text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full"><Lock size={14} /> Read Only</div>}
               </div>
             </div>

             <div className="space-y-3">
               {lineItems.map((item, idx) => (
                 <div key={idx} className={`flex gap-3 items-start p-3 rounded border transition-all ${isEditable ? 'bg-white border-slate-200 hover:shadow-sm' : 'bg-slate-50 border-transparent'}`}>
                   <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Description</label>
                      <textarea value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} disabled={!isEditable} className="w-full p-2 text-sm border border-slate-200 rounded h-16 focus:ring-2 focus:ring-emerald-500 outline-none resize-none disabled:bg-transparent disabled:border-0 disabled:p-0" />
                   </div>
                   <div className="w-24">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Price ($)</label>
                      <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value))} disabled={!isEditable} className="w-full p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-transparent disabled:border-0 disabled:p-0 disabled:font-bold" />
                   </div>
                   <div className="w-16">
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Qty</label>
                      <input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))} disabled={!isEditable} className="w-full p-2 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-transparent disabled:border-0 disabled:p-0" />
                   </div>
                   {isEditable && <button onClick={() => removeItem(idx)} className="mt-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>}
                 </div>
               ))}
               {isEditable && <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg flex justify-center items-center gap-2 transition-all"><Plus size={16}/> Add Line Item</button>}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-end gap-1">
               <div className="flex justify-between w-full md:w-1/3 text-sm"><span className="text-slate-500">Deposit (50%)</span><span className="font-bold text-emerald-600">${(calculateTotal() * 0.5).toFixed(2)}</span></div>
               <div className="flex justify-between w-full md:w-1/3 text-xl pt-2 border-t border-slate-100 mt-2"><span className="font-bold text-slate-800">Total Estimate</span><span className="font-extrabold text-slate-900">${calculateTotal().toFixed(2)}</span></div>
             </div>

             {isEditable && (
               <div className="mt-8 flex gap-3 justify-end pt-6 border-t border-slate-100">
                 <Button variant="secondary" onClick={handleSave} disabled={isProcessing} className="px-6"><Save size={18} className="mr-2"/> Save Draft</Button>
                 <Button variant="primary" onClick={handleSend} disabled={isProcessing} className="px-6 shadow-lg shadow-emerald-100"><Send size={18} className="mr-2"/> Send to Customer</Button>
               </div>
             )}
           </Card>
        </div>
      </div>
    </div>
  );
}