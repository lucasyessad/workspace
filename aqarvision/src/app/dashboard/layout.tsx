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
  ExternalLink,
  Users,
  Palette,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("nom_agence, slug_url")
    .eq("id", user.id)
    .single();

  const liens = [
    { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
    { href: "/dashboard/annonces", label: "Annonces", icon: List },
    { href: "/dashboard/annonces/nouvelle", label: "Nouvelle annonce", icon: PlusCircle },
    { href: "/dashboard/leads", label: "Leads", icon: Users },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/branding", label: "Identité visuelle", icon: Palette },
    { href: "/dashboard/profil", label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Mobile top bar */}
      <nav className="md:hidden border-b border-border/50 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-bleu-nuit rounded-lg flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">AqarVision</span>
          </Link>
          <span className="text-caption text-muted-foreground truncate ml-4">
            {profile?.nom_agence ?? "Mon Agence"}
          </span>
        </div>
        <div className="flex border-t border-border">
          {liens.map((lien) => (
            <Link
              key={lien.href}
              href={lien.href}
              className="flex-1 flex flex-col items-center py-2 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <lien.icon className="h-4 w-4 mb-0.5" />
              {lien.label.split(" ").slice(-1)[0]}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white/95 backdrop-blur-md border-r border-border/50">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 h-14 flex items-center border-b border-border/50">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-bleu-nuit rounded-lg flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">
                  Aqar<span className="text-or">Vision</span>
                </span>
              </Link>
            </div>

            {/* Agency name */}
            <div className="px-5 py-4 border-b border-border/50">
              <p className="text-caption text-muted-foreground">Agence</p>
              <p className="text-body-sm font-medium text-foreground truncate">
                {profile?.nom_agence ?? "Mon Agence"}
              </p>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-3 space-y-0.5">
              {liens.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-body-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <lien.icon className="h-4 w-4" />
                  {lien.label}
                </Link>
              ))}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-border/50 space-y-1">
              {profile?.slug_url && (
                <Link
                  href={`/fr/${profile.slug_url}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-caption text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Voir ma vitrine
                </Link>
              )}
              <form action="/auth/logout" method="POST">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Déconnexion
                </Button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main id="main-content" className="flex-1 md:ml-60">
          <div className="p-5 md:p-8 max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
