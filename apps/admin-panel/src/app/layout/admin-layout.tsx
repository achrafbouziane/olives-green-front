import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Leaf,
  List,
  Users,
  Calendar,
  Hammer,
} from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Get User Info dynamically from Local Storage (set during Login)
  const userName = localStorage.getItem('user_name') || 'Administrator';
  const userRole = localStorage.getItem('user_role') || 'ADMIN';
  // Optional: Get email if you stored it, otherwise hide or use placeholder
  const userEmail =
    localStorage.getItem('user_email') || 'admin@olivesgreen.com';

  const handleLogout = () => {
    // 1. Clear Session
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');

    // 2. Redirect
    navigate('/login');
  };

  // Helper to highlight active tabs
  const isActive = (path: string) =>
    location.pathname.startsWith(path) && path !== '/'
      ? 'bg-emerald-600 text-white'
      : location.pathname === path
      ? 'bg-emerald-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white';

  return (
    <div className="flex h-screen bg-slate-100 font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl fixed h-full z-10">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-500 p-1.5 rounded">
            <Leaf size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-wide">OlivesGreen</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
              '/'
            )}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          {userRole === 'ADMIN' && (
            <Link
              to="/quotes"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                '/quotes'
              )}`}
            >
              <FileText size={20} />
              <span>Quote Requests</span>
            </Link>
          )}

          {/* NEW: Global Job & Schedule Links */}
          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">
              Operations
            </p>

            <Link
              to="/jobs"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                '/jobs'
              )}`}
            >
              <Hammer size={20} />
              <span>All Jobs</span>
            </Link>

            <Link
              to="/schedule"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                '/schedule'
              )}`}
            >
              <Calendar size={20} />
              <span>Full Schedule</span>
            </Link>
          </div>
          {/* ADMIN SECTION */}
          {userRole === 'ADMIN' && (
            <div className="pt-4 mt-4 border-t border-slate-800">
              <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">
                Administration
              </p>

              <Link
                to="/services"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                  '/services'
                )}`}
              >
                <List size={20} />
                <span>Services</span>
              </Link>

              <Link
                to="/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                  '/users'
                )}`}
              >
                <Users size={20} />
                <span>User Management</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 w-full transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h2 className="font-semibold text-slate-700">Admin Panel</h2>

          {/* DYNAMIC USER PROFILE */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
