"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { modules } from "@/lib/modules";
import { AppState } from "@/types";
import ThemeToggle from "./ThemeToggle";
import BilanComplet from "./BilanComplet";
import { useTheme } from "./ThemeProvider";

interface DashboardProps {
  completedModules: number[];
  appState: AppState;
}

export default function Dashboard({ completedModules, appState }: DashboardProps) {
  const total = modules.length;
  const done = completedModules.length;
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex justify-end items-center gap-3 mb-4">
        <BilanComplet appState={appState} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-3">
          Patrimoine <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">360°</span>
        </h1>
        <p className="text-gray-400 text-sm">
          12 modules experts &middot; Calculs en temps réel &middot; Analyse IA personnalisée
        </p>
      </motion.div>

      {/* Global progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progression globale</span>
          <span className="font-mono">{done}/{total} modules</span>
        </div>
        <div className="flex gap-1">
          {modules.map((m) => (
            <motion.div
              key={m.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: m.id * 0.05, duration: 0.4 }}
              className={`h-2 flex-1 rounded-full transition-all duration-500 origin-left ${
                completedModules.includes(m.id) ? "bg-green-400" : "bg-white/[0.08]"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((m, i) => {
          const isComplete = completedModules.includes(m.id);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/module/${m.id}`}>
                <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer h-full">
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center"
                    >
                      <span className="text-green-400 text-xs">&#10003;</span>
                    </motion.div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <span className="text-xs text-indigo-400 font-mono">Module {String(m.id).padStart(2, "0")}</span>
                      <h3 className="text-white font-medium text-sm group-hover:text-indigo-300 transition">{m.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{m.description}</p>
                  <span className="text-[10px] uppercase tracking-widest text-gray-600">Style {m.style}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
