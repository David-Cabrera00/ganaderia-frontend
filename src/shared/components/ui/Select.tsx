import type { Option } from '@/shared/types/common.types';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  placeholder?: string;
}

export function Select({ options, placeholder, className, ...props }: SelectProps) {
  return (
    <select className={cn('form-select', className)} {...props}>
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={String(option.value)} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
