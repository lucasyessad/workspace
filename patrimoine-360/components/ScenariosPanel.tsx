"use client";
import { motion } from "framer-motion";
import { FormData as FData } from "@/types";
import { computeScenarios, ScenarioResult } from "@/lib/scenarios";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScenariosPanelProps {
  formData: FData;
  moduleId: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  prudent: <TrendingDown size={16} className="text-blue-400" />,
  equilibre: <Minus size={16} className="text-yellow-400" />,
  offensif: <TrendingUp size={16} className="text-green-400" />,
};

const typeColors: Record<string, string> = {
  prudent: "border-blue-500/30 bg-blue-500/5",
  equilibre: "border-yellow-500/30 bg-yellow-500/5",
  offensif: "border-green-500/30 bg-green-500/5",
};

export default function ScenariosPanel({ formData, moduleId }: ScenariosPanelProps) {
  const scenarios = computeScenarios(formData, moduleId);

  if (scenarios.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-serif font-semibold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-purple-500 rounded-full" />
        Scénarios de projection
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario, i) => (
          <motion.div
            key={scenario.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-4 ${typeColors[scenario.type]}`}
          >
            <div className="flex items-center gap-2 mb-2">
              {typeIcons[scenario.type]}
              <h4 className="text-sm font-medium text-white">{scenario.label}</h4>
              <span className="ml-auto text-xs font-mono text-gray-400">{scenario.rendement}%/an</span>
            </div>

            <p className="text-xs text-gray-500 mb-3">{scenario.description}</p>

            <div className="text-2xl font-bold text-white mb-3">
              {scenario.capitalFinal.toLocaleString("fr-FR")} €
            </div>

            {/* Mini progression */}
            <div className="space-y-1">
              {scenario.projections.slice(0, 5).map((p, j) => (
                <div key={j} className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500 w-12">An {p.annee}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        scenario.type === "prudent" ? "bg-blue-500" :
                        scenario.type === "equilibre" ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${scenario.capitalFinal > 0 ? (p.montant / scenario.capitalFinal) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + j * 0.1 }}
                    />
                  </div>
                  <span className="text-gray-400 font-mono w-20 text-right">{p.montant.toLocaleString("fr-FR")}€</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
