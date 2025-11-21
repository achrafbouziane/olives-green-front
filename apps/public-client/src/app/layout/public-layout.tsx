import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* 1. Fixed Header */}
      <Navbar />

      {/* 2. Dynamic Page Content */}
      {/* The 'Outlet' renders whatever child route is currently active (Home, Details, etc.) */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* 3. Fixed Footer */}
      <Footer />
    </div>
  );
}