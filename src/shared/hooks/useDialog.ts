import { useState } from 'react';

export function useDialog(initialState = false) {
  const [open, setOpen] = useState(initialState);

  return {
    open,
    setOpen,
    onOpen: () => setOpen(true),
    onClose: () => setOpen(false),
    onToggle: () => setOpen((current) => !current),
  };
}
