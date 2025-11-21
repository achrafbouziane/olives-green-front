import { Link } from 'react-router-dom';
import { useServices } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import { Edit, Plus, AlertCircle, ExternalLink } from 'lucide-react';

export function ServiceList() {
  const { services, isLoading, error } = useServices();

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading services...</div>;
  if (error) return <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2"><AlertCircle /> {error}</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Services</h1>
        <Link to="/services/new">
          <Button variant="primary">
            <Plus size={18} className="mr-2" /> Add New Service
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0 border-0 shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Slug</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Summary</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-400">No services found. Create one!</td></tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                    {service.imageUrl && (
                      <img src={service.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-slate-200" />
                    )}
                    {service.title}
                  </td>
                  <td className="p-4 text-sm text-slate-500 font-mono">{service.pageSlug}</td>
                  <td className="p-4 text-sm text-slate-600 max-w-md truncate">{service.subTitle}</td>
                  <td className="p-4">
                    <Link to={`/services/${service.pageSlug}/edit`}>
                      <button className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 px-3 py-1.5 rounded hover:bg-emerald-50 transition-colors">
                        <Edit size={16} /> Edit
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}