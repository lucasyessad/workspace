"use client";
import { motion } from "framer-motion";

interface ScoreGaugeProps {
  value: number;
  max: number;
  label: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const colorMap = {
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  accent: "#e5b044",
};

export default function ScoreGauge({ value, max, label, color = "accent" }: ScoreGaugeProps) {
  const pct = Math.min(100, (value / max) * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const strokeColor = colorMap[color];

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-mono font-bold text-[var(--color-text-primary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value}
          </motion.span>
          <span className="text-xs text-[var(--color-text-tertiary)]">/ {max}</span>
        </div>
      </div>
      <span className="text-sm text-[var(--color-text-secondary)] text-center">{label}</span>
    </div>
  );
}
