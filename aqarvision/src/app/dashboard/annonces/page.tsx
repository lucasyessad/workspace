import Link from "next/link";
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrix, formatSurface } from "@/lib/utils";
import { getWilayaById } from "@/lib/wilayas";
import type { Listing } from "@/types";

/** Page de liste des annonces de l'agent */
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bleu-nuit">Mes annonces</h1>
        <Link href="/dashboard/annonces/nouvelle">
          <Button variant="or">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle annonce
          </Button>
        </Link>
      </div>

      {/* Liste des annonces */}
      {!annonces || annonces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              Vous n&apos;avez pas encore d&apos;annonces.
            </p>
            <Link href="/dashboard/annonces/nouvelle">
              <Button variant="or">Créer ma première annonce</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(annonces as Listing[]).map((annonce) => {
            const wilaya = getWilayaById(annonce.wilaya_id);
            return (
              <Card key={annonce.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Image miniature */}
                    <div className="w-full md:w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {annonce.photos?.[0] ? (
                        <img
                          src={annonce.photos[0]}
                          alt={annonce.titre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Pas de photo
                        </div>
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-bleu-nuit truncate">
                          {annonce.titre}
                        </h3>
                        <Badge
                          variant={annonce.est_active ? "success" : "secondary"}
                          className="flex-shrink-0"
                        >
                          {annonce.est_active ? (
                            <><Eye className="h-3 w-3 mr-1" /> Active</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" /> Inactive</>
                          )}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                        <span className="font-medium text-or">
                          {formatPrix(annonce.prix)}
                        </span>
                        <span>|</span>
                        <span>{formatSurface(annonce.surface)}</span>
                        <span>|</span>
                        <span>{annonce.type_bien}</span>
                        {wilaya && (
                          <>
                            <span>|</span>
                            <span>{wilaya.nom_fr}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {annonce.statut_document}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {annonce.type_transaction}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={`/dashboard/annonces/${annonce.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
