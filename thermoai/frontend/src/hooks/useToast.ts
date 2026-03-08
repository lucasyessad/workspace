"use client";
import { useState, useCallback, useContext, createContext, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Hook for leaf components — requires ToastProvider ancestor. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;

  // Fallback: local state (used when ToastProvider is not present — e.g. in tests)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [toasts, setToasts] = useState<Toast[]>([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const removeToast = useCallback(
    (id: string) => setToasts((t) => t.filter((x) => x.id !== id)),
    []
  );
  return { toasts, addToast, removeToast };
}
