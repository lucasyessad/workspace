import {
  Eye,
  MessageCircle,
  Phone,
  Heart,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-muted-foreground">Veuillez vous connecter.</p>;
  }

  const { data: vuesMois } = await supabase.rpc("vues_ce_mois", { p_agent_id: user.id });
  const { data: contactsMois } = await supabase.rpc("contacts_ce_mois", { p_agent_id: user.id });
  const { data: clicsWhatsapp } = await supabase.rpc("clics_whatsapp_ce_mois", { p_agent_id: user.id });

  const { data: topAnnonces } = await supabase.rpc("top_annonces_par_vues", {
    p_agent_id: user.id,
    p_limite: 5,
  });

  const { data: recherchesPopulaires } = await supabase.rpc("recherches_populaires", { p_agent_id: user.id });

  const { data: contactsRecents } = await supabase
    .from("contacts")
    .select("*, listings(titre)")
    .eq("agent_id", user.id)
    .eq("lu", false)
    .order("created_at", { ascending: false })
    .limit(10);

  const tauxConversion = vuesMois && vuesMois > 0
    ? `${Math.round(((contactsMois ?? 0) / vuesMois) * 100)}%`
    : "0%";

  const stats = [
    { titre: "Vues ce mois", valeur: vuesMois ?? 0, icon: Eye },
    { titre: "Contacts", valeur: contactsMois ?? 0, icon: MessageCircle },
    { titre: "Clics WhatsApp", valeur: clicsWhatsapp ?? 0, icon: Phone },
    { titre: "Conversion", valeur: tauxConversion, icon: TrendingUp },
  ];

  return (
    <div>
      <h1 className="text-heading-3 font-bold text-foreground mb-8 flex items-center gap-2.5">
        <BarChart3 className="h-5 w-5 text-or" />
        Analytics
      </h1>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.titre} className="p-5 rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-caption text-muted-foreground">{stat.titre}</span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-heading-3 font-bold text-foreground">{stat.valeur}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Top annonces */}
        <div className="rounded-2xl border border-border bg-white">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-body font-semibold text-foreground">Annonces les plus vues</h2>
            <p className="text-caption text-muted-foreground">Ce mois-ci</p>
          </div>
          <div className="p-5">
            {!topAnnonces || topAnnonces.length === 0 ? (
              <p className="text-body-sm text-muted-foreground text-center py-6">
                Aucune donnée pour ce mois
              </p>
            ) : (
              <div className="space-y-3">
                {topAnnonces.map(
                  (annonce: { listing_id: string; titre: string; nb_vues: number }, index: number) => (
                    <div key={annonce.listing_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`text-caption font-bold w-6 h-6 rounded-lg flex items-center justify-center ${
                            index === 0
                              ? "bg-or/10 text-or"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="text-body-sm text-foreground truncate">{annonce.titre}</span>
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
          </div>
        </div>

        {/* Recherches populaires */}
        <div className="rounded-2xl border border-border bg-white">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-body font-semibold text-foreground">Biens les plus recherchés</h2>
            <p className="text-caption text-muted-foreground">Types de biens demandés</p>
          </div>
          <div className="p-5">
            {!recherchesPopulaires || recherchesPopulaires.length === 0 ? (
              <p className="text-body-sm text-muted-foreground text-center py-6">
                Aucune recherche enregistrée
              </p>
            ) : (
              <div className="space-y-3">
                {recherchesPopulaires.map((r: { type_bien: string; nombre: number }) => (
                  <div key={r.type_bien} className="flex items-center justify-between">
                    <span className="text-body-sm text-foreground">{r.type_bien}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-or rounded-full"
                          style={{
                            width: `${Math.min(
                              (r.nombre / Math.max(...recherchesPopulaires.map((x: { nombre: number }) => x.nombre))) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-caption text-muted-foreground w-6 text-right">
                        {r.nombre}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contacts récents */}
      <div className="rounded-2xl border border-border bg-white mt-5">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-body font-semibold text-foreground">Contacts récents</h2>
            {contactsRecents && contactsRecents.length > 0 && (
              <Badge variant="destructive">{contactsRecents.length} non lus</Badge>
            )}
          </div>
          <p className="text-caption text-muted-foreground">Prospects qui vous ont contacté</p>
        </div>
        <div className="divide-y divide-border">
          {!contactsRecents || contactsRecents.length === 0 ? (
            <p className="text-body-sm text-muted-foreground text-center py-10">
              Aucun contact récent
            </p>
          ) : (
            contactsRecents.map(
              (contact: {
                id: string;
                type_contact: string;
                nom_prospect: string | null;
                telephone_prospect: string | null;
                message: string | null;
                created_at: string;
                listings: { titre: string } | null;
              }) => (
                <div key={contact.id} className="flex items-start gap-3 px-5 py-3.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      contact.type_contact === "whatsapp"
                        ? "bg-emerald-50 text-emerald-600"
                        : contact.type_contact === "appel"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    {contact.type_contact === "whatsapp" ? (
                      <MessageCircle className="h-3.5 w-3.5" />
                    ) : contact.type_contact === "appel" ? (
                      <Phone className="h-3.5 w-3.5" />
                    ) : (
                      <Heart className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-medium text-foreground">
                      {contact.nom_prospect || "Prospect anonyme"}
                    </p>
                    <p className="text-caption text-muted-foreground">
                      {contact.listings?.titre || "Annonce"} &middot;{" "}
                      {new Date(contact.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {contact.message && (
                      <p className="text-caption text-muted-foreground mt-1 line-clamp-2">
                        {contact.message}
                      </p>
                    )}
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}
