"use client";
import { motion } from "framer-motion";
import { AppState } from "@/types";
import { computeGlobalScore, GlobalScore } from "@/lib/score-global";

interface ScoreGlobalProps {
  appState: AppState;
}

const levelColors: Record<GlobalScore["level"], string> = {
  critique: "text-danger-500 dark:text-danger-400",
  fragile: "text-warning-600 dark:text-warning-400",
  correct: "text-warning-500 dark:text-warning-400",
  bon: "text-success-500 dark:text-success-400",
  excellent: "text-success-600 dark:text-success-400",
};

const levelStroke: Record<GlobalScore["level"], string> = {
  critique: "#ef4444",
  fragile: "#f59e0b",
  correct: "#eab308",
  bon: "#22c55e",
  excellent: "#16a34a",
};

const levelLabels: Record<GlobalScore["level"], string> = {
  critique: "Critique",
  fragile: "Fragile",
  correct: "Correct",
  bon: "Bon",
  excellent: "Excellent",
};

export default function ScoreGlobal({ appState }: ScoreGlobalProps) {
  const result = computeGlobalScore(appState);

  if (!result) {
    return (
      <div className="surface-card p-6 text-center">
        <p className="text-body-sm text-[var(--color-text-tertiary)]">
          Remplis au moins un module pour voir ton score de santé financière.
        </p>
      </div>
    );
  }

  const { score, level, breakdown } = result;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="surface-card p-6">
      <h3 className="text-heading font-serif text-[var(--color-text-primary)] mb-4 section-marker">
        Score de santé financière
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Gauge */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle cx="70" cy="70" r="60" fill="none" stroke="var(--color-border)" strokeWidth="10" />
            <motion.circle
              cx="70" cy="70" r="60" fill="none"
              strokeWidth="10" strokeLinecap="round"
              stroke={levelStroke[level]}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-[var(--color-text-primary)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className={`text-xs font-medium ${levelColors[level]}`}>
              {levelLabels[level]}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 w-full space-y-3">
          {breakdown.map((item, i) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-caption text-[var(--color-text-tertiary)]">{item.category}</span>
                <span className="text-caption font-mono text-[var(--color-text-secondary)]">{item.score}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-surface-active)] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    item.score >= 70 ? "bg-gradient-to-r from-success-500 to-success-600" :
                    item.score >= 50 ? "bg-gradient-to-r from-warning-400 to-warning-500" :
                    "bg-gradient-to-r from-danger-400 to-danger-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                />
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{item.comment}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
