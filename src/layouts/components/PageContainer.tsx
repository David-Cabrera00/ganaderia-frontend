import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('page-body section-gap', className)} {...props} />;
}
