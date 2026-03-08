"use client";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const colorMap = {
  success: "text-success-500 dark:text-success-400",
  warning: "text-warning-500 dark:text-warning-400",
  danger: "text-danger-500 dark:text-danger-400",
  accent: "text-gold-600 dark:text-gold-400",
};

const borderMap = {
  success: "border-success-500/20",
  warning: "border-warning-500/20",
  danger: "border-danger-500/20",
  accent: "border-gold-500/20",
};

export default function MetricCard({ label, value, suffix, color = "accent" }: MetricCardProps) {
  const formatted = typeof value === "number"
    ? value.toLocaleString("fr-FR")
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`surface-card ${borderMap[color]} p-4`}
    >
      <p className="text-caption uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">{label}</p>
      <p className={`text-xl font-mono font-semibold ${colorMap[color]}`}>
        {formatted}
        {suffix && <span className="text-sm ml-1 text-[var(--color-text-tertiary)]">{suffix}</span>}
      </p>
    </motion.div>
  );
}
