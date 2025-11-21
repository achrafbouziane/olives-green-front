import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layout/public-layout';
import { HomePage } from './pages/home-page';
import { ServiceDetailPage } from './pages/service-detail';
import { EstimateApprovalPage } from './pages/estimate-approval';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all pages in the PublicLayout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services/:slug" element={<ServiceDetailPage />} />
          <Route path="estimate/:id" element={<EstimateApprovalPage />} />
          {/* You can easily add more pages here later, e.g., About, Contact */}
          <Route path="*" element={<div className="p-20 text-center">404 - Page Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}