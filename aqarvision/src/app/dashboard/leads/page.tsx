import { Users, UserPlus, CalendarDays, TrendingUp, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffJ = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffJ === 1) return "hier";
  if (diffJ < 7) return `il y a ${diffJ}j`;

  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; badge: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  nouveau: { label: "Nouveau", color: "bg-blue-400", badge: "default" },
  contacte: { label: "Contacté", color: "bg-amber-400", badge: "warning" },
  qualifie: { label: "Qualifié", color: "bg-emerald-400", badge: "success" },
  rdv: { label: "RDV", color: "bg-purple-400", badge: "secondary" },
  clos: { label: "Clos", color: "bg-gray-400", badge: "outline" },
};

const SOURCE_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  whatsapp: { label: "WhatsApp", variant: "success" },
  appel: { label: "Appel", variant: "default" },
  formulaire: { label: "Formulaire", variant: "secondary" },
};

export default async function LeadsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p className="text-muted-foreground">Veuillez vous connecter.</p>;
  }

  // Fetch all contacts with related listing title
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*, listings(titre)")
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  const allLeads = contacts ?? [];
  const totalLeads = allLeads.length;
  const nouveaux = allLeads.filter((c) => c.statut === "nouveau").length;

  const ilYA7Jours = new Date();
  ilYA7Jours.setDate(ilYA7Jours.getDate() - 7);
  const cetteSemaine = allLeads.filter(
    (c) => new Date(c.created_at) >= ilYA7Jours
  ).length;

  const clos = allLeads.filter((c) => c.statut === "clos").length;
  const tauxConversion =
    totalLeads > 0 ? `${Math.round((clos / totalLeads) * 100)}%` : "0%";

  const stats = [
    { titre: "Total leads", valeur: totalLeads, icon: Users },
    { titre: "Nouveaux", valeur: nouveaux, icon: UserPlus },
    { titre: "Cette semaine", valeur: cetteSemaine, icon: CalendarDays },
    { titre: "Conversion", valeur: tauxConversion, icon: TrendingUp },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-heading-3 font-bold text-foreground">Leads</h1>
          {totalLeads > 0 && (
            <Badge variant="secondary">{totalLeads}</Badge>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.titre}
            className="p-5 rounded-2xl border border-border bg-white"
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

      {/* Leads list */}
      {allLeads.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white px-5 py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
            <Inbox className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-body-sm font-medium text-foreground mb-1">
            Aucun lead pour le moment
          </p>
          <p className="text-caption text-muted-foreground">
            Les prospects qui vous contactent via vos annonces apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-body font-semibold text-foreground">
              Tous les leads
            </h2>
          </div>

          <div className="divide-y divide-border">
            {allLeads.map((contact) => {
              const statusConf = STATUS_CONFIG[contact.statut] ?? STATUS_CONFIG.nouveau;
              const sourceConf = contact.source
                ? SOURCE_CONFIG[contact.source] ?? { label: contact.source, variant: "secondary" as const }
                : null;
              const listing = contact.listings as { titre: string } | null;

              return (
                <div
                  key={contact.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                >
                  {/* Status dot */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusConf.color}`}
                  />

                  {/* Lead info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-body-sm font-medium text-foreground truncate">
                        {contact.nom || "Prospect anonyme"}
                      </span>
                      {sourceConf && (
                        <Badge variant={sourceConf.variant} className="flex-shrink-0">
                          {sourceConf.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-caption text-muted-foreground">
                      {contact.telephone && <span>{contact.telephone}</span>}
                      {contact.email && <span>{contact.email}</span>}
                      {listing?.titre && (
                        <span className="truncate">{listing.titre}</span>
                      )}
                    </div>
                  </div>

                  {/* Date + Status */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-caption text-muted-foreground hidden sm:block">
                      {formatDateRelative(contact.created_at)}
                    </span>
                    <Badge variant={statusConf.badge}>
                      {statusConf.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
