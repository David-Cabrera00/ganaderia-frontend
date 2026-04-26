import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { Role } from '../../types';

interface RoleGuardProps {
  children: ReactNode;
  roles: Role[];
}

export function RoleGuard({ children, roles }: RoleGuardProps) {
  const { hasAnyRole } = useAuthStore();

  if (!hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
