import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login    from './pages/Login';
import Register from './pages/Register';
import PWAInstallBanner from './components/common/PWAInstallBanner';

// Lazy-loaded protected pages
import { lazy, Suspense } from 'react';
const Dashboard  = lazy(() => import('./pages/Dashboard'));
const Products   = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const StockEntry = lazy(() => import('./pages/StockEntry'));
const Calendar   = lazy(() => import('./pages/Calendar'));
const Analytics  = lazy(() => import('./pages/Analytics'));
const AuditLogPage = lazy(() => import('./pages/AuditLog'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent
                    rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/products"   element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/stock"      element={<StockEntry />} />
          <Route path="/calendar"   element={<Calendar />} />
          <Route path="/analytics"  element={<Analytics />} />
          <Route path="/audit" element={<AuditLogPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PWAInstallBanner />
    </Suspense>
  );
}