import Link from "next/link";
import { PlusCircle, Edit, Eye, EyeOff, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrix, formatSurface } from "@/lib/utils";
import { getWilayaById } from "@/lib/wilayas";
import type { Listing } from "@/types";

export default async function AnnoncesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: annonces } = await supabase
    .from("listings")
    .select("*")
    .eq("agent_id", user?.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-heading-3 font-bold text-foreground">Annonces</h1>
        <Link href="/dashboard/annonces/nouvelle">
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {!annonces || annonces.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white px-5 py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-body-sm font-medium text-foreground mb-1">
            Aucune annonce
          </p>
          <p className="text-caption text-muted-foreground mb-5">
            Commencez par créer votre première annonce.
          </p>
          <Link href="/dashboard/annonces/nouvelle">
            <Button size="sm">Créer une annonce</Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="divide-y divide-border">
            {(annonces as Listing[]).map((annonce) => {
              const wilaya = getWilayaById(annonce.wilaya_id);
              return (
                <div key={annonce.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {annonce.photos?.[0] ? (
                      <img
                        src={annonce.photos[0]}
                        alt={annonce.titre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-body-sm font-medium text-foreground truncate">
                        {annonce.titre}
                      </h3>
                      <Badge
                        variant={annonce.est_active ? "success" : "secondary"}
                        className="flex-shrink-0"
                      >
                        {annonce.est_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-caption text-muted-foreground">
                      <span className="font-medium text-or">{formatPrix(annonce.prix)}</span>
                      <span>{formatSurface(annonce.surface)}</span>
                      <span>{annonce.type_bien}</span>
                      {wilaya && <span>{wilaya.nom_fr}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <Link href={`/dashboard/annonces/${annonce.id}/edit`} className="flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
