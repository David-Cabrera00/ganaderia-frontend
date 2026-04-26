import type { ReactNode } from 'react';

interface UsersToolbarProps {
  children?: ReactNode;
}

export function UsersToolbar({ children }: UsersToolbarProps) {
  return <div>{children}</div>;
}
