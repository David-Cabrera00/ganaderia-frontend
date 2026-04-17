import { useCallback, useState } from "react";

export interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "info") => {
      setToast({ message, type });

      window.setTimeout(() => {
        setToast(null);
      }, 3000);
    },
    [],
  );

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    clearToast,
  };
};