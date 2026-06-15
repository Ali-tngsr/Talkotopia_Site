"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastType = "success" | "error";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  error: (message: string) => void;
  success: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    nextToastId += 1;
    const id = nextToastId;

    setToasts((current) => [...current, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        error: (message) => showToast("error", message),
        success: (message) => showToast("success", message),
      }}
    >
      {children}
      <div aria-live="polite" className="toast-container">
        {toasts.map((toast) => (
          <div
            className={`toast ${
              toast.type === "success" ? "toast-success" : "toast-error"
            }`}
            key={toast.id}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
