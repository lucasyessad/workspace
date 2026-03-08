"use client";

import { useState, useEffect } from "react";
import { X, GitCompareArrows, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrix, formatSurface } from "@/lib/utils";
import {
  getComparaison,
  retirerComparaison,
  viderComparaison,
  type BienFavori,
} from "@/lib/favoris";

/** Panneau flottant de comparaison de biens */
export function PanneauComparaison() {
  const [biens, setBiens] = useState<BienFavori[]>([]);
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    setBiens(getComparaison());

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as BienFavori[];
      setBiens(detail);
    };
    window.addEventListener("comparaison-change", handler);
    return () => window.removeEventListener("comparaison-change", handler);
  }, []);

  if (biens.length === 0) return null;

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOuvert(!ouvert)}
        className="fixed bottom-4 right-4 z-50 bg-bleu-nuit text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
      >
        <GitCompareArrows className="h-5 w-5" />
        <span className="text-sm font-medium">Comparer ({biens.length})</span>
      </button>

      {/* Panneau de comparaison */}
      {ouvert && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOuvert(false)}>
          <div
            className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-bleu-nuit flex items-center gap-2">
                <GitCompareArrows className="h-5 w-5 text-or" />
                Comparaison ({biens.length}/3)
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    viderComparaison();
                    setOuvert(false);
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Vider
                </Button>
                <button onClick={() => setOuvert(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Tableau de comparaison */}
            <div className="p-4 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3 w-32">
                      Critère
                    </th>
                    {biens.map((bien) => (
                      <th key={bien.id} className="text-center pb-3">
                        <div className="relative">
                          <button
                            onClick={() => retirerComparaison(bien.id)}
                            className="absolute -top-1 -right-1 bg-red-100 text-red-500 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {bien.photo && (
                            <img
                              src={bien.photo}
                              alt={bien.titre}
                              className="w-24 h-16 object-cover rounded-lg mx-auto mb-1"
                            />
                          )}
                          <p className="text-xs font-medium text-bleu-nuit line-clamp-2">
                            {bien.titre}
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <LigneComparaison
                    label="Prix"
                    valeurs={biens.map((b) => formatPrix(b.prix))}
                    meilleur={biens.indexOf(
                      biens.reduce((a, b) => (a.prix < b.prix ? a : b))
                    )}
                  />
                  <LigneComparaison
                    label="Surface"
                    valeurs={biens.map((b) => formatSurface(b.surface))}
                    meilleur={biens.indexOf(
                      biens.reduce((a, b) => (a.surface > b.surface ? a : b))
                    )}
                  />
                  <LigneComparaison
                    label="Prix/m²"
                    valeurs={biens.map((b) =>
                      b.surface > 0
                        ? formatPrix(Math.round(b.prix / b.surface)) + "/m²"
                        : "-"
                    )}
                    meilleur={biens.indexOf(
                      biens.reduce((a, b) =>
                        a.surface > 0 && b.surface > 0
                          ? a.prix / a.surface < b.prix / b.surface
                            ? a
                            : b
                          : a
                      )
                    )}
                  />
                  <LigneComparaison
                    label="Type"
                    valeurs={biens.map((b) => b.type_bien)}
                  />
                  <LigneComparaison
                    label="Localisation"
                    valeurs={biens.map((b) =>
                      [b.commune, b.wilaya].filter(Boolean).join(", ")
                    )}
                  />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Ligne du tableau de comparaison */
function LigneComparaison({
  label,
  valeurs,
  meilleur,
}: {
  label: string;
  valeurs: string[];
  meilleur?: number;
}) {
  return (
    <tr className="border-t">
      <td className="py-2 font-medium text-gray-600">{label}</td>
      {valeurs.map((valeur, i) => (
        <td key={i} className="py-2 text-center">
          {meilleur === i ? (
            <Badge variant="success" className="text-xs">
              {valeur}
            </Badge>
          ) : (
            <span>{valeur}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
