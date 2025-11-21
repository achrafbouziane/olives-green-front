import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@olives-green/data-access';
import { Button, Card } from '@olives-green/shared-ui';
import { Lock, Save, AlertTriangle, CheckCircle } from 'lucide-react';
export function ForcePasswordChange() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the backend endpoint to update password
      await apiClient.post('/user-service/api/v1/auth/change-password', { 
        newPassword: password 
      });
      
      // Update local storage or user state if needed
      // Redirect to dashboard
      navigate('/');
      
    } catch (err) {
      console.error(err);
      setError('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0">
        <div className="text-center mb-6">
          <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-amber-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Security Update Required</h1>
          <p className="text-slate-500 text-sm mt-1">
            For your security, please update your password before continuing.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" 
              required 
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center justify-center gap-2">
               <AlertTriangle size={16}/> {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full py-3 bg-amber-600 hover:bg-amber-700">
            {isLoading ? 'Updating...' : 'Update Password & Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}