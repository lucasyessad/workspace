"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bot, Target, Sparkles, BarChart3, User, LogIn } from "lucide-react";
import { modules } from "@/lib/modules";
import { AppState } from "@/types";
import ThemeToggle from "./ThemeToggle";
import BilanComplet from "./BilanComplet";
import ScoreGlobal from "./ScoreGlobal";
import Reminders from "./Reminders";
import EmptyState from "./EmptyState";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

interface DashboardProps {
  completedModules: number[];
  appState: AppState;
}

export default function Dashboard({ completedModules, appState }: DashboardProps) {
  const total = modules.length;
  const done = completedModules.length;
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Topbar */}
      <header className="flex justify-between items-center mb-8" role="banner">
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

        <nav className="flex items-center gap-2" aria-label="Actions principales">
          <Link href="/copilote" className="btn-primary text-sm" aria-label="Ouvrir le copilote IA">
            <Bot size={16} /> <span className="hidden sm:inline">Copilote IA</span>
          </Link>
          <Link href="/objectifs" className="btn-ghost text-sm" aria-label="Voir les objectifs">
            <Target size={16} /> <span className="hidden sm:inline">Objectifs</span>
          </Link>
          <BilanComplet appState={appState} />
          <Reminders />
          {user ? (
            <Link href="/profil" className="btn-ghost text-sm" aria-label="Mon profil">
              <User size={16} /> <span className="hidden sm:inline">Profil</span>
            </Link>
          ) : (
            <Link href="/auth" className="btn-ghost text-sm" aria-label="Se connecter">
              <LogIn size={16} /> <span className="hidden sm:inline">Connexion</span>
            </Link>
          )}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </nav>
      </header>

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
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${done} modules complétés sur ${total}`}
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
              aria-hidden="true"
            />
          ))}
        </div>
      </motion.div>

      {/* Module grid */}
      {done === 0 && Object.keys(appState.modules).length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={36} />}
          title="Bienvenue sur ton tableau de bord"
          description="Commence par remplir un module pour voir ton premier bilan patrimonial. Chaque module complété enrichit ton analyse globale."
          action={{ label: "Commencer le Module 01", href: "/module/1" }}
          secondaryAction={{ label: "Voir la démo", href: "/landing" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" role="list" aria-label="Liste des modules">
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
                role="listitem"
              >
                <Link href={`/module/${m.id}`} aria-label={`Module ${String(m.id).padStart(2, "0")}: ${m.title}${isComplete ? " (complété)" : ""}`}>
                  <div className="group relative surface-card p-5 hover:border-gold-500/40 transition-all duration-300 cursor-pointer h-full">
                    {isComplete && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="text-success-400 text-xs">&#10003;</span>
                      </motion.div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl" aria-hidden="true">{m.icon}</span>
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
      )}
    </div>
  );
}
