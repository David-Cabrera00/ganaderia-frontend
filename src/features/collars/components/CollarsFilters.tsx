import type { ReactNode } from 'react';

interface CollarsFiltersProps {
  children?: ReactNode;
}

export function CollarsFilters({ children }: CollarsFiltersProps) {
  return <div>{children}</div>;
}
