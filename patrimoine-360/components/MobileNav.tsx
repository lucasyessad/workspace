"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { modules } from "@/lib/modules";

interface MobileNavProps {
  completedModules: number[];
}

export default function MobileNav({ completedModules }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const done = completedModules.length;
  const total = modules.length;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] transition"
        aria-label="Ouvrir le menu"
        aria-expanded={open}
      >
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-[90] w-72 bg-gradient-sidebar flex flex-col"
              role="navigation"
              aria-label="Menu mobile"
            >
              {/* En-tête */}
              <div className="p-4 flex items-center justify-between border-b border-white/[0.08]">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold-glow">
                    <Sparkles size={16} className="text-navy-950" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">Patrimoine</span>
                    <span className="text-sm font-semibold text-gradient-gold ml-0.5">360°</span>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-navy-400 transition"
                  aria-label="Fermer le menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Progression */}
              <div className="px-4 py-3 border-b border-white/[0.08]">
                <div className="flex justify-between text-[11px] text-navy-400 mb-1.5">
                  <span>Progression</span>
                  <span className="font-mono">{Math.round((done / total) * 100)}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-700"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Accueil */}
              <div className="px-3 pt-3 pb-1">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm ${
                    pathname === "/"
                      ? "bg-[var(--color-sidebar-active)] text-gold-400 font-medium"
                      : "text-navy-300 hover:bg-[var(--color-sidebar-hover)] hover:text-white"
                  }`}
                >
                  <Home size={18} className="flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>
              </div>

              {/* Modules */}
              <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
                {modules.map((m) => {
                  const isActive = pathname === `/module/${m.id}`;
                  const isComplete = completedModules.includes(m.id);
                  return (
                    <Link
                      key={m.id}
                      href={`/module/${m.id}`}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition text-sm ${
                        isActive
                          ? "bg-[var(--color-sidebar-active)] text-gold-400 font-medium"
                          : "text-navy-300 hover:bg-[var(--color-sidebar-hover)] hover:text-white"
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{m.icon}</span>
                      <span className="flex-1 truncate">{m.title}</span>
                      {isComplete && (
                        <span className="w-5 h-5 rounded-full bg-success-500/20 flex items-center justify-center">
                          <span className="text-success-400 text-[10px]">&#10003;</span>
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Pied */}
              <div className="p-4 border-t border-white/[0.08]">
                <div className="text-[10px] text-navy-500 text-center">
                  {done}/{total} modules complétés
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
