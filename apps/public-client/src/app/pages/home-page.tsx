import { useNavigate } from 'react-router-dom';
import { Button } from '@olives-green/shared-ui';
import { useServices } from '@olives-green/data-access';
import { ServiceCard } from '../components/service-card';
import { QuoteForm } from '../components/quote-form';
import { getIconBySlug } from '../utils/icon-mapper';
import { Snowflake } from 'lucide-react';

export function HomePage() {
  const { services, isLoading } = useServices();
  const navigate = useNavigate();

  return (
    <>
      {/* HERO SECTION (Static marketing content) */}
      <header className="relative bg-slate-900 text-white overflow-hidden h-[600px] flex items-center">
        <div className="absolute inset-0">
           <img src="https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-40" alt="Hero" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 w-full pt-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 border border-white/10">
              <Snowflake className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold tracking-wide text-emerald-50">WINTER BOOKINGS OPEN</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              Premium Care for <br/> <span className="text-emerald-400">Every Season</span>
            </h1>
            <p className="text-xl text-slate-300 mb-10">One team dedicated to your home's curb appeal.</p>
            <Button variant="primary" onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth'})}>
              Get a Free Estimate
            </Button>
          </div>
        </div>
      </header>

      {/* DYNAMIC SERVICES GRID */}
      <section id="services" className="py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Fetched directly from your Backend Content Service.</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service) => (
                <div key={service.id} onClick={() => navigate(`/services/${service.pageSlug}`)} className="cursor-pointer h-full">
                  {/* We map the backend data to the Card UI */}
                  <ServiceCard 
                    icon={getIconBySlug(service.pageSlug)} 
                    title={service.title} 
                    desc={service.subTitle} // Using subTitle for the card summary
                    theme={service.pageSlug.includes('holiday') ? 'red' : 'green'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* QUOTE FORM SECTION */}
      <section id="quote" className="bg-white py-28">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20">
          <div className="pt-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Get a Quote</h2>
            <p className="text-slate-600 mb-8">Fill out the form to get started.</p>
          </div>
          <QuoteForm />
        </div>
      </section>
    </>
  );
}