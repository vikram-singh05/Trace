import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, AdminRoute } from './ProtectedRoute';
import Landing from '../pages/Landing';

import Layout from '../components/layout/Layout';

// Everything below Landing is lazy-loaded, splitting the ~870KB single
// bundle into small per-route chunks so first load only ships what the
// landing page needs. Each import() becomes its own chunk automatically.
const Login         = lazy(() => import('../pages/auth/Login'));
const Register      = lazy(() => import('../pages/auth/Register'));
const Dashboard     = lazy(() => import('../pages/dashboard/Dashboard'));
const ReportItem    = lazy(() => import('../pages/items/ReportItem'));
const ItemDetail    = lazy(() => import('../pages/items/ItemDetail'));
const EditItem      = lazy(() => import('../pages/items/EditItem'));
const BrowseItems   = lazy(() => import('../pages/items/BrowseItems'));
const MyReports     = lazy(() => import('../pages/dashboard/MyReports'));
const MyClaims      = lazy(() => import('../pages/dashboard/MyClaims'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const Messages      = lazy(() => import('../pages/chat/Messages'));

// Legal Pages
const PrivacyPolicy = lazy(() => import('../pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('../pages/legal/TermsOfService'));
const Security       = lazy(() => import('../pages/legal/Security'));

/**
 * Shown briefly while a lazy route chunk downloads (typically instant on
 * a warm cache / fast connection, but present so navigation never looks broken).
 */
function RouteFallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-earth-50 dark:bg-earth-950 relative overflow-hidden">
      <div className="premium-bg" />
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-gold-500/25 animate-float border border-earth-200/50 dark:border-earth-700/50">
          <img src="/trace_logo.jpg" alt="Logo" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="w-32 h-1 bg-earth-200 dark:bg-earth-800 rounded-full overflow-hidden relative">
          <div className="absolute inset-0 skeleton" />
        </div>
      </div>
    </div>
  );
}

/**
 * AppRouter — central route definition file.
 *
 * Route groupings:
 * - Public:         Landing page, accessible to everyone
 * - GuestRoute:     Only accessible when NOT logged in (login, register)
 * - ProtectedRoute: Only accessible when logged in
 * - AdminRoute:     Only accessible when logged in AND role === ADMIN
 *
 * As phases are completed, import and add new page components here.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={<Landing />} />

        {/* Public Legal pages */}
        <Route element={<Layout />}>
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms"   element={<TermsOfService />} />
          <Route path="/security" element={<Security />} />
        </Route>

        {/* Guest-only routes (redirect to /dashboard if already logged in) */}
        <Route element={<GuestRoute />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected routes (redirect to /login if not authenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report"    element={<ReportItem />} />
            <Route path="/items"     element={<BrowseItems />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/items/:id/edit" element={<EditItem />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/my-claims"  element={<MyClaims />} />
            <Route path="/messages"   element={<Messages />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<AdminRoute />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Phase 9+ routes will be added here:
            <Route path="/admin/users"        element={<ManageUsers />} />
            <Route path="/admin/items"        element={<ManageItems />} />
            */}
          </Route>
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center text-center p-8 bg-earth-50 dark:bg-earth-950">
            <div>
              <p className="text-6xl mb-4">🔍</p>
              <h1 className="text-2xl font-bold text-earth-900 dark:text-earth-100 mb-2">Page not found</h1>
              <p className="text-earth-500 dark:text-earth-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 text-sm font-medium transition-colors">
                Go home →
              </a>
            </div>
          </div>
        } />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
