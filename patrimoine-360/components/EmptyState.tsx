"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
      role="status"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-2xl bg-[var(--color-surface-active)] flex items-center justify-center mb-6 text-[var(--color-text-muted)]"
      >
        {icon}
      </motion.div>
      <h3 className="text-heading font-serif text-[var(--color-text-primary)] mb-2">{title}</h3>
      <p className="text-body-sm text-[var(--color-text-tertiary)] max-w-md mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {action && (
          action.href ? (
            <Link href={action.href} className="btn-primary">
              {action.label}
            </Link>
          ) : (
            <button onClick={action.onClick} className="btn-primary">
              {action.label}
            </button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href} className="btn-ghost text-sm">
              {secondaryAction.label}
            </Link>
          ) : (
            <button onClick={secondaryAction.onClick} className="btn-ghost text-sm">
              {secondaryAction.label}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
