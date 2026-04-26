import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('form-textarea', className)} {...props} />;
}
