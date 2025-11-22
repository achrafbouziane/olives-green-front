import { Navigate, Outlet } from 'react-router-dom';

// Helper: Decodes JWT and checks if it is expired
const isTokenExpired = (token: string) => {
  try {
    // 1. Get the payload part (second part of JWT)
    const base64Url = token.split('.')[1];
    // 2. Decode Base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    // 3. Parse JSON and check time
    const payload = JSON.parse(jsonPayload);
    
    if (!payload.exp) return false; // If no expiry, assume valid
    
    const expiry = payload.exp * 1000; // Convert seconds to milliseconds
    return Date.now() > expiry;
  } catch (e) {
    console.error("Invalid Token:", e);
    return true; // Treat invalid tokens as expired
  }
};

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');
  
  // 1. Security Check: No Token OR Token Expired? -> Redirect to Login
  if (!token || isTokenExpired(token)) {
    // Cleanup stale session data immediately
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    
    return <Navigate to="/login" replace />;
  }

  // 2. Role Check: Logged in but wrong role? -> Access Denied Message
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