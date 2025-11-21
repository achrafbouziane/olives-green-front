import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@olives-green/data-access'; 
import { Button, Card } from '@olives-green/shared-ui';
import { Lock, Mail, Loader2, AlertTriangle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // POST to Gateway -> User Service
      // Gateway route: /user-service/api/v1/auth/login
      const res = await apiClient.post('/user-service/api/v1/auth/login', { email, password });
      
      const { token, user } = res.data;

      // Frontend Role Check (UX only - Security is enforced by Gateway)
      if (user.role !== 'ADMIN') {
          setError("Access Denied. Admin privileges required.");
          setIsLoading(false);
          return;
      }

      // Store Session
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_name', user.firstName);

      // Go to Dashboard
      navigate('/');
      
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <Card className="w-full max-w-md p-8 shadow-2xl border-0">
        <div className="text-center mb-8">
          <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-emerald-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                required 
                placeholder="admin@seasonscape.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pl-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" 
                required 
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center justify-center gap-2 font-medium animate-pulse">
               <AlertTriangle size={16}/> {error}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full py-3 text-base font-semibold shadow-lg shadow-emerald-200">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}