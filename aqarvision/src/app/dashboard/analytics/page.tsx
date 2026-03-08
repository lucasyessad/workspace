import {
  BarChart3,
  Eye,
  MessageCircle,
  Phone,
  Heart,
  TrendingUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** Page Analytics du Dashboard - Statistiques détaillées */
export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Veuillez vous connecter.</p>;
  }

  // Récupérer les statistiques ce mois
  const { data: vuesMois } = await supabase.rpc("vues_ce_mois", {
    p_agent_id: user.id,
  });

  const { data: contactsMois } = await supabase.rpc("contacts_ce_mois", {
    p_agent_id: user.id,
  });

  const { data: clicsWhatsapp } = await supabase.rpc(
    "clics_whatsapp_ce_mois",
    { p_agent_id: user.id }
  );

  // Top annonces par vues
  const { data: topAnnonces } = await supabase.rpc("top_annonces_par_vues", {
    p_agent_id: user.id,
    p_limite: 5,
  });

  // Recherches populaires
  const { data: recherchesPopulaires } = await supabase.rpc(
    "recherches_populaires",
    { p_agent_id: user.id }
  );

  // Contacts récents non lus
  const { data: contactsRecents } = await supabase
    .from("contacts")
    .select("*, listings(titre)")
    .eq("agent_id", user.id)
    .eq("lu", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const stats = [
    {
      titre: "Vues ce mois",
      valeur: vuesMois ?? 0,
      icon: Eye,
      couleur: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      titre: "Contacts reçus",
      valeur: contactsMois ?? 0,
      icon: MessageCircle,
      couleur: "text-green-600",
      bg: "bg-green-100",
    },
    {
      titre: "Clics WhatsApp",
      valeur: clicsWhatsapp ?? 0,
      icon: Phone,
      couleur: "text-or",
      bg: "bg-yellow-100",
    },
    {
      titre: "Taux de conversion",
      valeur:
        vuesMois && vuesMois > 0
          ? `${Math.round(((contactsMois ?? 0) / vuesMois) * 100)}%`
          : "0%",
      icon: TrendingUp,
      couleur: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-bleu-nuit mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-or" />
        Analytics
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
              <p className="text-2xl font-bold text-bleu-nuit">{stat.valeur}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top annonces par vues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Annonces les plus vues</CardTitle>
            <CardDescription>Ce mois-ci</CardDescription>
          </CardHeader>
          <CardContent>
            {!topAnnonces || topAnnonces.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune donnée pour ce mois
              </p>
            ) : (
              <div className="space-y-3">
                {topAnnonces.map(
                  (
                    annonce: {
                      listing_id: string;
                      titre: string;
                      nb_vues: number;
                    },
                    index: number
                  ) => (
                    <div
                      key={annonce.listing_id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            index === 0
                              ? "bg-or text-bleu-nuit"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-sm truncate">{annonce.titre}</span>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0">
                        <Eye className="h-3 w-3 mr-1" />
                        {annonce.nb_vues}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recherches populaires */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biens les plus recherchés</CardTitle>
            <CardDescription>
              Types de biens les plus demandés par les visiteurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!recherchesPopulaires || recherchesPopulaires.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune recherche enregistrée
              </p>
            ) : (
              <div className="space-y-3">
                {recherchesPopulaires.map(
                  (r: { type_bien: string; nombre: number }) => (
                    <div
                      key={r.type_bien}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{r.type_bien}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-or rounded-full"
                            style={{
                              width: `${Math.min(
                                (r.nombre /
                                  Math.max(
                                    ...recherchesPopulaires.map(
                                      (x: { nombre: number }) => x.nombre
                                    )
                                  )) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {r.nombre}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contacts récents */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Contacts récents
            {contactsRecents && contactsRecents.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {contactsRecents.length} non lus
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Prospects qui vous ont contacté récemment
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!contactsRecents || contactsRecents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Aucun contact récent
            </p>
          ) : (
            <div className="space-y-3">
              {contactsRecents.map(
                (contact: {
                  id: string;
                  type_contact: string;
                  nom_prospect: string | null;
                  telephone_prospect: string | null;
                  message: string | null;
                  created_at: string;
                  listings: { titre: string } | null;
                }) => (
                  <div
                    key={contact.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        contact.type_contact === "whatsapp"
                          ? "bg-green-100 text-green-600"
                          : contact.type_contact === "appel"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {contact.type_contact === "whatsapp" ? (
                        <MessageCircle className="h-4 w-4" />
                      ) : contact.type_contact === "appel" ? (
                        <Phone className="h-4 w-4" />
                      ) : (
                        <Heart className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-bleu-nuit">
                        {contact.nom_prospect || "Prospect anonyme"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contact.listings?.titre || "Annonce supprimée"} -{" "}
                        {new Date(contact.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      {contact.message && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {contact.message}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
