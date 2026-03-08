"use client";
import { CalculationResult } from "@/types";
import MetricCard from "./MetricCard";
import ScoreGauge from "./ScoreGauge";
import ProgressBar from "./ProgressBar";
import { motion } from "framer-motion";

interface LocalCalculationsProps {
  results: CalculationResult[];
}

export default function LocalCalculations({ results }: LocalCalculationsProps) {
  if (!results || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
        <span className="w-1 h-5 bg-indigo-500 rounded-full" />
        Calculs instantanés
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r, i) => {
          if (r.type === "score" && r.max) {
            return (
              <div key={i} className="col-span-1 flex justify-center rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <ScoreGauge value={Number(r.value)} max={r.max} label={r.label} color={r.color} />
              </div>
            );
          }
          if (r.type === "progress" && r.max) {
            return (
              <div key={i} className="col-span-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <ProgressBar value={Number(r.value)} max={r.max} label={r.label} suffix={r.suffix} color={r.color} />
              </div>
            );
          }
          return (
            <MetricCard key={i} label={r.label} value={r.value} suffix={r.suffix} color={r.color} />
          );
        })}
      </div>
    </motion.div>
  );
}
