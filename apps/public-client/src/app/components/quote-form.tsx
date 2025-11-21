import { useState } from 'react';
import { Button, Card } from '@olives-green/shared-ui';
import { useCreateQuote, useServices } from '@olives-green/data-access'; 
import { CheckCircle, AlertCircle, MapPin, Crosshair, Search, Phone as PhoneIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// US States List
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const COUNTRY_PREFIXES = [
  { code: '+1', country: 'USA/CAN' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'AUS' },
];

function LocationMarker({ position, setPosition }: { position: { lat: number; lng: number } | null, setPosition: (pos: { lat: number; lng: number }) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 16);
    },
  });
  return position ? <Marker position={position} icon={icon}><Popup>Service Location</Popup></Marker> : null;
}

export function QuoteForm() {
  const { createQuote, isLoading, error, isSuccess, reset } = useCreateQuote();
  const { services, isLoading: isServicesLoading } = useServices();
  
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(''); // New State field
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState(''); // New Phone field
  const [prefix, setPrefix] = useState('+1'); // Default prefix
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const defaultCenter = { lat: 34.02, lng: -6.84 }; 

  const mapsUrl = coords 
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, ${state} ${zip}`)}`;

  // Phone Formatter (XXX) XXX-XXXX
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Strip non-digits
    let formatted = rawValue;
    if (rawValue.length > 0) {
      if (rawValue.length <= 3) {
        formatted = `(${rawValue}`;
      } else if (rawValue.length <= 6) {
        formatted = `(${rawValue.slice(0, 3)}) ${rawValue.slice(3)}`;
      } else {
        formatted = `(${rawValue.slice(0, 3)}) ${rawValue.slice(3, 6)}-${rawValue.slice(6, 10)}`;
      }
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const payload = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: `${prefix} ${phone}`, // Combine prefix and formatted phone
      address: address,
      city: city,
      state: state,
      postalCode: zip,
      serviceType: formData.get('serviceType') as string,
      details: formData.get('details') as string,
      coords: coords 
    };

    await createQuote(payload);
  };

  const handleReset = () => {
    reset();
    setAddress('');
    setCity('');
    setState('');
    setZip('');
    setPhone('');
    setCoords(null);
  };
  
  const inputClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-200 text-slate-700 placeholder:text-slate-400";
  const labelClasses = "block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1";

  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-emerald-50/50 rounded-2xl border border-emerald-100 shadow-inner">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">Request Received!</h3>
        <p className="text-slate-600 mb-6 max-w-xs mx-auto">We've pinned your location. Expect a preliminary estimate in your email shortly.</p>
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-emerald-700 font-bold hover:underline bg-emerald-100/50 px-5 py-2.5 rounded-full transition-colors">
          <MapPin size={18} /> View Location
        </a>
        <div className="mt-8">
          <button onClick={handleReset} className="text-slate-400 text-sm hover:text-slate-600 font-medium">Send another request</button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white shadow-2xl shadow-slate-200/50 border-slate-100 rounded-2xl overflow-hidden p-0">
       <div className="bg-slate-900 p-6 text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Search className="text-emerald-400" size={20}/>
          Get a Free Quote
        </h3>
        <p className="text-slate-400 text-sm mt-1">Tell us about your property needs.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Name & Email */}
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className={labelClasses}>Full Name</label>
            <input name="name" type="text" className={inputClasses} required placeholder="John Doe" />
          </div>
          <div>
            <label className={labelClasses}>Email Address</label>
            <input name="email" type="email" className={inputClasses} required placeholder="john@company.com" />
          </div>
        </div>

        {/* Phone Input with Prefix */}
        <div>
            <label className={labelClasses}>Phone Number</label>
            <div className="flex">
                <select 
                  value={prefix} 
                  onChange={(e) => setPrefix(e.target.value)}
                  className="px-3 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-20 appearance-none cursor-pointer text-center font-medium"
                >
                    {COUNTRY_PREFIXES.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
                </select>
                <div className="relative w-full">
                    <PhoneIcon size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={handlePhoneChange}
                      maxLength={14}
                      className={`${inputClasses} rounded-l-none pl-10`} 
                      required 
                      placeholder="(555) 123-4567" 
                    />
                </div>
            </div>
        </div>

        {/* Map Section */}
        <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 relative overflow-hidden group">
           <div className="h-56 w-full rounded-lg overflow-hidden relative z-0">
            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker position={coords} setPosition={setCoords} />
            </MapContainer>
            <button type="button" onClick={(e) => { e.preventDefault(); navigator.geolocation.getCurrentPosition((pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })); }} className="absolute bottom-3 right-3 z-[1000] bg-white p-2.5 rounded-full shadow-lg text-slate-700 hover:text-emerald-600 hover:scale-110 transition-all">
              <Crosshair size={20} />
            </button>
          </div>

          <div className="p-4 grid gap-3 bg-white m-1 rounded-lg border border-slate-100 shadow-sm">
             <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <MapPin size={16} /> <span className="font-bold text-xs uppercase tracking-wide">Property Location</span>
             </div>
             <div className="grid grid-cols-1 gap-3">
               <input name="address" value={address} onChange={(e) => setAddress(e.target.value)} type="text" className={inputClasses} placeholder="Street Address" required />
             </div>
             <div className="grid grid-cols-3 gap-3">
               <input name="city" value={city} onChange={(e) => setCity(e.target.value)} type="text" className={inputClasses} placeholder="City" required />
               {/* State Dropdown */}
               <div className="relative">
                   <select 
                     value={state} 
                     onChange={(e) => setState(e.target.value)} 
                     className={`${inputClasses} appearance-none`} 
                     required
                   >
                       <option value="" disabled>State</option>
                       {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                   </select>
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                   </div>
               </div>
               <input name="zip" value={zip} onChange={(e) => setZip(e.target.value)} type="text" className={inputClasses} placeholder="Zip Code" required />
             </div>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Service Needed</label>
          <div className="relative">
            <select name="serviceType" className={`${inputClasses} appearance-none cursor-pointer`} disabled={isServicesLoading} defaultValue="" required>
              <option value="" disabled>Select a Service...</option>
              {isServicesLoading ? <option>Loading...</option> : services.length > 0 ? services.map(s => <option key={s.id} value={s.title}>{s.title}</option>) : <option value="LANDSCAPING">Landscaping</option>}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClasses}>Notes / Access Code</label>
          <textarea name="details" className={`${inputClasses} min-h-[100px] resize-none`} placeholder="Gate code is 1234..."></textarea>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-3 border border-red-100">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <Button type="submit" disabled={isLoading} className="w-full py-4 text-lg shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all hover:-translate-y-0.5">
          {isLoading ? 'Sending...' : 'Request Free Quote'}
        </Button>
      </form>
    </Card>
  );
}