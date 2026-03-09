"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Search,
  Ruler,
  DoorOpen,
  Camera,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  ArrowUpDown,
  Grid3X3,
  LayoutList,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrix, formatSurface } from "@/lib/utils";
import { TrackerVue } from "@/components/analytics/tracker-vue";
import type { Listing } from "@/types";

/* ── Types ── */
interface Filtres {
  recherche: string;
  transaction: string;
  typeBien: string;
  prixMin: string;
  prixMax: string;
  surfaceMin: string;
  surfaceMax: string;
  nbPiecesMin: string;
  document: string;
  ascenseur: boolean;
  garage: boolean;
  jardin: boolean;
  citerne: boolean;
}

const FILTRES_VIDES: Filtres = {
  recherche: "",
  transaction: "",
  typeBien: "",
  prixMin: "",
  prixMax: "",
  surfaceMin: "",
  surfaceMax: "",
  nbPiecesMin: "",
  document: "",
  ascenseur: false,
  garage: false,
  jardin: false,
  citerne: false,
};

type SortOption = "recent" | "prix_asc" | "prix_desc" | "surface_desc";

interface FiltresAvancesProps {
  annonces: Listing[];
  agenceId: string;
  slugAgence: string;
  locale: "fr" | "ar" | "en";
  wilayaMap: Record<number, { nom_fr: string; nom_ar: string }>;
}

/* ── Translations ── */
const labels = {
  fr: {
    rechercher: "Rechercher un bien...",
    filtres: "Filtres",
    transaction: "Transaction",
    tous: "Tous",
    vente: "Vente",
    location: "Location",
    vacances: "Vacances",
    typeBien: "Type de bien",
    budget: "Budget",
    prixMin: "Min",
    prixMax: "Max",
    surface: "Surface",
    surfaceMin: "Min",
    surfaceMax: "Max",
    pieces: "Pièces",
    document: "Document",
    equipements: "Équipements",
    ascenseur: "Ascenseur",
    garage: "Garage",
    jardin: "Jardin",
    citerne: "Citerne",
    effacer: "Réinitialiser",
    resultats: "résultat",
    resultats_p: "résultats",
    biens: "Nos biens",
    aucun: "Aucun bien trouvé",
    aucun_desc: "Modifiez vos filtres ou explorez toutes nos offres",
    voir_tout: "Voir tout",
    trier: "Trier",
    recent: "Plus récent",
    prix_asc: "Prix croissant",
    prix_desc: "Prix décroissant",
    surface_desc: "Plus grand",
    mois: "mois",
    da: "DA",
    m2: "m²",
    appliquer: "Appliquer",
    plus_filtres: "Plus de filtres",
  },
  ar: {
    rechercher: "ابحث عن عقار...",
    filtres: "الفلاتر",
    transaction: "نوع المعاملة",
    tous: "الكل",
    vente: "بيع",
    location: "إيجار",
    vacances: "عطلة",
    typeBien: "نوع العقار",
    budget: "الميزانية",
    prixMin: "الأدنى",
    prixMax: "الأقصى",
    surface: "المساحة",
    surfaceMin: "الأدنى",
    surfaceMax: "الأقصى",
    pieces: "غرف",
    document: "الوثيقة",
    equipements: "المميزات",
    ascenseur: "مصعد",
    garage: "مرآب",
    jardin: "حديقة",
    citerne: "خزان",
    effacer: "إعادة تعيين",
    resultats: "نتيجة",
    resultats_p: "نتائج",
    biens: "عقاراتنا",
    aucun: "لا توجد نتائج",
    aucun_desc: "عدّل الفلاتر أو تصفّح جميع العروض",
    voir_tout: "عرض الكل",
    trier: "ترتيب",
    recent: "الأحدث",
    prix_asc: "الأقل سعراً",
    prix_desc: "الأعلى سعراً",
    surface_desc: "الأكبر",
    mois: "شهر",
    da: "د.ج",
    m2: "م²",
    appliquer: "تطبيق",
    plus_filtres: "فلاتر إضافية",
  },
  en: {
    rechercher: "Search properties...",
    filtres: "Filters",
    transaction: "Transaction",
    tous: "All",
    vente: "Sale",
    location: "Rental",
    vacances: "Vacation",
    typeBien: "Property type",
    budget: "Budget",
    prixMin: "Min",
    prixMax: "Max",
    surface: "Area",
    surfaceMin: "Min",
    surfaceMax: "Max",
    pieces: "Rooms",
    document: "Document",
    equipements: "Amenities",
    ascenseur: "Elevator",
    garage: "Garage",
    jardin: "Garden",
    citerne: "Water tank",
    effacer: "Reset",
    resultats: "result",
    resultats_p: "results",
    biens: "Properties",
    aucun: "No properties found",
    aucun_desc: "Adjust your filters or browse all listings",
    voir_tout: "View all",
    trier: "Sort",
    recent: "Most recent",
    prix_asc: "Price: low to high",
    prix_desc: "Price: high to low",
    surface_desc: "Largest first",
    mois: "mo",
    da: "DZD",
    m2: "m²",
    appliquer: "Apply",
    plus_filtres: "More filters",
  },
};

/* ── Dropdown component ── */
function FilterDropdown({
  label,
  value,
  children,
  active,
}: {
  label: string;
  value?: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
          active
            ? "bg-bleu-nuit text-white border-bleu-nuit"
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
        }`}
        style={active ? {} : { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      >
        {label}
        {value && (
          <span className={active ? "text-amber-300" : "text-amber-600"}>
            {value}
          </span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            open ? "rotate-180" : ""
          } ${active ? "text-white/60" : "text-gray-400"}`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-2 z-[60] min-w-[280px] bg-white rounded-2xl border border-gray-200 p-4"
          style={{ boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.06)" }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export function FiltresAvances({
  annonces,
  agenceId,
  slugAgence,
  locale,
  wilayaMap,
}: FiltresAvancesProps) {
  const t = labels[locale];
  const [filtres, setFiltres] = useState<Filtres>(FILTRES_VIDES);
  const [tri, setTri] = useState<SortOption>("recent");
  const [triOuvert, setTriOuvert] = useState(false);
  const [plusFiltres, setPlusFiltres] = useState(false);
  const triRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (triRef.current && !triRef.current.contains(e.target as Node)) {
        setTriOuvert(false);
      }
    }
    if (triOuvert) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [triOuvert]);

  /* ── Available options from data ── */
  const typesDisponibles = useMemo(
    () => Array.from(new Set(annonces.map((a) => a.type_bien))).sort(),
    [annonces]
  );
  const documentsDisponibles = useMemo(
    () => Array.from(new Set(annonces.map((a) => a.statut_document))).sort(),
    [annonces]
  );

  /* ── Filtering logic ── */
  const resultats = useMemo(() => {
    let filtered = annonces.filter((a) => {
      if (filtres.recherche) {
        const q = filtres.recherche.toLowerCase();
        const inTitle = a.titre.toLowerCase().includes(q);
        const inDesc = a.description?.toLowerCase().includes(q);
        const inCommune = a.commune?.toLowerCase().includes(q);
        const w = wilayaMap[a.wilaya_id];
        const inWilaya =
          w &&
          (w.nom_fr.toLowerCase().includes(q) ||
            w.nom_ar.includes(q));
        if (!inTitle && !inDesc && !inCommune && !inWilaya) return false;
      }
      if (filtres.transaction && a.type_transaction !== filtres.transaction)
        return false;
      if (filtres.typeBien && a.type_bien !== filtres.typeBien) return false;
      if (filtres.prixMin && a.prix < Number(filtres.prixMin)) return false;
      if (filtres.prixMax && a.prix > Number(filtres.prixMax)) return false;
      if (filtres.surfaceMin && a.surface < Number(filtres.surfaceMin))
        return false;
      if (filtres.surfaceMax && a.surface > Number(filtres.surfaceMax))
        return false;
      if (
        filtres.nbPiecesMin &&
        (a.nb_pieces || 0) < Number(filtres.nbPiecesMin)
      )
        return false;
      if (filtres.document && a.statut_document !== filtres.document)
        return false;
      if (filtres.ascenseur && !a.ascenseur) return false;
      if (filtres.garage && !a.garage) return false;
      if (filtres.jardin && !a.jardin) return false;
      if (filtres.citerne && !a.citerne) return false;
      return true;
    });

    // Sort
    switch (tri) {
      case "prix_asc":
        filtered.sort((a, b) => a.prix - b.prix);
        break;
      case "prix_desc":
        filtered.sort((a, b) => b.prix - a.prix);
        break;
      case "surface_desc":
        filtered.sort((a, b) => b.surface - a.surface);
        break;
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
    }

    return filtered;
  }, [annonces, filtres, tri, wilayaMap]);

  /* ── Active filter count ── */
  const nbFiltresActifs = useMemo(() => {
    let n = 0;
    if (filtres.recherche) n++;
    if (filtres.transaction) n++;
    if (filtres.typeBien) n++;
    if (filtres.prixMin || filtres.prixMax) n++;
    if (filtres.surfaceMin || filtres.surfaceMax) n++;
    if (filtres.nbPiecesMin) n++;
    if (filtres.document) n++;
    if (filtres.ascenseur) n++;
    if (filtres.garage) n++;
    if (filtres.jardin) n++;
    if (filtres.citerne) n++;
    return n;
  }, [filtres]);

  const resetFiltres = useCallback(() => {
    setFiltres(FILTRES_VIDES);
    setTri("recent");
  }, []);

  const updateFiltre = useCallback(
    <K extends keyof Filtres>(key: K, value: Filtres[K]) => {
      setFiltres((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const triLabels: Record<SortOption, string> = {
    recent: t.recent,
    prix_asc: t.prix_asc,
    prix_desc: t.prix_desc,
    surface_desc: t.surface_desc,
  };

  return (
    <div>
      {/* ═══ Search + Filter bar ═══ */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-8">
          {/* Search row */}
          <div className="py-4">
            <div className="relative max-w-2xl">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={filtres.recherche}
                onChange={(e) => updateFiltre("recherche", e.target.value)}
                placeholder={t.rechercher}
                className="w-full h-12 ps-12 pe-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
              />
              {filtres.recherche && (
                <button
                  onClick={() => updateFiltre("recherche", "")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Filter chips row */}
          <div className="flex items-center gap-2 pb-4 flex-wrap">
            {/* Transaction tabs */}
            <div className="flex items-center bg-gray-50 rounded-xl p-1 flex-shrink-0">
              {[
                { val: "", label: t.tous },
                { val: "Vente", label: t.vente },
                { val: "Location", label: t.location },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => updateFiltre("transaction", val)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filtres.transaction === val
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="w-px h-8 bg-border flex-shrink-0" />

            {/* Property type dropdown */}
            <FilterDropdown
              label={t.typeBien}
              value={filtres.typeBien || undefined}
              active={!!filtres.typeBien}
            >
              <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => updateFiltre("typeBien", "")}
                  className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                    !filtres.typeBien
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {t.tous}
                </button>
                {typesDisponibles.map((type) => {
                  const count = annonces.filter(
                    (a) => a.type_bien === type
                  ).length;
                  return (
                    <button
                      key={type}
                      onClick={() => updateFiltre("typeBien", type)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        filtres.typeBien === type
                          ? "bg-amber-50 text-amber-700 font-medium"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {filtres.typeBien === type && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterDropdown>

            {/* Budget dropdown */}
            <FilterDropdown
              label={t.budget}
              value={
                filtres.prixMin || filtres.prixMax
                  ? `${filtres.prixMin || "0"} - ${filtres.prixMax || "∞"}`
                  : undefined
              }
              active={!!(filtres.prixMin || filtres.prixMax)}
            >
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      {t.prixMin}
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filtres.prixMin}
                      onChange={(e) =>
                        updateFiltre("prixMin", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      {t.prixMax}
                    </label>
                    <input
                      type="number"
                      placeholder="∞"
                      value={filtres.prixMax}
                      onChange={(e) =>
                        updateFiltre("prixMax", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>
                {/* Quick presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { min: "", max: "5000000", label: "< 5M" },
                    { min: "5000000", max: "15000000", label: "5-15M" },
                    { min: "15000000", max: "30000000", label: "15-30M" },
                    { min: "30000000", max: "", label: "> 30M" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        updateFiltre("prixMin", preset.min);
                        updateFiltre("prixMax", preset.max);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        filtres.prixMin === preset.min &&
                        filtres.prixMax === preset.max
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-400"
                      }`}
                    >
                      {preset.label} {t.da}
                    </button>
                  ))}
                </div>
              </div>
            </FilterDropdown>

            {/* Rooms dropdown */}
            <FilterDropdown
              label={t.pieces}
              value={
                filtres.nbPiecesMin
                  ? filtres.nbPiecesMin === "5"
                    ? "5+"
                    : filtres.nbPiecesMin
                  : undefined
              }
              active={!!filtres.nbPiecesMin}
            >
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {["1", "2", "3", "4", "5"].map((val) => (
                  <button
                    key={val}
                    onClick={() =>
                      updateFiltre(
                        "nbPiecesMin",
                        filtres.nbPiecesMin === val ? "" : val
                      )
                    }
                    className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all ${
                      filtres.nbPiecesMin === val
                        ? "bg-bleu-nuit text-white shadow-sm"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {val === "5" ? "5+" : val}
                  </button>
                ))}
              </div>
            </FilterDropdown>

            {/* More filters button */}
            <button
              onClick={() => setPlusFiltres(!plusFiltres)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                plusFiltres
                  ? "bg-bleu-nuit text-white border-bleu-nuit"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {t.plus_filtres}
              {(filtres.ascenseur ||
                filtres.garage ||
                filtres.jardin ||
                filtres.citerne ||
                filtres.document ||
                filtres.surfaceMin ||
                filtres.surfaceMax) && (
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>

            {/* Reset */}
            {nbFiltresActifs > 0 && (
              <button
                onClick={resetFiltres}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all whitespace-nowrap flex-shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.effacer}
              </button>
            )}
          </div>

          {/* ═══ Expanded advanced filters ═══ */}
          {plusFiltres && (
            <div className="pb-5 pt-1 border-t border-gray-200 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {/* Surface */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.surface} ({t.m2})
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder={t.surfaceMin}
                      value={filtres.surfaceMin}
                      onChange={(e) =>
                        updateFiltre("surfaceMin", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                    <input
                      type="number"
                      placeholder={t.surfaceMax}
                      value={filtres.surfaceMax}
                      onChange={(e) =>
                        updateFiltre("surfaceMax", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
                    />
                  </div>
                </div>

                {/* Document */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.document}
                  </label>
                  <select
                    value={filtres.document}
                    onChange={(e) =>
                      updateFiltre("document", e.target.value)
                    }
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200 appearance-none cursor-pointer"
                  >
                    <option value="">{t.tous}</option>
                    {documentsDisponibles.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amenities */}
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    {t.equipements}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { key: "ascenseur" as const, label: t.ascenseur },
                        { key: "garage" as const, label: t.garage },
                        { key: "jardin" as const, label: t.jardin },
                        { key: "citerne" as const, label: t.citerne },
                      ] as const
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => updateFiltre(key, !filtres[key])}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          filtres[key]
                            ? "bg-bleu-nuit text-white border-bleu-nuit shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                            filtres[key]
                              ? "bg-amber-500 border-amber-500"
                              : "border-gray-300"
                          }`}
                        >
                          {filtres[key] && (
                            <Check className="h-2.5 w-2.5 text-white" />
                          )}
                        </div>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Results section ═══ */}
      <div className="container mx-auto px-4 md:px-8 py-10 md:py-14">
        {/* Results header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {t.biens}
            </h2>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
              {resultats.length}
            </span>
            {nbFiltresActifs > 0 && (
              <button
                onClick={resetFiltres}
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
                {(
                  Object.entries(triLabels) as [SortOption, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setTri(key);
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter tags */}
        {nbFiltresActifs > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {filtres.recherche && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                <Search className="h-3 w-3 text-gray-400" />
                &ldquo;{filtres.recherche}&rdquo;
                <button
                  onClick={() => updateFiltre("recherche", "")}
                  className="ms-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filtres.transaction && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                {filtres.transaction === "Vente" ? t.vente : t.location}
                <button
                  onClick={() => updateFiltre("transaction", "")}
                  className="ms-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filtres.typeBien && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                {filtres.typeBien}
                <button
                  onClick={() => updateFiltre("typeBien", "")}
                  className="ms-1 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Empty state */}
        {resultats.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-3xl flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">
              {t.aucun}
            </p>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              {t.aucun_desc}
            </p>
            <Button
              onClick={resetFiltres}
              className="bg-or hover:bg-or/90 text-bleu-nuit font-semibold rounded-xl"
            >
              <Sparkles className="h-4 w-4 me-2" />
              {t.voir_tout}
            </Button>
          </div>
        ) : (
          /* Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resultats.map((bien) => {
              const w = wilayaMap[bien.wilaya_id];
              const wilayaNom = w
                ? locale === "ar"
                  ? w.nom_ar
                  : w.nom_fr
                : "";
              const hasPhotos = bien.photos && bien.photos.length > 0;

              return (
                <Link
                  key={bien.id}
                  href={`/${locale}/${slugAgence}/${bien.id}`}
                  className="group block rounded-2xl bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <TrackerVue listingId={bien.id} agentId={agenceId} />

                  {/* Image */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {hasPhotos ? (
                      <img
                        src={bien.photos[0]}
                        alt={bien.titre}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                        <Building2 className="h-10 w-10 text-gray-200" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Badge transaction */}
                    <div className="absolute top-3 start-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-md ${
                          bien.type_transaction === "Vente"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-blue-500/90 text-white"
                        }`}
                      >
                        {bien.type_transaction === "Vente"
                          ? t.vente
                          : t.location}
                      </span>
                    </div>

                    {/* Photo count */}
                    {bien.photos && bien.photos.length > 1 && (
                      <div className="absolute top-3 end-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 text-white text-[11px] font-medium backdrop-blur-md">
                        <Camera className="h-3 w-3" />
                        {bien.photos.length}
                      </div>
                    )}

                    {/* Price */}
                    <div className="absolute bottom-3 start-3">
                      <p className="text-white text-lg font-bold drop-shadow-md">
                        {formatPrix(bien.prix)}
                        {bien.type_transaction === "Location" && (
                          <span className="text-white/70 text-xs font-normal ms-1">
                            /{t.mois}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors duration-200">
                        {bien.titre}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-[11px] font-semibold text-amber-700 whitespace-nowrap flex-shrink-0">
                        {bien.type_bien}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1.5 mb-4">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {bien.commune && `${bien.commune}, `}
                      {wilayaNom}
                    </p>

                    {/* Specs row */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 border-t border-gray-200 pt-3">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50">
                        <Ruler className="h-3 w-3 text-amber-600" />
                        {formatSurface(bien.surface)}
                      </span>
                      {bien.nb_pieces && (
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50">
                          <DoorOpen className="h-3 w-3 text-amber-600" />
                          {bien.nb_pieces}{" "}
                          {locale === "ar"
                            ? "غرف"
                            : locale === "en"
                            ? "rooms"
                            : "pcs"}
                        </span>
                      )}
                      <span className="ms-auto text-[11px] px-2 py-1 rounded-lg bg-gray-50 font-medium">
                        {bien.statut_document}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
