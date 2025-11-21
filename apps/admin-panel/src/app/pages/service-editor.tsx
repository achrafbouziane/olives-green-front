import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added hooks
import { Button, Card } from '@olives-green/shared-ui';
import { apiClient, useServiceBySlug } from '@olives-green/data-access';
import { SavePageRequest } from '@olives-green/shared-types';
import { Save, CheckCircle, AlertCircle, Plus, Trash2, ArrowLeft } from 'lucide-react';

const SERVICE_PREFIX = '/content-service/api';

export function ServiceEditor() {
  const { slug } = useParams(); // Get slug from URL if editing
  const navigate = useNavigate();
  const isEditMode = !!slug;

  // Fetch existing data if in edit mode
  const { service: existingService, isLoading: isFetching } = useServiceBySlug(slug);

  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subTitle: '',
    slug: '',
    imageUrl: '',
    description: '',
  });
  
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');

  // Populate form when existing data loads
  useEffect(() => {
    if (existingService && isEditMode) {
      setFormData({
        title: existingService.title,
        subTitle: existingService.subTitle,
        slug: existingService.pageSlug,
        imageUrl: existingService.imageUrl,
        description: existingService.description,
      });
      setFeatures(existingService.features || []);
    }
  }, [existingService, isEditMode]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // Only auto-generate slug if creating new (don't overwrite slug while editing title)
    if (!isEditMode) {
        const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, title, slug: generatedSlug }));
    } else {
        setFormData(prev => ({ ...prev, title }));
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus('idle');

    const payload: SavePageRequest = {
      pageSlug: formData.slug,
      title: formData.title,
      subTitle: formData.subTitle,
      imageUrl: formData.imageUrl,
      description: formData.description,
      features: features
    };

    try {
      if (isEditMode) {
        // PUT /v1/content/pages/{slug}
        await apiClient.put(`${SERVICE_PREFIX}/v1/content/pages/${slug}`, payload);
      } else {
        // POST /v1/content/pages
        await apiClient.post(`${SERVICE_PREFIX}/v1/content/pages`, payload);
      }
      setStatus('success');
      // Redirect back to list after short delay
      setTimeout(() => navigate('/services'), 1500);
    } catch (error) {
      console.error('Failed to save page:', error);
      setStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditMode && isFetching) return <div className="p-10 text-center">Loading service data...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button onClick={() => navigate('/services')} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2 text-sm font-medium">
          <ArrowLeft size={16} /> Back to List
        </button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800">
            {isEditMode ? `Edit Service: ${existingService?.title || 'Loading...'}` : 'Create New Service'}
          </h1>
          {status === 'success' && (
            <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full animate-pulse">
              <CheckCircle size={16} /> Saved! Redirecting...
            </span>
          )}
        </div>
      </div>

      <Card className="space-y-6">
        <form onSubmit={handleSubmit}>
          {/* 1. Basic Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Service Title</label>
              <input type="text" value={formData.title} onChange={handleTitleChange} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Snow Removal" required />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">URL Slug</label>
              <input 
                type="text" 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                // Disable slug editing in Edit Mode to prevent broken links (optional but recommended)
                disabled={isEditMode}
                className={`w-full p-2 border rounded text-slate-500 ${isEditMode ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50'}`} 
                required 
              />
              {isEditMode && <p className="text-xs text-slate-400 mt-1">Slug cannot be changed after creation.</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Short Summary</label>
            <input type="text" value={formData.subTitle} onChange={(e) => setFormData({...formData, subTitle: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. We clear driveways fast." required />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Hero Image URL</label>
            <input type="text" value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://..." />
          </div>

          <hr className="border-slate-100 my-8" />

          {/* 2. Description */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Detailed Description</label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-4 border rounded focus:ring-2 focus:ring-emerald-500 outline-none h-40 resize-y"
              placeholder="Describe the service in detail here..."
              required
            />
          </div>

          {/* 3. Features Builder */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">Key Features (Bullet Points)</label>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                className="flex-1 p-2 border rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. 24/7 Emergency Support"
              />
              <Button type="button" variant="secondary" onClick={addFeature}>
                <Plus size={18} /> Add
              </Button>
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
              {features.length === 0 && <p className="text-sm text-slate-400 italic">No features added yet.</p>}
              {features.map((feat, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded shadow-sm border border-slate-200">
                  <span className="text-slate-700">{feat}</span>
                  <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {status === 'error' && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 flex items-center gap-2 rounded">
              <AlertCircle size={16} /> Failed to save. Check connection.
            </div>
          )}

          <Button type="submit" disabled={isSaving} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : (isEditMode ? 'Update Service Page' : 'Publish Service Page')}
          </Button>
        </form>
      </Card>
    </div>
  );
}