import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore, isSessionValid } from '../../stores/authStore';

interface GuestGuardProps {
  children: ReactNode;
}

/**
 * GuestGuard wraps public routes (like /login).
 * If the user already has a valid session, redirect them to the dashboard
 * instead of showing the login page again.
 *
 * This is what fixes the "press back and see login again" bug.
 * The login route is guarded so authenticated users CANNOT access it.
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated && isSessionValid()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
