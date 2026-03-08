"use client";
import { motion } from "framer-motion";
import { AppState } from "@/types";
import { computeGlobalScore, GlobalScore } from "@/lib/score-global";

interface ScoreGlobalProps {
  appState: AppState;
}

const levelColors: Record<GlobalScore["level"], string> = {
  critique: "text-red-400",
  fragile: "text-orange-400",
  correct: "text-yellow-400",
  bon: "text-green-400",
  excellent: "text-emerald-400",
};

const levelLabels: Record<GlobalScore["level"], string> = {
  critique: "Critique",
  fragile: "Fragile",
  correct: "Correct",
  bon: "Bon",
  excellent: "Excellent",
};

const levelGradient: Record<GlobalScore["level"], string> = {
  critique: "from-red-500 to-red-600",
  fragile: "from-orange-500 to-orange-600",
  correct: "from-yellow-500 to-yellow-600",
  bon: "from-green-500 to-green-600",
  excellent: "from-emerald-500 to-emerald-600",
};

export default function ScoreGlobal({ appState }: ScoreGlobalProps) {
  const result = computeGlobalScore(appState);

  if (!result) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-gray-500">
          Remplis au moins un module pour voir ton score de santé financière.
        </p>
      </div>
    );
  }

  const { score, level, breakdown } = result;
  const circumference = 2 * Math.PI * 60;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
      <h3 className="text-lg font-serif font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-indigo-500 rounded-full" />
        Score de santé financière
      </h3>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Gauge */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <motion.circle
              cx="70" cy="70" r="60" fill="none"
              strokeWidth="10" strokeLinecap="round"
              className={`stroke-current ${levelColors[level]}`}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-3xl font-bold text-white"
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
                <span className="text-xs text-gray-400">{item.category}</span>
                <span className="text-xs font-mono text-gray-300">{item.score}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    item.score >= 70 ? "from-green-500 to-emerald-500" :
                    item.score >= 50 ? "from-yellow-500 to-orange-500" :
                    "from-red-500 to-red-600"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5">{item.comment}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
