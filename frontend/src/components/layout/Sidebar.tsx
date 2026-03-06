"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  TrendingUp,
  FileText,
  LogOut,
  CreditCard,
  KeyRound,
  User,
  BrainCircuit,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buildings", label: "Bâtiments", icon: Building2 },
  { href: "/audits", label: "Audits", icon: ClipboardList },
  { href: "/scenarios", label: "Scénarios", icon: TrendingUp },
  { href: "/reports", label: "Rapports", icon: FileText },
  { href: "/ml", label: "IA Prédictive", icon: BrainCircuit },
];

const settingsItems = [
  { href: "/settings/profile", label: "Profil", icon: User },
  { href: "/settings/billing", label: "Abonnement", icon: CreditCard },
  { href: "/settings/apikeys", label: "Clés API", icon: KeyRound },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-brand-900 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-800">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌡️</span>
          <div>
            <p className="text-white font-bold text-sm leading-tight">ThermoPilot AI</p>
            <p className="text-brand-300 text-xs">Audit énergétique</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand-700 text-white"
                  : "text-brand-200 hover:bg-brand-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-2 border-t border-brand-800">
        <p className="text-brand-400 text-xs font-semibold uppercase tracking-wider px-3 py-2">
          Paramètres
        </p>
        {settingsItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand-700 text-white"
                  : "text-brand-300 hover:bg-brand-800 hover:text-white"
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-3 py-3 border-t border-brand-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
