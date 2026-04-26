import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...props} />;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: ReactNode;
  actions?: ReactNode;
}

export function CardHeader({ title, actions, className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn('card-header', className)} {...props}>
      {title ? <span className="card-title">{title}</span> : children}
      {actions}
    </div>
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('card-title', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card-body', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('modal-footer', className)} {...props} />;
}
