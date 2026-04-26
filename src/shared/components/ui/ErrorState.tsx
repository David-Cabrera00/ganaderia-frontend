import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="empty-state">
      <AlertTriangle size={30} className="empty-state-icon" />
      <strong>No se pudo cargar la información</strong>
      <span className="empty-state-text">{message}</span>
      {onRetry ? (
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
