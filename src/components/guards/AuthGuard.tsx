import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const location = useLocation();

  const isAuthenticated =
    !!session?.token && Date.now() < session.expiresAt;

  if (!isAuthenticated) {
    if (session && Date.now() >= session.expiresAt) {
      clearSession();
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}