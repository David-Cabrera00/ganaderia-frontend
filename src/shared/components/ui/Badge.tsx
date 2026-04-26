import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface BadgeProps {
  children: ReactNode;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
  className?: string;
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return <span className={cn('badge', `badge-${variant}`, className)}>{children}</span>;
}
