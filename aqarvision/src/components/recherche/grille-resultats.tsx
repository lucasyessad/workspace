"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  Check,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarteAnnonce } from "@/components/shared/carte-annonce";
import { getWilayaById } from "@/lib/wilayas";
import type { ListingAvecAgence } from "@/lib/recherche";
import type { Locale } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";

const labels = {
  fr: {
    resultats: "résultats",
    aucun: "Aucun bien trouvé",
    aucun_desc: "Modifiez vos filtres ou explorez toutes les offres",
    voir_tout: "Voir tout",
    trier: "Trier",
    recent: "Plus récent",
    prix_asc: "Prix croissant",
    prix_desc: "Prix décroissant",
    surface_desc: "Plus grand",
    page: "Page",
    precedent: "Précédent",
    suivant: "Suivant",
    explorer: "Explorer les biens",
    sous_titre: "Trouvez votre bien idéal parmi toutes les agences",
  },
  ar: {
    resultats: "نتائج",
    aucun: "لا توجد نتائج",
    aucun_desc: "عدّل الفلاتر أو تصفّح جميع العروض",
    voir_tout: "عرض الكل",
    trier: "ترتيب",
    recent: "الأحدث",
    prix_asc: "الأقل سعراً",
    prix_desc: "الأعلى سعراً",
    surface_desc: "الأكبر",
    page: "صفحة",
    precedent: "السابق",
    suivant: "التالي",
    explorer: "استكشف العقارات",
    sous_titre: "ابحث عن عقارك المثالي من جميع الوكالات",
  },
  en: {
    resultats: "results",
    aucun: "No properties found",
    aucun_desc: "Adjust your filters or browse all listings",
    voir_tout: "View all",
    trier: "Sort",
    recent: "Most recent",
    prix_asc: "Price: low to high",
    prix_desc: "Price: high to low",
    surface_desc: "Largest first",
    page: "Page",
    precedent: "Previous",
    suivant: "Next",
    explorer: "Explore properties",
    sous_titre: "Find your ideal property from all agencies",
  },
};

type SortOption = "recent" | "prix_asc" | "prix_desc" | "surface_desc";

interface GrilleResultatsProps {
  annonces: ListingAvecAgence[];
  total: number;
  page: number;
  parPage: number;
  locale: Locale;
}

export function GrilleResultats({
  annonces,
  total,
  page,
  parPage,
  locale,
}: GrilleResultatsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = labels[locale];

  const [triOuvert, setTriOuvert] = useState(false);
  const triRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(total / parPage);
  const tri = (searchParams.get("tri") as SortOption) || "recent";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (triRef.current && !triRef.current.contains(e.target as Node)) {
        setTriOuvert(false);
      }
    }
    if (triOuvert) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [triOuvert]);

  const pushParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) {
      params.delete("page");
    } else {
      params.set("page", String(p));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const triLabels: Record<SortOption, string> = {
    recent: t.recent,
    prix_asc: t.prix_asc,
    prix_desc: t.prix_desc,
    surface_desc: t.surface_desc,
  };

  const nbFiltresActifs = [
    "q", "transaction", "type_bien", "wilaya", "prix_min", "prix_max",
    "surface_min", "surface_max", "nb_pieces", "document",
    "ascenseur", "garage", "jardin", "citerne",
  ].filter((k) => searchParams.has(k)).length;

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
      {/* Results header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="font-vitrine text-2xl font-bold text-gray-900">
            {t.explorer}
          </h2>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
            {total}
          </span>
          {nbFiltresActifs > 0 && (
            <button
              onClick={() => router.push(pathname, { scroll: false })}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <X className="h-3 w-3" />
              {nbFiltresActifs}{" "}
              {locale === "ar"
                ? "فلتر"
                : locale === "en"
                ? "filter(s)"
                : "filtre(s)"}
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative" ref={triRef}>
          <button
            onClick={() => setTriOuvert(!triOuvert)}
            className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 transition-all"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
            <span className="hidden sm:inline">{triLabels[tri]}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-gray-400 transition-transform ${
                triOuvert ? "rotate-180" : ""
              }`}
            />
          </button>
          {triOuvert && (
            <div
              className="absolute end-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 overflow-hidden z-[60]"
              style={{ boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.06)" }}
            >
              {(Object.entries(triLabels) as [SortOption, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      pushParam("tri", key === "recent" ? "" : key);
                      setTriOuvert(false);
                    }}
                    className={`w-full text-start px-4 py-2.5 text-sm transition-colors ${
                      tri === key
                        ? "bg-amber-50 text-amber-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tri === key && (
                      <Check className="inline h-3.5 w-3.5 me-2" />
                    )}
                    {label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {annonces.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-3xl flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-300" />
          </div>
          <p className="font-vitrine text-xl font-semibold text-gray-900 mb-2">
            {t.aucun}
          </p>
          <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
            {t.aucun_desc}
          </p>
          <Button
            onClick={() => router.push(pathname)}
            className="bg-or hover:bg-or/90 text-bleu-nuit font-semibold rounded-xl"
          >
            <Sparkles className="h-4 w-4 me-2" />
            {t.voir_tout}
          </Button>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {annonces.map((annonce) => {
              const w = getWilayaById(annonce.wilaya_id);
              const wilayaNom = w
                ? locale === "ar"
                  ? w.nom_ar
                  : w.nom_fr
                : "";
              return (
                <CarteAnnonce
                  key={annonce.id}
                  annonce={annonce}
                  locale={locale}
                  wilayaNom={wilayaNom}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.precedent}
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                        p === page
                          ? "bg-bleu-nuit text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 border border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {t.suivant}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
