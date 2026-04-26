import type { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#19221b',
            color: '#f5f7f2',
            border: '1px solid #2f4733',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#4caf50', secondary: '#19221b' },
          },
          error: {
            iconTheme: { primary: '#ef5350', secondary: '#19221b' },
          },
        }}
      />
    </>
  );
}
