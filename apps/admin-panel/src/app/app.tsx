import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layout/admin-layout';
import { QuoteList } from './pages/quote-list';
import { QuoteDetail } from './pages/quote-detail';
import { ServiceList } from './pages/service-list';
import { ServiceEditor } from './pages/service-editor';
import { UserList } from './pages/user-list'; // Ensure UserList is imported
import { LoginPage } from './pages/login-page';
import { ProtectedRoute } from './components/protected-route';

function DashboardHome() {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold text-slate-800">Welcome, Admin</h2>
      <p className="text-slate-500 mt-2">Select a module from the sidebar to get started.</p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes: Only 'ADMIN' role can access */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<DashboardHome />} />
                
                <Route path="quotes" element={<QuoteList />} />
                <Route path="quotes/:id" element={<QuoteDetail />} />
                
                <Route path="services" element={<ServiceList />} />
                <Route path="services/new" element={<ServiceEditor />} />
                <Route path="services/:slug/edit" element={<ServiceEditor />} />

                <Route path="users" element={<UserList />} />
                
                <Route path="*" element={<div className="p-20 text-center">Page Not Found</div>} />
            </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}