import type { Role } from '@/types';
import { ROLE_LABELS } from '@/shared/constants/roles';

export const getRoleLabel = (role: Role) => ROLE_LABELS[role];

export const hasAnyRole = (currentRole: Role | null | undefined, roles: readonly Role[]) => {
  if (!currentRole) return false;
  return roles.includes(currentRole);
};
