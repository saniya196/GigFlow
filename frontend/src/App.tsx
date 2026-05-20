import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LeadsPage } from './pages/LeadsPage';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
         <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/dashboard" element={<Navigate to="/leads" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '14px',
            fontSize: '14px',
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid rgba(148, 163, 184, 0.25)',
          },
        }}
      />
    </QueryClientProvider>
  );
};
