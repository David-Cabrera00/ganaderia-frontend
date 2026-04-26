import type { ReactNode } from 'react';

interface GeofencesMapPlaceholderProps {
  children?: ReactNode;
}

export function GeofencesMapPlaceholder({ children }: GeofencesMapPlaceholderProps) {
  return <div>{children}</div>;
}
