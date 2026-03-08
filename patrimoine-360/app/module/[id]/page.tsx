"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Copy, RotateCcw, Check } from "lucide-react";
import Link from "next/link";
import { getModule, modules } from "@/lib/modules";
import { getPromptConfig } from "@/lib/prompts";
import { calculate } from "@/lib/calculators";
import { FormData as FData, CalculationResult, AppState } from "@/types";
import ModuleForm from "@/components/ModuleForm";
import LocalCalculations from "@/components/LocalCalculations";
import AIResult from "@/components/AIResult";
import ExportButtons from "@/components/ExportButtons";
import Sidebar from "@/components/Sidebar";

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

export default function ModulePage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = Number(params.id);
  const mod = getModule(moduleId);

  const [formData, setFormData] = useState<FData>({});
  const [calculations, setCalculations] = useState<CalculationResult[] | null>(null);
  const [aiResult, setAiResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Load saved state
  useEffect(() => {
    const state = loadState();
    const moduleState = state.modules[moduleId];
    if (moduleState) {
      setFormData(moduleState.formData || {});
      setAiResult(moduleState.aiResult || "");
    } else {
      setFormData({});
      setAiResult("");
    }
    const completed = Object.entries(state.modules)
      .filter(([, v]) => v.completed)
      .map(([k]) => Number(k));
    setCompletedModules(completed);
  }, [moduleId]);

  // Recalculate on form change
  useEffect(() => {
    if (mod?.hasCalculator) {
      const results = calculate(moduleId, formData);
      setCalculations(results);
    }
  }, [formData, moduleId, mod?.hasCalculator]);

  // Save form data on change
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
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setAiResult(accumulated);
              }
              if (parsed.error) {
                accumulated += `\n\n**Erreur**: ${parsed.error}`;
                setAiResult(accumulated);
              }
            } catch {}
          }
        }
      }

      // Mark completed and save
      const state = loadState();
      if (!state.modules[moduleId]) {
        state.modules[moduleId] = { formData, completed: false };
      }
      state.modules[moduleId].aiResult = accumulated;
      state.modules[moduleId].completed = true;
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
    const promptConfig = getPromptConfig(moduleId);
    if (!promptConfig) return;
    const fullPrompt = `${promptConfig.system}\n\n---\n\n${promptConfig.buildUserPrompt(formData)}`;
    navigator.clipboard.writeText(fullPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFormData({});
    setAiResult("");
    setCalculations(null);
    const state = loadState();
    delete state.modules[moduleId];
    saveState(state);
    setCompletedModules((prev) => prev.filter((id) => id !== moduleId));
  };

  if (!mod) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Module non trouvé.{" "}
        <Link href="/" className="ml-2 text-indigo-400 hover:underline">Retour</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar completedModules={completedModules} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-4"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <div className="flex items-start gap-4">
              <span className="text-3xl">{mod.icon}</span>
              <div>
                <span className="text-xs text-indigo-400 font-mono">
                  Module {String(mod.id).padStart(2, "0")} &middot; Style {mod.style}
                </span>
                <h1 className="text-2xl font-serif font-bold text-white">{mod.title}</h1>
                <p className="text-sm text-gray-400 mt-1">{mod.description}</p>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                Vos informations
              </h2>
              <button
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-gray-300 transition flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Réinitialiser
              </button>
            </div>
            <ModuleForm fields={mod.fields} formData={formData} onChange={handleFieldChange} />
          </motion.div>

          {/* Local calculations */}
          {calculations && calculations.length > 0 && (
            <div className="mb-8">
              <LocalCalculations results={calculations} />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={handleAnalyze}
              disabled={isStreaming}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-indigo-500/25"
            >
              <Bot size={18} />
              {isStreaming ? "Analyse en cours..." : "Lancer l'analyse IA complète"}
            </button>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-gray-300 hover:bg-white/[0.06] hover:text-white transition text-sm"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? "Copié !" : "Copier le prompt"}
            </button>
          </div>

          {/* AI Result */}
          {aiResult && (
            <div className="mb-8">
              <AIResult content={aiResult} isStreaming={isStreaming} />
            </div>
          )}

          {/* Export */}
          {(aiResult || (calculations && calculations.length > 0)) && (
            <div className="mb-12">
              <ExportButtons
                moduleTitle={mod.title}
                moduleStyle={mod.style}
                formData={formData}
                calculations={calculations}
                aiResult={aiResult}
              />
            </div>
          )}

          {/* Module navigation */}
          <div className="flex justify-between items-center py-6 border-t border-white/[0.08]">
            {moduleId > 1 ? (
              <Link
                href={`/module/${moduleId - 1}`}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                ← Module {String(moduleId - 1).padStart(2, "0")}
              </Link>
            ) : <div />}
            {moduleId < 12 ? (
              <Link
                href={`/module/${moduleId + 1}`}
                className="text-sm text-gray-400 hover:text-white transition"
              >
                Module {String(moduleId + 1).padStart(2, "0")} →
              </Link>
            ) : <div />}
          </div>
        </div>
      </main>
    </div>
  );
}
