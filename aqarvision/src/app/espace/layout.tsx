import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  History,
  MessageSquare,
  User,
  LogOut,
  Building2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const liens = [
  { href: "/espace/favoris", label: "Favoris", icon: Heart },
  { href: "/espace/historique", label: "Historique", icon: History },
  { href: "/espace/messages", label: "Messages", icon: MessageSquare },
  { href: "/espace/profil", label: "Mon profil", icon: User },
];

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/visiteur/login");
  }

  const { data: profile } = await supabase
    .from("visitor_profiles")
    .select("nom, telephone")
    .eq("id", user.id)
    .single();

  const visitorName = profile?.nom || user.email || "Visiteur";

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Mobile top bar */}
      <nav className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/espace" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0c1b2a] rounded-lg flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Aqar<span className="text-[#b8963e]">Vision</span>
            </span>
          </Link>
          <span className="text-xs text-gray-500 truncate ml-4">
            {visitorName}
          </span>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="flex-1 flex flex-col items-center py-2 text-[10px] text-gray-500 hover:text-gray-900 transition-colors"
            >
              <lien.icon className="h-4 w-4 mb-0.5" />
              {lien.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-gray-200">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 h-14 flex items-center border-b border-gray-200">
              <Link href="/espace" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#0c1b2a] rounded-lg flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900">
                  Aqar<span className="text-[#b8963e]">Vision</span>
                </span>
              </Link>
            </div>

            {/* Visitor name */}
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="text-xs text-gray-500">Mon espace</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {visitorName}
              </p>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {liens.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <lien.icon className="h-4 w-4" />
                  {lien.label}
                </Link>
              ))}
            </nav>

            {/* Bottom - Logout */}
            <div className="px-3 py-4 border-t border-gray-200">
              <form action="/auth/logout" method="POST">
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Deconnexion
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-60 pb-20 md:pb-0">
          <div className="p-5 md:p-8 max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
