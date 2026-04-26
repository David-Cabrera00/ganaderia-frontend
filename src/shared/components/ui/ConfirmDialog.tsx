import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  title = 'Confirmar acción',
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onClose,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
    </Modal>
  );
}
