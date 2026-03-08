"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Copy, RotateCcw, Check } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getModule } from "@/lib/modules";
import { getPromptConfig } from "@/lib/prompts";
import { calculate } from "@/lib/calculators";
import { FormData as FData, CalculationResult, HistoryEntry } from "@/types";
import ModuleForm from "@/components/ModuleForm";
import LocalCalculations from "@/components/LocalCalculations";
import AIResult from "@/components/AIResult";
import ExportButtons from "@/components/ExportButtons";
import Sidebar from "@/components/Sidebar";
import HistoryPanel from "@/components/HistoryPanel";
import ThemeToggle from "@/components/ThemeToggle";
import Breadcrumb from "@/components/Breadcrumb";
import ErrorBoundary from "@/components/ErrorBoundary";
import MobileNav from "@/components/MobileNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/Toast";
import { useStreamingResponse } from "@/hooks/useStreamingResponse";
import { loadAppState, saveAppState } from "@/lib/storage";
import { trackEvent, Events } from "@/lib/analytics";

const Charts = dynamic(() => import("@/components/Charts"), { ssr: false });
const ScenariosPanel = dynamic(() => import("@/components/ScenariosPanel"), { ssr: false });

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export default function ModulePage() {
  const params = useParams();
  const moduleId = Number(params.id);
  const mod = getModule(moduleId);
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FData>({});
  const [calculations, setCalculations] = useState<CalculationResult[] | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { isStreaming, start: startStream } = useStreamingResponse({
    url: "/api/analyze",
    onComplete: (text) => {
      setAiResult(text);
      const state = loadAppState();
      if (!state.modules[moduleId]) state.modules[moduleId] = { formData, completed: false };
      state.modules[moduleId].aiResult = text;
      state.modules[moduleId].completed = true;

      const existingHistory = state.modules[moduleId].history || [];
      const entry: HistoryEntry = {
        date: new Date().toISOString(),
        formData: { ...formData },
        aiResult: text,
        calculationResults: calculations ? [...calculations] : undefined,
        version: existingHistory.length + 1,
        modelUsed: "claude-sonnet-4-20250514",
      };
      if (!state.modules[moduleId].history) state.modules[moduleId].history = [];
      state.modules[moduleId].history!.push(entry);

      trackEvent(Events.MODULE_ANALYSIS_COMPLETE, { moduleId });
      if (state.modules[moduleId].history!.length > 10) {
        state.modules[moduleId].history = state.modules[moduleId].history!.slice(-10);
      }
      setHistory(state.modules[moduleId].history!);
      saveAppState(state);
      setCompletedModules((prev) => [...new Set([...prev, moduleId])]);
      toast("Analyse terminée avec succès", "success");
    },
    onError: () => {
      toast("L'analyse a échoué. Veuillez réessayer.", "error");
    },
  });

  useEffect(() => {
    const state = loadAppState();
    const moduleState = state.modules[moduleId];
    if (moduleState) {
      setFormData(moduleState.formData || {});
      setAiResult(moduleState.aiResult || "");
      setHistory(moduleState.history || []);
    } else {
      setFormData({});
      setAiResult("");
      setHistory([]);
    }
    const completed = Object.entries(state.modules)
      .filter(([, v]) => v.completed)
      .map(([k]) => Number(k));
    setCompletedModules(completed);
  }, [moduleId]);

  useEffect(() => {
    if (mod?.hasCalculator) {
      setCalculations(calculate(moduleId, formData));
    }
  }, [formData, moduleId, mod?.hasCalculator]);

  useEffect(() => {
    const state = loadAppState();
    if (!state.modules[moduleId]) {
      state.modules[moduleId] = { formData: {}, completed: false };
    }
    state.modules[moduleId].formData = formData;
    saveAppState(state);
  }, [formData, moduleId]);

  const handleFieldChange = useCallback((id: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleAnalyze = async () => {
    setAiResult("");
    const text = await startStream({ moduleId, formData });
    if (text) setAiResult(text);
  };

  const handleCopyPrompt = () => {
    const cfg = getPromptConfig(moduleId);
    if (!cfg) return;
    navigator.clipboard.writeText(`${cfg.system}\n\n---\n\n${cfg.buildUserPrompt(formData)}`);
    setCopied(true);
    toast("Prompt copié dans le presse-papier", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData({}); setAiResult(""); setCalculations(null); setHistory([]);
    const state = loadAppState();
    delete state.modules[moduleId];
    saveAppState(state);
    setCompletedModules((prev) => prev.filter((id) => id !== moduleId));
    toast("Module réinitialisé", "info");
  };

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--color-text-tertiary)]">
        Module non trouvé. <Link href="/" className="ml-2 text-gold-500 hover:underline">Retour</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar completedModules={completedModules} />
      <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]" aria-label={`Module ${mod.id}: ${mod.title}`}>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div key={moduleId} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
              {/* Topbar */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <MobileNav completedModules={completedModules} />
                  <Breadcrumb items={[
                    { label: "Modules", href: "/" },
                    { label: `${String(mod.id).padStart(2, "0")} — ${mod.title}` },
                  ]} />
                </div>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>

              {/* Header */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-start gap-4">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-3xl" aria-hidden="true">{mod.icon}</motion.span>
                  <div>
                    <span className="text-overline text-gold-600 dark:text-gold-400">Module {String(mod.id).padStart(2, "0")} &middot; Style {mod.style}</span>
                    <h1 className="text-heading-xl font-serif text-[var(--color-text-primary)]">{mod.title}</h1>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mt-1">{mod.description}</p>
                  </div>
                </div>
              </motion.div>

              {/* Form */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-heading font-serif text-[var(--color-text-primary)] section-marker">Vos informations</h2>
                  <button onClick={() => setShowResetConfirm(true)} className="btn-ghost text-caption text-[var(--color-text-muted)]" aria-label="Réinitialiser le formulaire">
                    <RotateCcw size={12} /> Réinitialiser
                  </button>
                </div>
                <ModuleForm fields={mod.fields} formData={formData} onChange={handleFieldChange} />
              </motion.div>

              {/* Calculations */}
              {calculations && calculations.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
                  <LocalCalculations results={calculations} />
                </motion.div>
              )}

              {/* Charts */}
              {mod.hasCalculator && <div className="mb-8"><Charts moduleId={moduleId} formData={formData} calculations={calculations} /></div>}

              {/* Scenarios */}
              {[1, 2, 10].includes(moduleId) && Object.keys(formData).length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }} className="mb-8">
                  <ScenariosPanel formData={formData} moduleId={moduleId} />
                </motion.div>
              )}

              {/* History */}
              {history.length > 0 && <div className="mb-8"><HistoryPanel history={history} currentResults={calculations} /></div>}

              {/* Actions */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-3 mb-8">
                <button
                  onClick={handleAnalyze}
                  disabled={isStreaming}
                  className="btn-primary py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold-glow"
                  aria-busy={isStreaming}
                >
                  <Bot size={18} /> {isStreaming ? "Analyse en cours..." : "Lancer l'analyse IA complète"}
                </button>
                <button onClick={handleCopyPrompt} className="btn-secondary py-3" aria-label="Copier le prompt IA">
                  {copied ? <Check size={16} className="text-success-500" /> : <Copy size={16} />}
                  {copied ? "Copié !" : "Copier le prompt"}
                </button>
              </motion.div>

              {/* AI Result */}
              <AnimatePresence>
                {aiResult && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8">
                    <AIResult content={aiResult} isStreaming={isStreaming} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Export */}
              {(aiResult || (calculations && calculations.length > 0)) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12">
                  <ExportButtons moduleTitle={mod.title} moduleStyle={mod.style} formData={formData} calculations={calculations} aiResult={aiResult} />
                </motion.div>
              )}

              {/* Nav */}
              <nav className="flex justify-between items-center py-6 border-t border-[var(--color-border)]" aria-label="Navigation entre modules">
                {moduleId > 1 ? <Link href={`/module/${moduleId - 1}`} className="btn-ghost text-sm">&larr; Module {String(moduleId - 1).padStart(2, "0")}</Link> : <div />}
                {moduleId < 12 ? <Link href={`/module/${moduleId + 1}`} className="btn-ghost text-sm">Module {String(moduleId + 1).padStart(2, "0")} &rarr;</Link> : <div />}
              </nav>
            </motion.div>
          </AnimatePresence>

          {/* Modale de confirmation reset */}
          <ConfirmDialog
            open={showResetConfirm}
            onConfirm={handleReset}
            onCancel={() => setShowResetConfirm(false)}
            title="Réinitialiser le module"
            description="Toutes les données saisies, les résultats d'analyse et l'historique de ce module seront supprimés. Cette action est irréversible."
            confirmLabel="Réinitialiser"
            variant="danger"
          />
        </ErrorBoundary>
      </main>
    </div>
  );
}
