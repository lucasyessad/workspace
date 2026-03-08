"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { clearAuth } from "@/lib/auth";
import { getBrandSettings } from "@/lib/theme";
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
  FolderOpen,
  ChevronRight,
  Shield,
  CheckSquare,
  Upload,
  SlidersHorizontal,
  Bell,
} from "lucide-react";
import { getStoredUser } from "@/lib/auth";

const sections = [
  {
    label: "Patrimoine",
    items: [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/projects",  label: "Projets",          icon: FolderOpen },
      { href: "/buildings", label: "Bâtiments",         icon: Building2 },
    ],
  },
  {
    label: "Missions",
    items: [
      { href: "/audits",    label: "Audits énergétiques",  icon: ClipboardList },
      { href: "/scenarios", label: "Plans de rénovation",  icon: TrendingUp },
    ],
  },
  {
    label: "Livrables",
    items: [
      { href: "/reports", label: "Rapports",      icon: FileText },
      { href: "/ml",      label: "IA Prédictive", icon: BrainCircuit },
    ],
  },
];

const settingsItems = [
  { href: "/settings/profile", label: "Profil & organisation", icon: User },
  { href: "/settings/billing", label: "Abonnement",            icon: CreditCard },
  { href: "/settings/apikeys", label: "Clés API",              icon: KeyRound },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [orgSettings, setOrgSettings] = useState<ReturnType<typeof getBrandSettings>>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setOrgSettings(getBrandSettings());
    const user = getStoredUser();
    setIsAdmin(user?.role === "admin");
  }, []);

  const orgName = orgSettings?.organization_name ?? "ThermoPilot AI";

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <aside
      className="w-60 min-h-screen flex flex-col flex-shrink-0"
      style={{ backgroundColor: "var(--sidebar-bg, #162a1e)" }}
    >
      {/* ── Logo / org ───────────────────────────────────────── */}
      <div
        className="px-5 py-5 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--sidebar-border, #2c4a37)" }}
      >
        <div className="flex items-center gap-3">
          {orgSettings?.logo_url ? (
            <img
              src={orgSettings.logo_url}
              alt="Logo"
              className="w-8 h-8 rounded object-cover bg-white flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 text-base"
              style={{ backgroundColor: "var(--brand-500, #18753c)" }}
            >
              🌡️
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{orgName}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: "var(--sidebar-label, #5a8a6e)" }}>
              ThermoPilot AI
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation principale ────────────────────────────── */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label} className="mb-5">
            <p
              className="px-5 mb-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "var(--sidebar-label, #5a8a6e)" }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon   = item.icon;
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 mx-2 px-3 py-2 rounded text-sm font-medium transition-colors relative group",
                        active ? "text-white" : "hover:text-white"
                      )}
                      style={{
                        color:           active ? "#ffffff" : "var(--sidebar-text, #a8c9b5)",
                        backgroundColor: active ? "var(--sidebar-active, #243f2f)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover, #1f3d2c)";
                      }}
                      onMouseLeave={(e) => {
                        if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      }}
                    >
                      {/* Active left accent */}
                      {active && (
                        <span
                          className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                          style={{ backgroundColor: "var(--brand-400, #3fb877)" }}
                        />
                      )}
                      <Icon size={15} className="flex-shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {active && (
                        <ChevronRight size={13} style={{ color: "var(--brand-400, #3fb877)", opacity: 0.8 }} />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Administration (admin only) ──────────────────────── */}
      {isAdmin && (
        <div className="mb-5">
          <p
            className="px-5 mb-1 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--sidebar-label, #5a8a6e)" }}
          >
            Administration
          </p>
          <ul className="space-y-0.5">
            {[
              { href: "/admin/parametrage",           label: "Paramétrage",         icon: Shield },
              { href: "/admin/variables",              label: "Variables régl.",      icon: SlidersHorizontal },
              { href: "/admin/veille-reglementaire",  label: "Veille régl.",         icon: Bell },
              { href: "/admin/logiciels-agrees",      label: "Logiciels agréés",    icon: CheckSquare },
              { href: "/admin/import-dpe",            label: "Import DPE",           icon: Upload },
            ].map((item) => {
              const Icon   = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 mx-2 px-3 py-2 rounded text-sm font-medium transition-colors relative"
                    style={{
                      color:           active ? "#ffffff" : "var(--sidebar-text, #a8c9b5)",
                      backgroundColor: active ? "var(--sidebar-active, #243f2f)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover, #1f3d2c)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                        style={{ backgroundColor: "var(--brand-400, #3fb877)" }}
                      />
                    )}
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── Paramètres ──────────────────────────────────────── */}
      <div
        className="py-3"
        style={{ borderTop: "1px solid var(--sidebar-border, #2c4a37)" }}
      >
        <p
          className="px-5 mb-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--sidebar-label, #5a8a6e)" }}
        >
          Paramètres
        </p>
        <ul className="space-y-0.5">
          {settingsItems.map((item) => {
            const Icon   = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 mx-2 px-3 py-2 rounded text-sm font-medium transition-colors relative"
                  style={{
                    color:           active ? "#ffffff" : "var(--sidebar-text, #a8c9b5)",
                    backgroundColor: active ? "var(--sidebar-active, #243f2f)" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover, #1f3d2c)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r"
                      style={{ backgroundColor: "var(--brand-400, #3fb877)" }}
                    />
                  )}
                  <Icon size={15} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Déconnexion ─────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded text-sm font-medium transition-colors"
          style={{ color: "var(--sidebar-label, #5a8a6e)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover, #1f3d2c)";
            (e.currentTarget as HTMLElement).style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--sidebar-label, #5a8a6e)";
          }}
        >
          <LogOut size={15} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
