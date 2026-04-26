import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'btn',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
