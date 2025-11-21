import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Settings,
  LogOut,
  Leaf,
  List,
  Users,
} from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();
  // Helper to highlight active tabs, including sub-routes (e.g. /services/new)
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

        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
              '/'
            )}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/quotes"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
              '/quotes'
            )}`}
          >
            <FileText size={20} />
            <span>Quote Requests</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-slate-800">
            <p className="px-4 text-xs font-bold text-slate-500 uppercase mb-2">
              Content
            </p>

            {/* Updated to point to the list view */}
            <Link
              to="/services"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                '/services'
              )}`}
            >
              <List size={20} />
              <span>Manage Services</span>
            </Link>
            <Link
              to="/users"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive(
                '/users'
              )}`}
            >
              <Users size={20} />
              <span>Team</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 w-full">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white shadow-sm border-b border-slate-200 h-16 flex items-center justify-between px-8">
          <h2 className="font-semibold text-slate-700">Admin Panel</h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">Administrator</p>
              <p className="text-xs text-slate-500">manager@OlivesGreen.com</p>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full border-2 border-white shadow-sm"></div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
