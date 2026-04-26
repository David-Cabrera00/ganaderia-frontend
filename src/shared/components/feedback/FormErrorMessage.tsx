import { AlertCircle } from 'lucide-react';

interface FormErrorMessageProps {
  message?: string | null;
}

export function FormErrorMessage({ message }: FormErrorMessageProps) {
  if (!message) return null;

  return (
    <span className="form-error">
      <AlertCircle size={12} />
      {message}
    </span>
  );
}
