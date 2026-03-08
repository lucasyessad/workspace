"use client";
import { motion } from "framer-motion";

interface MetricCardProps {
  label: string;
  value: string | number;
  suffix?: string;
  color?: "success" | "warning" | "danger" | "accent";
}

const colorMap = {
  success: "text-green-400",
  warning: "text-yellow-400",
  danger: "text-red-400",
  accent: "text-indigo-400",
};

const bgMap = {
  success: "border-green-500/20",
  warning: "border-yellow-500/20",
  danger: "border-red-500/20",
  accent: "border-indigo-500/20",
};

export default function MetricCard({ label, value, suffix, color = "accent" }: MetricCardProps) {
  const formatted = typeof value === "number"
    ? value.toLocaleString("fr-FR")
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${bgMap[color]} bg-white/[0.02] p-4`}
    >
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-mono font-semibold ${colorMap[color]}`}>
        {formatted}
        {suffix && <span className="text-sm ml-1 text-gray-400">{suffix}</span>}
      </p>
    </motion.div>
  );
}
