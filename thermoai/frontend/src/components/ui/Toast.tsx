"use client";
import { Toast, ToastType } from "@/hooks/useToast";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const config: Record<ToastType, { icon: React.ElementType; classes: string }> = {
  success: { icon: CheckCircle, classes: "bg-green-50 border-green-200 text-green-800" },
  error:   { icon: XCircle,     classes: "bg-red-50 border-red-200 text-red-800" },
  warning: { icon: AlertCircle, classes: "bg-amber-50 border-amber-200 text-amber-800" },
  info:    { icon: Info,        classes: "bg-blue-50 border-blue-200 text-blue-800" },
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { icon: Icon, classes } = config[toast.type];
  return (
    <div className={cn("flex items-start gap-3 p-3 pr-2 rounded-lg border shadow-md text-sm max-w-sm", classes)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
