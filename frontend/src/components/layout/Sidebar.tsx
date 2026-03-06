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
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/buildings", label: "Bâtiments", icon: Building2 },
  { href: "/audits", label: "Audits", icon: ClipboardList },
  { href: "/scenarios", label: "Scénarios", icon: TrendingUp },
  { href: "/reports", label: "Rapports", icon: FileText },
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

      {/* Logout */}
      <div className="px-3 py-4 border-t border-brand-800">
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
