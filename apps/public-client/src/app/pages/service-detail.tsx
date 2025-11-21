import { useParams, Link } from 'react-router-dom';
import { useServiceBySlug } from '@olives-green/data-access';
import { getIconBySlug } from '../utils/icon-mapper';
import { ArrowLeft, CheckCircle, ShieldCheck, Clock, Star } from 'lucide-react';
import { QuoteForm } from '../components/quote-form';

export function ServiceDetailPage() {
  const { slug } = useParams();
  const { service, isLoading } = useServiceBySlug(slug);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  
  if (!service) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Service Not Found</h2>
      <Link to="/" className="text-emerald-600 hover:underline">Return Home</Link>
    </div>
  );

  const Icon = getIconBySlug(service.pageSlug);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* --- 1. HERO SECTION --- */}
      <div className="h-[500px] w-full relative bg-slate-900 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={service.imageUrl || 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80'} 
            alt={service.title} 
            className="w-full h-full object-cover opacity-50 scale-105 animate-[pulse_30s_ease-in-out_infinite]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-6 border border-white/20 shadow-2xl">
            <Icon size={48} className="text-emerald-400" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg">{service.title}</h1>
          <p className="text-xl text-slate-200 max-w-2xl font-light tracking-wide">{service.subTitle}</p>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Content Column */}
          <div className="lg:col-span-7 xl:col-span-8">
             <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
                <Link to="/" className="inline-flex items-center text-slate-500 hover:text-emerald-600 mb-8 font-medium transition-colors">
                  <ArrowLeft size={18} className="mr-2" /> Back to Services
                </Link>
                
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
                
                {/* Render Description (Simple Text with Line Breaks) */}
                <div className="text-lg text-slate-600 leading-loose mb-10 whitespace-pre-line">
                  {service.description}
                </div>

                {/* Render Structured Features Grid */}
                <h3 className="text-2xl font-bold text-slate-900 mb-6">What's Included</h3>
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                   {service.features && service.features.map((feature, idx) => (
                     <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors group">
                       <div className="bg-white p-2 rounded-full shadow-sm text-emerald-600 group-hover:scale-110 transition-transform">
                          <CheckCircle size={20} />
                       </div>
                       <span className="font-semibold text-slate-700">{feature}</span>
                     </div>
                   ))}
                </div>

                {/* Static Trust Signals */}
                <div className="mt-12 p-8 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">The OlivesGreen Standard</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3"><ShieldCheck className="text-emerald-600" size={20} /> <span className="text-slate-700 font-medium">Licensed & Insured</span></div>
                    <div className="flex items-center gap-3"><Clock className="text-emerald-600" size={20} /> <span className="text-slate-700 font-medium">On-Time Guarantee</span></div>
                  </div>
                </div>
             </div>
          </div>

          {/* Sidebar Form Column */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
                <h3 className="text-2xl font-bold mb-2 relative z-10">Ready to start?</h3>
                <p className="text-emerald-100/80 relative z-10 mb-6">Get a custom quote for {service.title} sent to your inbox.</p>
              </div>
              <div className="relative -mt-6 mx-2 z-20">
                 <QuoteForm />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}