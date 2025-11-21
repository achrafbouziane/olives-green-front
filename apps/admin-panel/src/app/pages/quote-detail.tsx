import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuoteById, useAdminQuoteActions } from '@olives-green/data-access';
import { CreateQuoteRequest, CreateLineItemRequest } from '@olives-green/shared-types';
import { Card, Button } from '@olives-green/shared-ui';
import { MapPin, User, Send, Save, ArrowLeft, Plus, Trash2, ExternalLink, Image as ImageIcon, Lock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  
  const [lineItems, setLineItems] = useState<CreateLineItemRequest[]>([]);
  
  // New State for Mockups
  const [mockups, setMockups] = useState<string[]>([]);
  const [newMockupUrl, setNewMockupUrl] = useState('');
  const isEditable = quote?.status === 'REQUESTED' || quote?.status === 'ESTIMATE_SENT';

  // --- PARSING LOGIC ---
  // We prioritize the PERMANENT requestDetails field if available
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
      // Initialize Mockups
      setMockups(quote.mockupImageUrls || []);

      // Initialize Line Items
      // If price > 0 or multiple items, load existing estimate work
      if (quote.lineItems.length > 1 || (quote.lineItems[0] && quote.lineItems[0].unitPrice > 0)) {
         setLineItems(quote.lineItems.map((item: { description: any; unitPrice: any; quantity: any; }) => ({
            description: item.description,
            unitPrice: item.unitPrice,
            quantity: item.quantity
         })));
      } else {
         // Clean slate for new estimate
         setLineItems([{
            description: `Professional ${quote.title} Service`, 
            unitPrice: 0,
            quantity: 1
         }]);
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

  // Mockup Actions
  const addMockup = () => {
    if (newMockupUrl) {
      setMockups([...mockups, newMockupUrl]);
      setNewMockupUrl('');
    }
  };
  const removeMockup = (index: number) => {
    setMockups(mockups.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!quote) return;
    const payload: CreateQuoteRequest = {
        customerId: quote.customerId,
        propertyId: quote.propertyId,
        title: quote.title,
        requestDetails: quote.requestDetails || '', 
        lineItems: lineItems,
        mockupImageUrls: mockups // Save mockups
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
        alert("Estimate Generated!");
    }
  };

  const magicLink = quote?.magicLinkToken 
    ? `http://localhost:4200/estimate/${quote.id}?token=${quote.magicLinkToken}` 
    : null;

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;
  if (!quote) return <div className="p-10 text-center">Not found</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <Link to="/quotes" className="flex items-center text-slate-500 mb-6"><ArrowLeft size={16} /> Back</Link>
      
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT: Customer Data */}
        <div className="lg:col-span-1 space-y-6">
           <Card>
             <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2"><User size={18}/> Request</h3>
             <div className="text-sm space-y-2">
                <p className="font-medium">{displayClient}</p>
                <div className="bg-slate-50 p-2 rounded text-xs italic text-slate-600">"{displayNotes.trim()}"</div>
             </div>
           </Card>

           <Card className="p-0 overflow-hidden">
             <div className="p-3 bg-slate-50 border-b flex justify-between items-center">
                <span className="font-bold text-slate-700 text-sm flex gap-2"><MapPin size={16}/> Location</span>
                {!position && <a href={`https://www.google.com/maps?q=${displayLocation}`} target="_blank" className="text-xs text-blue-600 underline">Google Maps</a>}
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
           
           {magicLink && (
             <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
               <h4 className="text-sm font-bold text-emerald-800 mb-2">Estimate Sent!</h4>
               <div className="bg-white p-2 rounded border border-emerald-100 text-xs font-mono break-all select-all cursor-text">{magicLink}</div>
               <a href={magicLink} target="_blank" className="block mt-2 text-center text-xs font-bold text-emerald-700 hover:underline">Test Link &rarr;</a>
             </div>
           )}
        </div>

        {/* RIGHT: Editable Invoice */}
        <div className="lg:col-span-2 space-y-6">
           {/* MOCKUPS SECTION */}
           <Card>
             <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
               <ImageIcon size={18}/> Project Mockups
             </h3>
              {!isEditable && <span className="text-xs text-slate-400 flex items-center gap-1"><Lock size={12}/> Locked</span>}

             <div className="grid grid-cols-3 gap-4 mb-4">
               {mockups.map((url, idx) => (
                 <div key={idx} className="relative group aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                   <img src={url} alt="Mockup" className="w-full h-full object-cover" />
                   <button 
                     onClick={() => removeMockup(idx)}
                     className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={12} />
                   </button>
                 </div>
               ))}
             </div>


             {isEditable && (
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newMockupUrl}
                   onChange={(e) => setNewMockupUrl(e.target.value)}
                   placeholder="Paste image URL here..."
                   className="flex-1 p-2 text-sm border rounded"
                 />
                 <Button variant="secondary" onClick={addMockup} className="px-3"><Plus size={16}/></Button>
               </div>
             )}
           </Card>

           {/* ESTIMATE EDITOR */}
  <Card>
             <div className="flex justify-between mb-6">
               <h2 className="text-xl font-bold">Estimate Details</h2>
               
               <div className="flex items-center gap-3">
                   {!isEditable && (
                       <div className="flex items-center gap-1 text-slate-500 text-sm bg-slate-100 px-3 py-1 rounded-full">
                           <Lock size={14} /> Read Only
                       </div>
                   )}
                   <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">
                     {quote.status}
                   </span>
               </div>
             </div>

             <div className="space-y-4">
               {lineItems.map((item, idx) => (
                 <div key={idx} className={`flex gap-3 items-start p-3 rounded border ${isEditable ? 'bg-slate-50 border-slate-100' : 'bg-slate-50/50 border-transparent'}`}>
                   <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500">Description</label>
                      <textarea 
                        value={item.description} 
                        onChange={e => updateItem(idx, 'description', e.target.value)} 
                        disabled={!isEditable} // DISABLE INPUT
                        className="w-full p-2 text-sm border rounded h-16 disabled:bg-transparent disabled:border-0 disabled:resize-none disabled:p-0" 
                      />
                   </div>
                   <div className="w-24">
                      <label className="text-xs font-bold text-slate-500">Price ($)</label>
                      <input 
                        type="number" 
                        value={item.unitPrice} 
                        onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value))} 
                        disabled={!isEditable} // DISABLE INPUT
                        className="w-full p-2 text-sm border rounded disabled:bg-transparent disabled:border-0 disabled:p-0 disabled:font-bold" 
                      />
                   </div>
                   <div className="w-16">
                      <label className="text-xs font-bold text-slate-500">Qty</label>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value))} 
                        disabled={!isEditable} // DISABLE INPUT
                        className="w-full p-2 text-sm border rounded disabled:bg-transparent disabled:border-0 disabled:p-0" 
                      />
                   </div>
                   
                   {isEditable && (
                     <button onClick={() => removeItem(idx)} className="mt-6 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                   )}
                 </div>
               ))}
               
               {isEditable && (
                 <button onClick={addItem} className="w-full py-2 border-2 border-dashed text-slate-500 hover:bg-slate-50 rounded flex justify-center items-center gap-2"><Plus size={16}/> Add Item</button>
               )}
             </div>

             <div className="mt-6 pt-6 border-t flex justify-end gap-8">
               <div className="text-right"><p className="text-xs text-slate-500">Deposit (50%)</p><p className="text-lg font-bold text-emerald-600">${(calculateTotal() * 0.5).toFixed(2)}</p></div>
               <div className="text-right"><p className="text-xs text-slate-500">Total</p><p className="text-3xl font-bold text-slate-900">${calculateTotal().toFixed(2)}</p></div>
             </div>

             {/* Hide Action Buttons if Locked */}
             {isEditable && (
               <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                 <Button variant="secondary" onClick={handleSave} disabled={isProcessing}><Save size={16} className="mr-2"/> Save Draft</Button>
                 <Button variant="primary" onClick={handleSend} disabled={isProcessing}><Send size={16} className="mr-2"/> Send to Customer</Button>
               </div>
             )}
           </Card>
        </div>
      </div>
    </div>
  );
}

