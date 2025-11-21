import { Card } from '@olives-green/shared-ui';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  theme?: 'green' | 'red';
}

export function ServiceCard({ icon: Icon, title, desc, theme = 'green' }: ServiceCardProps) {
  const isRed = theme === 'red';
  
  return (
    <div className="group h-full">
      <Card className={`
        h-full relative overflow-hidden transition-all duration-300 
        hover:-translate-y-1 hover:shadow-xl border-slate-200
        flex flex-col
      `}>
        {/* Colored Accent Top Border */}
        <div className={`absolute top-0 left-0 w-full h-1 ${isRed ? 'bg-red-500' : 'bg-emerald-500'}`} />
        
        {/* Icon Circle */}
        <div className={`
          w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300
          ${isRed ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100'}
        `}>
          <Icon className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>
        
        <p className="text-slate-600 leading-relaxed flex-grow">
          {desc}
        </p>

        {/* subtle "Learn More" link that appears/colors on hover */}
        <div className={`mt-6 flex items-center gap-2 text-sm font-bold ${isRed ? 'text-red-600' : 'text-emerald-600'} opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0`}>
          Learn More <ArrowRight size={16} />
        </div>
      </Card>
    </div>
  );
}