"use client";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  suffix?: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const barColors = {
  success: "bg-green-400",
  warning: "bg-yellow-400",
  danger: "bg-red-400",
  accent: "bg-indigo-400",
};

export default function ProgressBar({ value, max, label, suffix, color = "accent" }: ProgressBarProps) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono text-white">{value}{suffix}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColors[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
