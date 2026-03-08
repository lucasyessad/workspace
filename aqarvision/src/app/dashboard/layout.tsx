import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  PlusCircle,
  User,
  LogOut,
  List,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

/** Layout du Dashboard Agent - Barre latérale + contenu */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Récupérer le profil de l'agence
  const { data: profile } = await supabase
    .from("profiles")
    .select("nom_agence, slug_url")
    .eq("id", user.id)
    .single();

  const liens = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/annonces", label: "Mes annonces", icon: List },
    { href: "/dashboard/annonces/nouvelle", label: "Nouvelle annonce", icon: PlusCircle },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/profil", label: "Mon profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Barre de navigation mobile */}
      <nav className="md:hidden border-b bg-white sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-or" />
            <span className="font-bold text-bleu-nuit">AqarVision</span>
          </Link>
          <span className="text-sm text-gray-500">
            {profile?.nom_agence ?? "Mon Agence"}
          </span>
        </div>
        {/* Navigation mobile en bas */}
        <div className="flex border-t">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="flex-1 flex flex-col items-center py-2 text-xs text-gray-600 hover:text-or transition-colors"
            >
              <lien.icon className="h-5 w-5 mb-1" />
              {lien.label.split(" ").slice(-1)[0]}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex">
        {/* Barre latérale desktop */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-bleu-nuit text-white">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Building2 className="h-7 w-7 text-or" />
                <span className="text-lg font-bold">
                  Aqar<span className="text-or">Vision</span>
                </span>
              </Link>
            </div>

            {/* Nom de l'agence */}
            <div className="px-6 py-4 border-b border-white/10">
              <p className="text-sm text-gray-400">Agence</p>
              <p className="font-medium truncate">
                {profile?.nom_agence ?? "Mon Agence"}
              </p>
            </div>

            {/* Liens de navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {liens.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-colors"
                >
                  <lien.icon className="h-5 w-5 text-or" />
                  {lien.label}
                </Link>
              ))}
            </nav>

            {/* Lien vers la page publique */}
            <div className="px-4 py-4 border-t border-white/10 space-y-2">
              {profile?.slug_url && (
                <Link
                  href={`/${profile.slug_url}`}
                  target="_blank"
                  className="block text-xs text-gray-400 hover:text-or transition-colors text-center"
                >
                  Voir ma page publique
                </Link>
              )}
              <form action="/auth/logout" method="POST">
                <Button
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 md:ml-64 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
