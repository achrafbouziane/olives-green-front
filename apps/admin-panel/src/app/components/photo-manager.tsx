import { useState } from 'react';
import { X, Plus, Image as ImageIcon, UploadCloud, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useStorage } from '@olives-green/data-access'; // ✅ Import the hook

interface PhotoManagerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  readOnly?: boolean;
}

export function PhotoManager({ photos, onChange, readOnly = false }: PhotoManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  // ✅ Use the hook
  const { uploadFile, isUploading } = useStorage();

  // --- ACTIONS ---
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...photos, urlInput.trim()]);
    setUrlInput('');
    setIsAdding(false);
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  // --- REAL FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // 1. Upload to Backend
    const uploadedUrl = await uploadFile(file);

    // 2. If success, add URL to list
    if (uploadedUrl) {
        onChange([...photos, uploadedUrl]);
    } else {
        alert("Upload failed. Please try again.");
    }
    
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
       <div className="flex justify-between items-center">
           <label className="block text-xs font-bold text-slate-500 uppercase">Job Photos</label>
           <span className="text-xs text-slate-400">{photos.length} items</span>
       </div>

       {/* PHOTO GRID */}
       <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((url, idx) => (
             <div key={idx} className="relative group aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                <img src={url} alt={`Visit ${idx}`} className="w-full h-full object-cover" />
                
                {!readOnly && (
                    <button 
                      onClick={() => handleRemove(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                    >
                       <X size={12} />
                    </button>
                )}
             </div>
          ))}

          {/* ADD BUTTONS */}
          {!readOnly && (
             <div className="aspect-square border-2 border-dashed border-slate-200 rounded-lg flex flex-col gap-2 items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors group relative">
                
                {/* Loading State */}
                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
                        <Loader2 size={20} className="animate-spin text-emerald-600"/>
                        <span className="text-[10px] text-emerald-600 font-bold mt-1">Uploading...</span>
                    </div>
                )}

                {!isAdding ? (
                    <>
                        <div className="flex gap-2">
                            {/* 1. File Upload Button */}
                            <label className="cursor-pointer p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all" title="Upload File">
                                <UploadCloud size={16}/>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading}/>
                            </label>

                            {/* 2. Add URL Button */}
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="p-2 bg-white border border-slate-200 rounded-full text-slate-500 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all" 
                                title="Add Link"
                            >
                                <LinkIcon size={16}/>
                            </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">Add Photo</span>
                    </>
                ) : (
                    <div className="p-2 w-full flex flex-col gap-2 animate-in fade-in zoom-in-95">
                        <input 
                           type="text" 
                           autoFocus
                           placeholder="https://..." 
                           className="w-full text-[10px] p-1 border rounded outline-none"
                           value={urlInput}
                           onChange={e => setUrlInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleAddUrl()}
                        />
                        <div className="flex gap-1">
                            <button onClick={handleAddUrl} className="flex-1 bg-emerald-500 text-white text-[10px] py-1 rounded font-bold hover:bg-emerald-600">Add</button>
                            <button onClick={() => setIsAdding(false)} className="px-2 bg-slate-200 text-slate-600 text-[10px] py-1 rounded hover:bg-slate-300"><X size={12}/></button>
                        </div>
                    </div>
                )}
             </div>
          )}
       </div>
    </div>
  );
}