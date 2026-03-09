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
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      const pw = doc.internal.pageSize.getWidth();
      let y = 20;

      const addPage = (needed: number) => { if (y + needed > 270) { doc.addPage(); y = 20; } };

      doc.setFontSize(22);
      doc.setTextColor(26, 35, 64); // navy-900
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
        doc.setDrawColor(220, 154, 40); // gold-500
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
        className="btn-secondary text-sm"
      >
        <FileText size={16} />
        <span className="hidden sm:inline">Bilan complet</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="surface-elevated p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-heading-lg font-serif text-[var(--color-text-primary)]">Bilan Complet</h2>
                <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition">
                  <X size={20} />
                </button>
              </div>

              <p className="text-body-sm text-[var(--color-text-secondary)] mb-4">
                Lance les 12 analyses IA en séquence et génère un rapport PDF consolidé.
                {completedModules.length < 12 && (
                  <span className="block mt-1 text-warning-500">
                    {completedModules.length} module(s) avec des données remplies seront analysés.
                  </span>
                )}
              </p>

              <div className="space-y-2 mb-6">
                {completedModules.map((mod) => (
                  <div key={mod.id} className="flex items-center gap-3 text-sm">
                    <span className="text-base">{mod.icon}</span>
                    <span className="flex-1 text-[var(--color-text-secondary)]">{mod.title}</span>
                    {results[mod.id] ? (
                      <span className="text-success-400 text-xs">&#10003;</span>
                    ) : currentModule === mod.id && running ? (
                      <Loader2 size={14} className="text-gold-400 animate-spin" />
                    ) : (
                      <span className="text-[var(--color-text-muted)] text-xs">En attente</span>
                    )}
                  </div>
                ))}
              </div>

              {running && (
                <div className="mb-4">
                  <div className="h-1.5 rounded-full bg-[var(--color-surface-active)] overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
                      animate={{ width: `${(doneCount / completedModules.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-caption text-[var(--color-text-muted)] mt-1">{doneCount}/{completedModules.length} modules analysés</p>
                </div>
              )}

              {error && <p className="text-danger-500 text-sm mb-4">{error}</p>}

              <div className="flex gap-3">
                {!running && doneCount === 0 && (
                  <button
                    onClick={handleRunAll}
                    disabled={completedModules.length === 0}
                    className="flex-1 btn-primary justify-center py-3 disabled:opacity-40"
                  >
                    Lancer les {completedModules.length} analyses
                  </button>
                )}
                {doneCount > 0 && !running && (
                  <button
                    onClick={handleExportFullPdf}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-success-500 to-success-600 text-white text-sm font-medium hover:from-success-600 hover:to-success-600 transition"
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
