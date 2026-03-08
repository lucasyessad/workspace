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
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
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
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                    compareIdx === i ? "bg-indigo-500/10 border border-indigo-500/30" : "bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                  onClick={() => setCompareIdx(compareIdx === i ? null : i)}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  {entry.calculationResults && entry.calculationResults.length > 0 && (
                    <span className="text-xs font-mono text-gray-500">
                      {entry.calculationResults.filter((r) => r.type === "score").map((r) => `${r.value}/${r.max}`).join(" ")}
                    </span>
                  )}
                </div>
              ))}

              {/* Comparison view */}
              {compareEntry && compareEntry.calculationResults && currentResults && (
                <div className="mt-4 pt-4 border-t border-white/[0.08]">
                  <h4 className="text-sm font-medium text-indigo-400 mb-3">Comparaison avec l&apos;analyse du {new Date(compareEntry.date).toLocaleDateString("fr-FR")}</h4>
                  <div className="space-y-2">
                    {currentResults.map((curr, i) => {
                      const prev = compareEntry.calculationResults?.find((r) => r.label === curr.label);
                      if (!prev || typeof curr.value !== "number" || typeof prev.value !== "number") return null;
                      const diff = curr.value - prev.value;
                      const pctChange = prev.value !== 0 ? (diff / Math.abs(prev.value)) * 100 : 0;
                      return (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{curr.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-mono">{prev.value.toLocaleString("fr-FR")}</span>
                            <span className="text-gray-600">→</span>
                            <span className="text-white font-mono">{curr.value.toLocaleString("fr-FR")}</span>
                            <span className={`text-xs font-mono ${diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-gray-500"}`}>
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
