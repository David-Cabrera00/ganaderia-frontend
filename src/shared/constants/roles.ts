import type { Role } from '@/types';

export const ROLE_LABELS: Record<Role, string> = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador',
  TECNICO: 'Técnico',
};

export const ROLE_OPTIONS = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'TECNICO', label: 'Técnico' },
] as const satisfies ReadonlyArray<{ value: Role; label: string }>;

export const ROLE_GROUPS = {
  all: ['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR', 'TECNICO'],
  operational: ['ADMINISTRADOR', 'SUPERVISOR', 'OPERADOR'],
  management: ['ADMINISTRADOR', 'SUPERVISOR'],
  adminOnly: ['ADMINISTRADOR'],
} as const satisfies Record<string, readonly Role[]>;
