"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { OnboardingData, AppState } from "@/types";

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const steps = [
  {
    title: "Bienvenue sur Patrimoine 360°",
    subtitle: "Répondez à quelques questions pour pré-remplir automatiquement vos 12 modules",
    fields: [] as { id: keyof OnboardingData; label: string; type: string; placeholder: string; suffix?: string }[],
  },
  {
    title: "Votre profil",
    subtitle: "Informations de base",
    fields: [
      { id: "age" as keyof OnboardingData, label: "Votre âge", type: "number", placeholder: "35" },
      { id: "lieu_residence" as keyof OnboardingData, label: "Lieu de résidence", type: "text", placeholder: "Paris, France" },
      { id: "statut_fiscal" as keyof OnboardingData, label: "Statut fiscal", type: "text", placeholder: "Célibataire, Marié..." },
    ],
  },
  {
    title: "Vos revenus et dépenses",
    subtitle: "Flux mensuels",
    fields: [
      { id: "revenus_mensuels" as keyof OnboardingData, label: "Revenus mensuels nets", type: "number", placeholder: "5000", suffix: "€" },
      { id: "depenses_mensuelles" as keyof OnboardingData, label: "Dépenses mensuelles", type: "number", placeholder: "3500", suffix: "€" },
      { id: "revenus_annuels" as keyof OnboardingData, label: "Revenus annuels bruts", type: "number", placeholder: "60000", suffix: "€" },
    ],
  },
  {
    title: "Votre patrimoine",
    subtitle: "Actifs et passifs",
    fields: [
      { id: "epargne_totale" as keyof OnboardingData, label: "Épargne totale", type: "number", placeholder: "50000", suffix: "€" },
      { id: "investissements" as keyof OnboardingData, label: "Investissements", type: "number", placeholder: "30000", suffix: "€" },
      { id: "dettes_totales" as keyof OnboardingData, label: "Dettes totales", type: "number", placeholder: "15000", suffix: "€" },
    ],
  },
];

export default function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleChange = (id: string, value: string | number) => {
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const handleComplete = () => {
    onComplete({ ...data, completed: true } as OnboardingData);
  };

  const inputClass = "w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition font-sans text-sm";

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F1A] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-indigo-400" : i < step ? "w-4 bg-indigo-400/40" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {step === 0 && (
              <div className="mb-6">
                <Sparkles className="mx-auto text-indigo-400 mb-4" size={48} />
              </div>
            )}
            <h2 className="text-2xl font-serif font-bold text-white mb-2">{currentStep.title}</h2>
            <p className="text-gray-400 text-sm mb-8">{currentStep.subtitle}</p>

            {currentStep.fields.length > 0 && (
              <div className="space-y-4 text-left">
                {currentStep.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      {field.label}
                      {field.suffix && <span className="text-gray-500 ml-1 text-xs">({field.suffix})</span>}
                    </label>
                    <input
                      type={field.type}
                      className={`${inputClass} font-mono`}
                      placeholder={field.placeholder}
                      value={String(data[field.id] ?? "")}
                      onChange={(e) => handleChange(field.id, field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex items-center justify-between mt-8">
          <div>
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition">
                <ArrowLeft size={14} /> Précédent
              </button>
            ) : (
              <button onClick={onSkip} className="text-sm text-gray-500 hover:text-gray-300 transition">
                Passer
              </button>
            )}
          </div>
          <button
            onClick={isLast ? handleComplete : () => setStep(step + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition shadow-lg shadow-indigo-500/25"
          >
            {isLast ? (
              <>
                <Check size={16} /> Commencer
              </>
            ) : (
              <>
                Suivant <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Maps onboarding data to module form fields
export function mapOnboardingToModules(data: OnboardingData): Record<number, Record<string, string | number>> {
  const { age, revenus_mensuels, depenses_mensuelles, epargne_totale, dettes_totales, investissements, revenus_annuels, statut_fiscal, lieu_residence } = data;

  return {
    1: {
      ...(age !== undefined && { age }),
      ...(revenus_mensuels !== undefined && { revenus: revenus_mensuels }),
      ...(depenses_mensuelles !== undefined && { depenses: depenses_mensuelles }),
      ...(epargne_totale !== undefined && { epargne: epargne_totale }),
      ...(dettes_totales !== undefined && { dettes: dettes_totales }),
      ...(investissements !== undefined && { investissements }),
    },
    2: {
      ...(age !== undefined && { age }),
      ...(revenus_annuels !== undefined && { revenus_annuels }),
    },
    3: {
      ...(age !== undefined && { age }),
      ...(investissements !== undefined && { actifs_investissables: investissements }),
    },
    4: {
      ...(statut_fiscal !== undefined && { statut_fiscal }),
      ...(lieu_residence !== undefined && { lieu_residence }),
    },
    5: {
      ...(revenus_mensuels !== undefined && { revenu_mensuel: revenus_mensuels }),
    },
    6: {
      ...(revenus_mensuels !== undefined && { revenu_mensuel: revenus_mensuels }),
      ...(depenses_mensuelles !== undefined && { depenses_mensuelles }),
      ...(epargne_totale !== undefined && { epargne_urgence: epargne_totale }),
    },
    7: {
      ...(revenus_annuels !== undefined && { revenus_annuels }),
    },
    8: {
      ...(lieu_residence !== undefined && { lieu_residence }),
      ...(revenus_annuels !== undefined && { revenus_foyer: revenus_annuels }),
    },
    9: {
      ...(lieu_residence !== undefined && { lieu_residence }),
    },
    11: {
      ...(revenus_mensuels !== undefined && { revenu_mensuel: revenus_mensuels }),
    },
    12: {
      ...(age !== undefined && { age }),
      ...(revenus_annuels !== undefined && { revenus_annuels }),
      ...(epargne_totale !== undefined && investissements !== undefined && dettes_totales !== undefined && { patrimoine_net: epargne_totale + investissements - dettes_totales }),
    },
  };
}
