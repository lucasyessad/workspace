"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Target, Bell, Sparkles } from "lucide-react";
import { modules } from "@/lib/modules";
import { AppState } from "@/types";
import ThemeToggle from "./ThemeToggle";
import BilanComplet from "./BilanComplet";
import ScoreGlobal from "./ScoreGlobal";
import Reminders from "./Reminders";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Topbar */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold-glow">
            <Sparkles size={18} className="text-navy-950" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-heading font-serif text-[var(--color-text-primary)] leading-none">
              Patrimoine <span className="text-gradient-gold">360°</span>
            </h1>
            <p className="text-overline text-[var(--color-text-tertiary)] mt-0.5">
              Copilote financier intelligent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/copilote" className="btn-primary text-sm">
            <Bot size={16} /> Copilote IA
          </Link>
          <Link href="/objectifs" className="btn-ghost text-sm">
            <Target size={16} /> <span className="hidden sm:inline">Objectifs</span>
          </Link>
          <BilanComplet appState={appState} />
          <Reminders />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      {/* Score Global */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <ScoreGlobal appState={appState} />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <div className="flex justify-between text-body-sm mb-2">
          <span className="text-[var(--color-text-secondary)]">Progression globale</span>
          <span className="font-mono text-[var(--color-text-primary)]">{done}/{total} modules</span>
        </div>
        <div className="flex gap-1">
          {modules.map((m) => (
            <motion.div
              key={m.id}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: m.id * 0.05, duration: 0.4 }}
              className={`h-2 flex-1 rounded-full transition-all duration-500 origin-left ${
                completedModules.includes(m.id) ? "bg-gradient-to-r from-gold-400 to-gold-500" : "bg-[var(--color-surface-active)]"
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
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/module/${m.id}`}>
                <div className="group relative surface-card p-5 hover:border-gold-500/40 transition-all duration-300 cursor-pointer h-full">
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center"
                    >
                      <span className="text-success-400 text-xs">&#10003;</span>
                    </motion.div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <span className="text-overline text-gold-600 dark:text-gold-400">Module {String(m.id).padStart(2, "0")}</span>
                      <h3 className="text-body font-medium text-[var(--color-text-primary)] group-hover:text-gold-600 dark:group-hover:text-gold-400 transition">{m.title}</h3>
                    </div>
                  </div>
                  <p className="text-caption text-[var(--color-text-tertiary)] mb-2">{m.description}</p>
                  <span className="text-overline uppercase text-[var(--color-text-muted)]">Style {m.style}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
