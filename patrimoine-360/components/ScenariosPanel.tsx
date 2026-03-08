"use client";
import { motion } from "framer-motion";
import { FormData as FData } from "@/types";
import { computeScenarios } from "@/lib/scenarios";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScenariosPanelProps {
  formData: FData;
  moduleId: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  prudent: <TrendingDown size={16} className="text-navy-400" />,
  equilibre: <Minus size={16} className="text-gold-500" />,
  offensif: <TrendingUp size={16} className="text-success-500" />,
};

const typeColors: Record<string, string> = {
  prudent: "border-navy-500/30 bg-navy-500/5",
  equilibre: "border-gold-500/30 bg-gold-500/5",
  offensif: "border-success-500/30 bg-success-500/5",
};

const barTypeColors: Record<string, string> = {
  prudent: "bg-navy-500",
  equilibre: "bg-gold-500",
  offensif: "bg-success-500",
};

export default function ScenariosPanel({ formData, moduleId }: ScenariosPanelProps) {
  const scenarios = computeScenarios(formData, moduleId);

  if (scenarios.length === 0) return null;

  return (
    <div>
      <h3 className="text-heading font-serif text-[var(--color-text-primary)] mb-4 section-marker">
        Scénarios de projection
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, i) => (
          <motion.div
            key={scenario.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border p-4 ${typeColors[scenario.type]}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {typeIcons[scenario.type]}
              <h4 className="text-body-sm font-medium text-[var(--color-text-primary)]">{scenario.label}</h4>
              <span className="ml-auto text-caption font-mono text-[var(--color-text-tertiary)]">{scenario.rendement}%/an</span>
            </div>

            <p className="text-caption text-[var(--color-text-tertiary)] mb-3">{scenario.description}</p>

            <div className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">
              {scenario.capitalFinal.toLocaleString("fr-FR")} €
            </div>

            <div className="space-y-1">
              {scenario.projections.slice(0, 5).map((p, j) => (
                <div key={j} className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--color-text-muted)] w-12">An {p.annee}</span>
                  <div className="flex-1 h-1 rounded-full bg-[var(--color-surface-active)] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${barTypeColors[scenario.type]}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${scenario.capitalFinal > 0 ? (p.montant / scenario.capitalFinal) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + j * 0.1 }}
                    />
                  </div>
                  <span className="text-[var(--color-text-tertiary)] font-mono w-20 text-right">{p.montant.toLocaleString("fr-FR")}€</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
