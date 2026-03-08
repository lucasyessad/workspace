"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Home, Sparkles } from "lucide-react";
import { useState } from "react";
import { modules } from "@/lib/modules";

interface SidebarProps {
  completedModules: number[];
}

export default function Sidebar({ completedModules }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const done = completedModules.length;
  const total = modules.length;
  const pct = Math.round((done / total) * 100);

  return (
    <aside
      className={`hidden md:flex flex-col bg-gradient-sidebar transition-all duration-300 ${
        collapsed ? "w-sidebar-collapsed" : "w-sidebar"
      }`}
      aria-label="Barre latérale de navigation"
      role="navigation"
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between border-b border-[var(--color-sidebar-border)]">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold-glow">
              <Sparkles size={16} className="text-navy-950" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Patrimoine</span>
              <span className="text-sm font-semibold text-gradient-gold ml-0.5">360°</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-[var(--color-sidebar-hover)] text-navy-400 transition"
          aria-label={collapsed ? "Agrandir la barre latérale" : "Réduire la barre latérale"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Progress */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-[var(--color-sidebar-border)]">
          <div className="flex justify-between text-[11px] text-navy-400 mb-1.5">
            <span>Progression</span>
            <span className="font-mono">{pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Home */}
      <div className="px-2 pt-3 pb-1">
        <Link
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition text-sm ${
            pathname === "/"
              ? "bg-[var(--color-sidebar-active)] text-gold-400 font-medium"
              : "text-navy-300 hover:bg-[var(--color-sidebar-hover)] hover:text-white"
          }`}
        >
          <Home size={18} className="flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>
      </div>

      {/* Modules */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5" aria-label="Modules patrimoniaux">
        {modules.map((m) => {
          const isActive = pathname === `/module/${m.id}`;
          const isComplete = completedModules.includes(m.id);
          return (
            <Link
              key={m.id}
              href={`/module/${m.id}`}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition text-sm ${
                isActive
                  ? "bg-[var(--color-sidebar-active)] text-gold-400 font-medium"
                  : "text-navy-300 hover:bg-[var(--color-sidebar-hover)] hover:text-white"
              }`}
            >
              <span className="text-base flex-shrink-0">{m.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{m.title}</span>
                  {isComplete && (
                    <span className="w-5 h-5 rounded-full bg-success-500/20 flex items-center justify-center">
                      <span className="text-success-400 text-[10px]">&#10003;</span>
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-[var(--color-sidebar-border)]">
          <div className="text-[10px] text-navy-500 text-center">
            {done}/{total} modules complétés
          </div>
        </div>
      )}
    </aside>
  );
}
