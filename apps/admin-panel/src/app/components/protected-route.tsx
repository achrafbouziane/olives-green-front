import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  
  // 1. Not Logged In? -> Login Page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged in but wrong role? -> Access Denied Message
  if (allowedRoles && role && !allowedRoles.includes(role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border-t-4 border-red-500">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-600 mb-6">Your account does not have permission to view this area.</p>
                <button 
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                    }}
                    className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                >
                    Sign in with a different account
                </button>
            </div>
        </div>
      );
  }

  // 3. Success -> Render Content
  return <Outlet />;
}