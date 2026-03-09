import Link from "next/link";
import { Building2, Eye, List, TrendingUp, ArrowRight, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: totalAnnonces } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id);

  const { count: annoncesActives } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id)
    .eq("est_active", true);

  const { data: vuesCeMois } = await supabase.rpc("vues_ce_mois", {
    p_agent_id: user?.id,
  });
  const { data: contactsCeMois } = await supabase.rpc("contacts_ce_mois", {
    p_agent_id: user?.id,
  });

  // Dernières annonces
  const { data: dernieres } = await supabase
    .from("listings")
    .select("id, titre, est_active, created_at")
    .eq("agent_id", user?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { titre: "Total annonces", valeur: totalAnnonces ?? 0, icon: List },
    { titre: "Actives", valeur: annoncesActives ?? 0, icon: Eye },
    { titre: "Vues ce mois", valeur: vuesCeMois ?? 0, icon: TrendingUp },
    { titre: "Contacts", valeur: contactsCeMois ?? 0, icon: Building2 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-vitrine text-heading-3 font-bold text-foreground">
          Vue d&apos;ensemble
        </h1>
        <Link href="/dashboard/annonces/nouvelle">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.titre}
            className="glass-card p-5 rounded-2xl border border-border cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted-foreground">
                {stat.titre}
              </span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-heading-3 font-bold text-foreground">
              {stat.valeur}
            </p>
          </div>
        ))}
      </div>

      {/* Dernières annonces */}
      <div className="glass-card rounded-2xl border border-border">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-vitrine text-body font-semibold text-foreground">
            Annonces récentes
          </h2>
          <Link href="/dashboard/annonces" className="text-caption text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Tout voir
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {!dernieres || dernieres.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-body-sm font-medium text-foreground mb-1">
              Aucune annonce
            </p>
            <p className="text-caption text-muted-foreground mb-4">
              Publiez votre première annonce pour commencer.
            </p>
            <Link href="/dashboard/annonces/nouvelle">
              <Button variant="outline" size="sm">
                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                Créer une annonce
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {dernieres.map((annonce) => (
              <Link
                key={annonce.id}
                href={`/dashboard/annonces/${annonce.id}/edit`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
              >
                <span className="text-body-sm text-foreground truncate mr-4">
                  {annonce.titre}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className={`h-1.5 w-1.5 rounded-full ${annonce.est_active ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
                  <span className="text-caption text-muted-foreground">
                    {annonce.est_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
