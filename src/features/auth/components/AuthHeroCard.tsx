import type { ReactNode } from 'react';

interface AuthHeroCardProps {
  children?: ReactNode;
}

export function AuthHeroCard({ children }: AuthHeroCardProps) {
  return <div>{children}</div>;
}
