import type { ReactNode } from 'react';

interface LocationsFiltersProps {
  children?: ReactNode;
}

export function LocationsFilters({ children }: LocationsFiltersProps) {
  return <div>{children}</div>;
}
