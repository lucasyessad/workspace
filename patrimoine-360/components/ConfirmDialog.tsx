"use client";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  icon?: ReactNode;
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  icon,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-desc"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="surface-elevated p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                variant === "danger" ? "bg-danger-500/10" : "bg-warning-500/10"
              }`}>
                {icon || <AlertTriangle size={20} className={variant === "danger" ? "text-danger-500" : "text-warning-500"} />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="confirm-title" className="text-heading font-serif text-[var(--color-text-primary)]">{title}</h3>
                <p id="confirm-desc" className="text-body-sm text-[var(--color-text-tertiary)] mt-1">{description}</p>
              </div>
              <button
                onClick={onCancel}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition flex-shrink-0"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={onCancel} className="btn-ghost text-sm">
                {cancelLabel}
              </button>
              <button
                onClick={() => { onConfirm(); onCancel(); }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                  variant === "danger"
                    ? "bg-danger-500 hover:bg-danger-600 text-white"
                    : "bg-warning-500 hover:bg-warning-600 text-white"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
