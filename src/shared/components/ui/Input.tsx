import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('form-input', className)} {...props} />;
}
