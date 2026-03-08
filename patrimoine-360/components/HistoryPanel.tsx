"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { HistoryEntry, CalculationResult } from "@/types";

interface HistoryPanelProps {
  history: HistoryEntry[];
  currentResults?: CalculationResult[] | null;
}

export default function HistoryPanel({ history, currentResults }: HistoryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);

  if (!history || history.length === 0) return null;

  const compareEntry = compareIdx !== null ? history[compareIdx] : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-body-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition"
      >
        <History size={14} />
        Historique ({history.length} analyse{history.length > 1 ? "s" : ""})
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="surface-card p-4 space-y-3">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                    compareIdx === i
                      ? "bg-gold-500/10 border border-gold-500/30"
                      : "bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-transparent"
                  }`}
                  onClick={() => setCompareIdx(compareIdx === i ? null : i)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-[var(--color-text-muted)]" />
                    <span className="text-body-sm text-[var(--color-text-secondary)]">
                      {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {entry.calculationResults && entry.calculationResults.length > 0 && (
                    <span className="text-caption font-mono text-[var(--color-text-muted)]">
                      {entry.calculationResults.filter((r) => r.type === "score").map((r) => `${r.value}/${r.max}`).join(" ")}
                    </span>
                  )}
                </div>
              ))}

              {compareEntry && compareEntry.calculationResults && currentResults && (
                <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
                  <h4 className="text-body-sm font-medium text-gold-600 dark:text-gold-400 mb-3">Comparaison avec l&apos;analyse du {new Date(compareEntry.date).toLocaleDateString("fr-FR")}</h4>
                  <div className="space-y-2">
                    {currentResults.map((curr, i) => {
                      const prev = compareEntry.calculationResults?.find((r) => r.label === curr.label);
                      if (!prev || typeof curr.value !== "number" || typeof prev.value !== "number") return null;
                      const diff = curr.value - prev.value;
                      const pctChange = prev.value !== 0 ? (diff / Math.abs(prev.value)) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center justify-between text-body-sm">
                          <span className="text-[var(--color-text-tertiary)]">{curr.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[var(--color-text-muted)] font-mono">{prev.value.toLocaleString("fr-FR")}</span>
                            <span className="text-[var(--color-text-muted)]">&rarr;</span>
                            <span className="text-[var(--color-text-primary)] font-mono">{curr.value.toLocaleString("fr-FR")}</span>
                            <span className={`text-caption font-mono ${diff > 0 ? "text-success-500" : diff < 0 ? "text-danger-500" : "text-[var(--color-text-muted)]"}`}>
                              {diff > 0 ? "+" : ""}{Math.round(pctChange)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
