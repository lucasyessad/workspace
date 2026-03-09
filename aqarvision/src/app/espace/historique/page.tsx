import Link from "next/link";
import { History, Trash2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ClearHistoryButton } from "./clear-button";

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "A l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function buildSearchUrl(entry: {
  query?: string | null;
  wilaya_id?: number | null;
  type_bien?: string | null;
  prix_min?: number | null;
  prix_max?: number | null;
  type_transaction?: string | null;
}): string {
  const params = new URLSearchParams();
  if (entry.query) params.set("q", entry.query);
  if (entry.wilaya_id) params.set("wilaya", entry.wilaya_id.toString());
  if (entry.type_bien) params.set("type", entry.type_bien);
  if (entry.prix_min) params.set("prix_min", entry.prix_min.toString());
  if (entry.prix_max) params.set("prix_max", entry.prix_max.toString());
  if (entry.type_transaction) params.set("transaction", entry.type_transaction);
  return `/fr/recherche?${params.toString()}`;
}

function buildFiltersSummary(entry: {
  query?: string | null;
  wilaya_id?: number | null;
  type_bien?: string | null;
  prix_min?: number | null;
  prix_max?: number | null;
  type_transaction?: string | null;
  results_count?: number | null;
}): string {
  const parts: string[] = [];
  if (entry.type_transaction) parts.push(entry.type_transaction);
  if (entry.type_bien) parts.push(entry.type_bien);
  if (entry.prix_min || entry.prix_max) {
    const min = entry.prix_min ? `${(entry.prix_min / 1000000).toFixed(1)}M` : "0";
    const max = entry.prix_max ? `${(entry.prix_max / 1000000).toFixed(1)}M` : "+";
    parts.push(`${min} - ${max} DA`);
  }
  return parts.join(" · ");
}

export default async function HistoriquePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = await supabase
    .from("search_history")
    .select("*")
    .eq("visitor_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const count = history?.length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Historique</h1>
          {count > 0 && (
            <span className="text-sm text-gray-500">
              {count} recherche{count > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {count > 0 && <ClearHistoryButton />}
      </div>

      {count === 0 ? (
        <div className="text-center py-16">
          <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Aucune recherche recente
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Vos recherches apparaitront ici pour vous permettre de les relancer
            facilement.
          </p>
          <Link
            href="/fr/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0c1b2a] text-white text-sm font-medium rounded-lg hover:bg-[#0c1b2a]/90 transition-colors"
          >
            <Search className="h-4 w-4" />
            Lancer une recherche
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {history!.map((entry) => {
            const filtersSummary = buildFiltersSummary(entry);

            return (
              <Link
                key={entry.id}
                href={buildSearchUrl(entry)}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm hover:border-gray-300 transition-all"
              >
                <div className="flex-shrink-0 w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.query || "Recherche sans texte"}
                  </p>
                  {filtersSummary && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {filtersSummary}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-gray-400">
                    {formatRelativeTime(entry.created_at)}
                  </p>
                  {entry.results_count != null && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {entry.results_count} resultat{entry.results_count !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
