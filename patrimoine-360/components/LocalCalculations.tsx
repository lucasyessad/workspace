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
      <h3 className="text-heading font-serif text-[var(--color-text-primary)] section-marker">
        Calculs instantanés
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((r, i) => {
          if (r.type === "score" && r.max) {
            return (
              <div key={i} className="col-span-1 flex justify-center surface-card p-4">
                <ScoreGauge value={Number(r.value)} max={r.max} label={r.label} color={r.color} />
              </div>
            );
          }
          if (r.type === "progress" && r.max) {
            return (
              <div key={i} className="col-span-full surface-card p-4">
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
