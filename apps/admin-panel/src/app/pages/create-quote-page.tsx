import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCreateQuote, useServices } from '@olives-green/data-access'; // Import useServices
import { Card, Button } from '@olives-green/shared-ui';
import { ArrowLeft, Save, User, MapPin, FileText, AlertCircle, Loader2 } from 'lucide-react';

export function CreateQuotePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Pre-fill service if coming from Service Dashboard
  const initialService = searchParams.get('service') || '';

  const { createQuote, isLoading, isSuccess, error } = useCreateQuote();
  
  // Fetch services from API
  const { services, isLoading: servicesLoading } = useServices();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    serviceType: initialService,
    details: ''
  });

  // Redirect to list on success
  useEffect(() => {
    if (isSuccess) {
      navigate('/quotes');
    }
  }, [isSuccess, navigate]);

  // Update serviceType if initialService changes or services load
  useEffect(() => {
    if (initialService) {
        setFormData(prev => ({ ...prev, serviceType: initialService }));
    }
  }, [initialService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createQuote({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        serviceType: formData.serviceType,
        details: formData.details,
        coords: null
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/quotes" className="flex items-center text-slate-500 mb-6 gap-2 hover:text-slate-800 transition-colors">
        <ArrowLeft size={16} /> Back to Quotes
      </Link>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">New Manual Quote</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. CLIENT INFO */}
        <Card className="p-6">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><User size={18}/> Client Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                    <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                    <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                    <input required type="email" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                    <input required type="tel" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
            </div>
        </Card>

        {/* 2. PROPERTY INFO */}
        <Card className="p-6">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><MapPin size={18}/> Property Location</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Street Address</label>
                    <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                        <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                            value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zip Code</label>
                         <input required type="text" className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" 
                            value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} />
                    </div>
                </div>
            </div>
        </Card>

        {/* 3. REQUEST DETAILS */}
        <Card className="p-6">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18}/> Request Details</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Type</label>
                    <select 
                        className="w-full p-2 border rounded bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.serviceType} 
                        onChange={e => setFormData({...formData, serviceType: e.target.value})}
                        disabled={servicesLoading}
                    >
                        <option value="" disabled>
                            {servicesLoading ? 'Loading Services...' : 'Select a Service...'}
                        </option>
                        
                        {/* Map over services fetched from API */}
                        {services.map(service => (
                            <option key={service.id} value={service.title}>
                                {service.title}
                            </option>
                        ))}
                        
                        {/* Fallback option if list is empty */}
                        {services.length === 0 && !servicesLoading && (
                            <option value="General Inquiry">General Inquiry</option>
                        )}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notes / Instructions</label>
                    <textarea className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" 
                        placeholder="Enter any initial details from the client..."
                        value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})}
                    />
                </div>
            </div>
        </Card>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                {isLoading ? <><Loader2 className="animate-spin mr-2" size={18}/> Creating...</> : <><Save className="mr-2" size={18}/> Create Quote</>}
            </Button>
        </div>
      </form>
    </div>
  );
}