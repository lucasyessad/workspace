"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { GlobalSearch } from "@/components/ui/GlobalSearch";
import { applyBrandTheme, getBrandSettings } from "@/lib/theme";
import { HelpCircle, Bell } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }

    // Appliquer le thème initial depuis localStorage
    const settings = getBrandSettings();
    if (settings?.brand_color) applyBrandTheme(settings.brand_color);
    if (settings?.organization_name) setOrgName(settings.organization_name);

    // Réappliquer dès qu'on sauvegarde de nouveaux paramètres (même onglet)
    const onSettingsChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.brand_color) applyBrandTheme(detail.brand_color);
      if (detail?.organization_name) setOrgName(detail.organization_name);
    };

    // Réappliquer si l'utilisateur revient sur l'onglet après changement dans un autre onglet
    const onStorageChange = (e: StorageEvent) => {
      if (e.key !== "org_settings" || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.brand_color) applyBrandTheme(parsed.brand_color);
        if (parsed?.organization_name) setOrgName(parsed.organization_name);
      } catch { /* ignore */ }
    };

    window.addEventListener("brand-settings-changed", onSettingsChanged);
    window.addEventListener("storage", onStorageChange);
    return () => {
      window.removeEventListener("brand-settings-changed", onSettingsChanged);
      window.removeEventListener("storage", onStorageChange);
    };
  }, [router]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar />

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top header — ADEME-style white bar */}
          <header className="h-14 bg-white flex items-center px-6 gap-4 flex-shrink-0"
            style={{ borderBottom: "2px solid var(--brand-500, #18753c)" }}>

            {/* Search — takes most of the width */}
            <div className="flex-1 max-w-lg">
              <GlobalSearch />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button className="w-9 h-9 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell size={17} />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 transition-colors">
                <HelpCircle size={17} />
              </button>
            </div>

            {/* Org badge */}
            {orgName && (
              <div className="flex items-center gap-2 pl-4"
                style={{ borderLeft: "1px solid #e0e0e0" }}>
                <div
                  className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "var(--brand-500, #18753c)" }}
                >
                  {orgName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[140px] truncate hidden sm:block">
                  {orgName}
                </span>
              </div>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
