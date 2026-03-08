"use client";
import { useState, useCallback, useContext, ReactNode } from "react";
import { ToastContext, Toast, ToastType } from "@/hooks/useToast";
import { ToastContainer } from "./Toast";

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return {
    ...ctx,
    success: (message: string) => ctx.addToast(message, "success"),
    error: (message: string) => ctx.addToast(message, "error"),
    warning: (message: string) => ctx.addToast(message, "warning"),
    info: (message: string) => ctx.addToast(message, "info"),
  };
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
