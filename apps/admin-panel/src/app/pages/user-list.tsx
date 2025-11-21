import { useState } from 'react';
import { useUsers, UserDTO, UserRequest } from '@olives-green/data-access';
import { Card, Button } from '@olives-green/shared-ui';
import { User, Plus, Shield, ShieldCheck, Mail, Edit, Trash2 } from 'lucide-react';
import { UserDialog } from '../components/user-dialog'; // Import Dialog

export function UserList() {
  const { users, isLoading, createUser, updateUser, deleteUser } = useUsers();
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (user: UserDTO) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: UserRequest) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data);
    }
  };

  if (isLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Team Management</h1>
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={18} className="mr-2" /> Add Member
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="relative group p-5 border border-slate-200 hover:shadow-md transition-all">
            
            {/* Action Buttons (Show on Hover) */}
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(user)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded">
                <Edit size={16} />
              </button>
              <button onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${user.role === 'ADMIN' ? 'bg-emerald-600' : 'bg-blue-500'}`}>
                {user.firstName[0]}{user.lastName[0]}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{user.firstName} {user.lastName}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 truncate">
                  <Mail size={12} /> {user.email}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit uppercase tracking-wide border ${user.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                  {user.role === 'ADMIN' ? <ShieldCheck size={10}/> : <Shield size={10}/>}
                  {user.role}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* The Dialog Component */}
      <UserDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSave={handleSave}
        initialData={selectedUser}
      />
    </div>
  );
}