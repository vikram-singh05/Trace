import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

/**
 * TanStack Query client configuration.
 *
 * retry: 1     — retry failed requests once (not on 401/403/404)
 * staleTime:   — data stays "fresh" for 60s before background refetch
 * refetchOnWindowFocus — refetch when user returns to the tab
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        // Don't retry on auth or not-found errors
        const err = error as { error?: { code?: string } };
        const noRetryCode = ['UNAUTHENTICATED', 'FORBIDDEN', 'NOT_FOUND'];
        if (err?.error?.code && noRetryCode.includes(err.error.code)) return false;
        return failureCount < 1;
      },
      staleTime: 30_000, // 30s — revisited data renders instantly from cache; mutations still invalidate to stay fresh
      refetchOnWindowFocus: true,
    },
  },
});

import { ThemeProvider } from './context/ThemeContext';

/**
 * App — root component.
 *
 * Provider order matters:
 * 1. ThemeProvider        — handles dark/light mode CSS class
 * 2. QueryClientProvider  — must wrap everything (TanStack Query)
 * 3. AuthProvider         — uses queryClient internally for cache operations
 * 4. AppRouter            — uses AuthContext for route guards
 */
export default function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
