import { Building2, Eye, List, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Page principale du Dashboard - Vue d'ensemble */
export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Statistiques des annonces
  const { count: totalAnnonces } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id);

  const { count: annoncesActives } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id)
    .eq("est_active", true);

  const stats = [
    {
      titre: "Total annonces",
      valeur: totalAnnonces ?? 0,
      icon: List,
      couleur: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      titre: "Annonces actives",
      valeur: annoncesActives ?? 0,
      icon: Eye,
      couleur: "text-green-600",
      bg: "bg-green-100",
    },
    {
      titre: "Vues ce mois",
      valeur: 0,
      icon: TrendingUp,
      couleur: "text-or",
      bg: "bg-yellow-100",
    },
    {
      titre: "Contacts reçus",
      valeur: 0,
      icon: Building2,
      couleur: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6">
        Tableau de bord
      </h1>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.titre}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.titre}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.couleur}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-bleu-nuit">
                {stat.valeur}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section d'accueil */}
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 text-or mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-bleu-nuit mb-2">
            Bienvenue sur AqarVision
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Commencez par ajouter votre première annonce immobilière.
            Utilisez l&apos;IA pour générer des descriptions professionnelles
            et attirez plus de clients.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
