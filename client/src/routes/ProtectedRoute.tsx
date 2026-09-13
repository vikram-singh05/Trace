import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── ProtectedRoute ────────────────────────────────────────────────

/**
 * Wraps routes that require authentication.
 * Redirects to /login if the user is not authenticated.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 */
export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // While the initial /auth/me check is running, show nothing.
  // This prevents the login page from flashing briefly on refresh.
  if (isLoading) return null;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── AdminRoute ────────────────────────────────────────────────────

/**
 * Wraps routes that require the ADMIN role.
 * Redirects to /dashboard if authenticated but not an admin.
 */
export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

// ── GuestRoute ────────────────────────────────────────────────────

/**
 * Wraps routes that should only be accessible to unauthenticated users.
 * Redirects logged-in users away from /login and /register.
 */
export const GuestRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
