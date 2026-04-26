import type { ReactNode } from 'react';

interface AlertsFiltersProps {
  children?: ReactNode;
}

export function AlertsFilters({ children }: AlertsFiltersProps) {
  return <div>{children}</div>;
}
