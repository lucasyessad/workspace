"use client";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bot, Copy, RotateCcw, Check } from "lucide-react";
import Link from "next/link";
import { getModule } from "@/lib/modules";
import { getPromptConfig } from "@/lib/prompts";
import { calculate } from "@/lib/calculators";
import { FormData as FData, CalculationResult, AppState, HistoryEntry } from "@/types";
import ModuleForm from "@/components/ModuleForm";
import LocalCalculations from "@/components/LocalCalculations";
import AIResult from "@/components/AIResult";
import ExportButtons from "@/components/ExportButtons";
import Sidebar from "@/components/Sidebar";
import Charts from "@/components/Charts";
import HistoryPanel from "@/components/HistoryPanel";
import ScenariosPanel from "@/components/ScenariosPanel";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/components/ThemeProvider";
import { trackEvent, Events } from "@/lib/analytics";

function loadState(): AppState {
  try {
    const stored = localStorage.getItem("patrimoine360_state");
    if (stored) return JSON.parse(stored);
  } catch {}
  return { modules: {} };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem("patrimoine360_state", JSON.stringify(state));
  } catch {}
}

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

  const [formData, setFormData] = useState<FData>({});
  const [calculations, setCalculations] = useState<CalculationResult[] | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const state = loadState();
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
    const state = loadState();
    if (!state.modules[moduleId]) {
      state.modules[moduleId] = { formData: {}, completed: false };
    }
    state.modules[moduleId].formData = formData;
    saveState(state);
  }, [formData, moduleId]);

  const handleFieldChange = useCallback((id: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleAnalyze = async () => {
    setIsStreaming(true);
    setAiResult("");
    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, formData }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const err = await response.json();
        setAiResult(`**Erreur**: ${err.error || "Une erreur est survenue"}`);
        setIsStreaming(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) { accumulated += parsed.text; setAiResult(accumulated); }
              if (parsed.error) { accumulated += `\n\n**Erreur**: ${parsed.error}`; setAiResult(accumulated); }
            } catch {}
          }
        }
      }

      const state = loadState();
      if (!state.modules[moduleId]) state.modules[moduleId] = { formData, completed: false };
      state.modules[moduleId].aiResult = accumulated;
      state.modules[moduleId].completed = true;

      const existingHistory = state.modules[moduleId].history || [];
      const nextVersion = existingHistory.length + 1;

      const entry: HistoryEntry = {
        date: new Date().toISOString(),
        formData: { ...formData },
        aiResult: accumulated,
        calculationResults: calculations ? [...calculations] : undefined,
        version: nextVersion,
        modelUsed: "claude-sonnet-4-20250514",
      };
      if (!state.modules[moduleId].history) state.modules[moduleId].history = [];
      state.modules[moduleId].history!.push(entry);

      trackEvent(Events.MODULE_ANALYSIS_COMPLETE, { moduleId });
      if (state.modules[moduleId].history!.length > 10) {
        state.modules[moduleId].history = state.modules[moduleId].history!.slice(-10);
      }
      setHistory(state.modules[moduleId].history!);
      saveState(state);
      setCompletedModules((prev) => [...new Set([...prev, moduleId])]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAiResult(`**Erreur**: ${err.message}`);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyPrompt = () => {
    const cfg = getPromptConfig(moduleId);
    if (!cfg) return;
    navigator.clipboard.writeText(`${cfg.system}\n\n---\n\n${cfg.buildUserPrompt(formData)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData({}); setAiResult(""); setCalculations(null); setHistory([]);
    const state = loadState();
    delete state.modules[moduleId];
    saveState(state);
    setCompletedModules((prev) => prev.filter((id) => id !== moduleId));
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
      <main className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
        <AnimatePresence mode="wait">
          <motion.div key={moduleId} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {/* Topbar */}
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="btn-ghost text-sm">
                <ArrowLeft size={14} /> Dashboard
              </Link>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-start gap-4">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="text-3xl">{mod.icon}</motion.span>
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
                <button onClick={handleReset} className="btn-ghost text-caption text-[var(--color-text-muted)]">
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
              <button onClick={handleAnalyze} disabled={isStreaming} className="btn-primary py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold-glow">
                <Bot size={18} /> {isStreaming ? "Analyse en cours..." : "Lancer l'analyse IA complète"}
              </button>
              <button onClick={handleCopyPrompt} className="btn-secondary py-3">
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
            <div className="flex justify-between items-center py-6 border-t border-[var(--color-border)]">
              {moduleId > 1 ? <Link href={`/module/${moduleId - 1}`} className="btn-ghost text-sm">&larr; Module {String(moduleId - 1).padStart(2, "0")}</Link> : <div />}
              {moduleId < 12 ? <Link href={`/module/${moduleId + 1}`} className="btn-ghost text-sm">Module {String(moduleId + 1).padStart(2, "0")} &rarr;</Link> : <div />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
