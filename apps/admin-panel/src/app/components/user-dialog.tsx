import { useState, useEffect } from 'react';
import { UserDTO, UserRequest } from '@olives-green/shared-types';
import { Button } from '@olives-green/shared-ui';
import { X, Save } from 'lucide-react';

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserRequest) => Promise<void>;
  initialData?: UserDTO | null; // If present, we are editing
}

export function UserDialog({ isOpen, onClose, onSave, initialData }: UserDialogProps) {
  const [formData, setFormData] = useState<UserRequest>({
    firstName: '', lastName: '', email: '', role: 'EMPLOYEE', password: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens/closes or data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        role: initialData.role,
        password: '' // Password not editable directly here usually
      });
    } else {
      setFormData({ firstName: '', lastName: '', email: '', role: 'EMPLOYEE', password: '' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      alert("Failed to save user");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  console.log('Rendering UserDialog with initialData:', initialData);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">{initialData ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">First Name</label>
              <input required type="text" className="w-full p-2 border rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Last Name</label>
              <input required type="text" className="w-full p-2 border rounded" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
            <input required type="email" className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          {/* Only show password field when creating new user */}
          {!initialData && (
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
              <input required type="password" className="w-full p-2 border rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
            <select className="w-full p-2 border rounded bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="EMPLOYEE">Employee</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
             <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
             <Button type="submit" disabled={isSaving}><Save size={16} className="mr-2"/> {isSaving ? 'Saving...' : 'Save User'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}