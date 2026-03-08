"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2, Download, X } from "lucide-react";
import { modules } from "@/lib/modules";
import { AppState } from "@/types";

interface BilanCompletProps {
  appState: AppState;
}

export default function BilanComplet({ appState }: BilanCompletProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentModule, setCurrentModule] = useState(0);
  const [results, setResults] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  const completedModules = modules.filter((m) => appState.modules[m.id]?.formData && Object.keys(appState.modules[m.id].formData).length > 0);

  const handleRunAll = async () => {
    setRunning(true);
    setResults({});
    setError("");

    for (const mod of completedModules) {
      setCurrentModule(mod.id);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId: mod.id, formData: appState.modules[mod.id].formData }),
        });

        if (!response.ok) {
          setResults((prev) => ({ ...prev, [mod.id]: "Erreur lors de l'analyse" }));
          continue;
        }

        const text = await response.text();
        let accumulated = "";
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) accumulated += parsed.text;
            } catch {}
          }
        }
        setResults((prev) => ({ ...prev, [mod.id]: accumulated }));
      } catch (err) {
        setResults((prev) => ({ ...prev, [mod.id]: `Erreur: ${err}` }));
      }
    }

    setRunning(false);
    setCurrentModule(0);
  };

  const handleExportFullPdf = () => {
    // Dynamic import to avoid SSR issues
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.getWidth();
      let y = 20;

      const addPage = (needed: number) => { if (y + needed > 270) { doc.addPage(); y = 20; } };

      doc.setFontSize(22);
      doc.setTextColor(99, 102, 241);
      doc.text("Patrimoine 360° — Bilan Complet", pw / 2, y, { align: "center" });
      y += 10;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, pw / 2, y, { align: "center" });
      y += 15;

      for (const mod of completedModules) {
        const result = results[mod.id];
        if (!result) continue;

        addPage(20);
        doc.setDrawColor(99, 102, 241);
        doc.line(20, y, pw - 20, y);
        y += 8;

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text(`${mod.icon} Module ${String(mod.id).padStart(2, "0")} — ${mod.title}`, 20, y);
        y += 8;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Style ${mod.style}`, 20, y);
        y += 8;

        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const clean = result.replace(/#{1,6}\s/g, "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/`/g, "");
        const lines = doc.splitTextToSize(clean, pw - 40);
        for (const line of lines) {
          addPage(5);
          doc.text(line, 20, y);
          y += 4.5;
        }
        y += 10;
      }

      doc.addPage();
      y = doc.internal.pageSize.getHeight() - 20;
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("Ce document est fourni à titre éducatif uniquement et ne constitue pas un conseil financier professionnel.", pw / 2, y, { align: "center" });

      doc.save("patrimoine-360-bilan-complet.pdf");
    });
  };

  const doneCount = Object.keys(results).length;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition shadow-lg shadow-purple-500/20"
      >
        <FileText size={16} />
        Bilan complet
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111827] border border-white/[0.08] rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-serif font-bold text-white">Bilan Complet</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Lance les 12 analyses IA en séquence et génère un rapport PDF consolidé.
                {completedModules.length < 12 && (
                  <span className="block mt-1 text-yellow-400/80">
                    {completedModules.length} module(s) avec des données remplies seront analysés.
                  </span>
                )}
              </p>

              {/* Module list */}
              <div className="space-y-2 mb-6">
                {completedModules.map((mod) => (
                  <div key={mod.id} className="flex items-center gap-3 text-sm">
                    <span className="text-base">{mod.icon}</span>
                    <span className="flex-1 text-gray-300">{mod.title}</span>
                    {results[mod.id] ? (
                      <span className="text-green-400 text-xs">&#10003;</span>
                    ) : currentModule === mod.id && running ? (
                      <Loader2 size={14} className="text-indigo-400 animate-spin" />
                    ) : (
                      <span className="text-gray-600 text-xs">En attente</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress */}
              {running && (
                <div className="mb-4">
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full bg-indigo-500 rounded-full"
                      animate={{ width: `${(doneCount / completedModules.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{doneCount}/{completedModules.length} modules analysés</p>
                </div>
              )}

              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

              <div className="flex gap-3">
                {!running && doneCount === 0 && (
                  <button
                    onClick={handleRunAll}
                    disabled={completedModules.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-40"
                  >
                    Lancer les {completedModules.length} analyses
                  </button>
                )}
                {doneCount > 0 && !running && (
                  <button
                    onClick={handleExportFullPdf}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition"
                  >
                    <Download size={16} />
                    Télécharger le PDF complet
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
