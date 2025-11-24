import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLayout } from './layout/admin-layout';
import { QuoteList } from './pages/quote-list';
import { QuoteDetail } from './pages/quote-detail';
import { CreateQuotePage } from './pages/create-quote-page'; // <--- IMPORT THIS
import { ServiceList } from './pages/service-list';
import { ServiceEditor } from './pages/service-editor';
import { ServiceDashboard } from './pages/service-dashboard'; // Ensure this is imported too if you use it
import { UserList } from './pages/user-list';
import { LoginPage } from './pages/login-page';
import { ProtectedRoute } from './components/protected-route';
import { JobList } from './pages/job-list';
import { SchedulePage } from './pages/schedule-page';
import { JobDetail } from './pages/job-detail';

function DashboardHome() {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold text-slate-800">Welcome, Admin</h2>
      <p className="text-slate-500 mt-2">
        Select a module from the sidebar to get started.
      </p>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']} />}>
          <Route path="/" element={<AdminLayout />}>
            <Route path="jobs" element={<JobList />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="jobs/:id" element={<JobDetail />} />
          </Route>
        </Route>

        {/* Protected Routes: Only 'ADMIN' role can access */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN','EMPLOYEE']} />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardHome />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="quotes" element={<QuoteList />} />
            <Route path="quotes/new" element={<CreateQuotePage />} />
            {/* <--- ADD THIS ROUTE */}
            <Route path="quotes/:id" element={<QuoteDetail />} />
            <Route path="services" element={<ServiceList />} />
            <Route path="services/new" element={<ServiceEditor />} />
            {/* Updated Dashboard Route from previous step */}
            <Route path="services/:slug" element={<ServiceDashboard />} />
            {/* Legacy Edit Route (optional, as Dashboard covers it) */}
            <Route path="services/:slug/edit" element={<ServiceEditor />} />
            <Route path="users" element={<UserList />} />
            <Route
              path="*"
              element={<div className="p-20 text-center">Page Not Found</div>}
            />
          </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
