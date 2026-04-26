import type { ReactNode } from 'react';

interface CowsFiltersProps {
  children?: ReactNode;
}

export function CowsFilters({ children }: CowsFiltersProps) {
  return <div>{children}</div>;
}
