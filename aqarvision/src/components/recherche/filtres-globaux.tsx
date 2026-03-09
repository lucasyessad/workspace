"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  MapPin,
} from "lucide-react";
import { WILAYAS } from "@/lib/wilayas";
import type { Locale } from "@/lib/i18n";

/* ── Translations ── */
const labels = {
  fr: {
    rechercher: "Rechercher un bien partout en Algérie...",
    tous: "Tous",
    vente: "Vente",
    location: "Location",
    typeBien: "Type de bien",
    wilaya: "Wilaya",
    budget: "Budget",
    prixMin: "Min",
    prixMax: "Max",
    pieces: "Pièces",
    surface: "Surface",
    surfaceMin: "Min m²",
    surfaceMax: "Max m²",
    document: "Document",
    equipements: "Équipements",
    ascenseur: "Ascenseur",
    garage: "Garage",
    jardin: "Jardin",
    citerne: "Citerne",
    effacer: "Réinitialiser",
    plus_filtres: "Plus de filtres",
    da: "DA",
    m2: "m²",
    toutes: "Toutes les wilayas",
    tout_type: "Tout type",
    tout_budget: "Tout budget",
  },
  ar: {
    rechercher: "ابحث عن عقار في كل أنحاء الجزائر...",
    tous: "الكل",
    vente: "بيع",
    location: "إيجار",
    typeBien: "نوع العقار",
    wilaya: "الولاية",
    budget: "الميزانية",
    prixMin: "الأدنى",
    prixMax: "الأقصى",
    pieces: "غرف",
    surface: "المساحة",
    surfaceMin: "الأدنى م²",
    surfaceMax: "الأقصى م²",
    document: "الوثيقة",
    equipements: "المميزات",
    ascenseur: "مصعد",
    garage: "مرآب",
    jardin: "حديقة",
    citerne: "خزان",
    effacer: "إعادة تعيين",
    plus_filtres: "فلاتر إضافية",
    da: "د.ج",
    m2: "م²",
    toutes: "كل الولايات",
    tout_type: "الكل",
    tout_budget: "كل الميزانيات",
  },
  en: {
    rechercher: "Search properties across Algeria...",
    tous: "All",
    vente: "Sale",
    location: "Rental",
    typeBien: "Property type",
    wilaya: "Province",
    budget: "Budget",
    prixMin: "Min",
    prixMax: "Max",
    pieces: "Rooms",
    surface: "Area",
    surfaceMin: "Min m²",
    surfaceMax: "Max m²",
    document: "Document",
    equipements: "Amenities",
    ascenseur: "Elevator",
    garage: "Garage",
    jardin: "Garden",
    citerne: "Water tank",
    effacer: "Reset",
    plus_filtres: "More filters",
    da: "DZD",
    m2: "m²",
    toutes: "All provinces",
    tout_type: "All types",
    tout_budget: "Any budget",
  },
};

const TYPES_BIEN = [
  "Villa",
  "Appartement F1",
  "Appartement F2",
  "Appartement F3",
  "Appartement F4",
  "Appartement F5+",
  "Terrain",
  "Local Commercial",
  "Duplex",
  "Studio",
  "Hangar",
  "Bureau",
];

const DOCUMENTS = [
  "Acte",
  "Livret foncier",
  "Concession",
  "Promesse de vente",
  "Timbré",
  "Autre",
];

/* ── Dropdown ── */
function FilterDropdown({
  label,
  displayText,
  children,
  active,
}: {
  label: string;
  displayText: string;
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
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 h-10 px-4 rounded-xl border text-sm font-medium transition-all whitespace-nowrap ${
          active
            ? "bg-bleu-nuit text-white border-bleu-nuit"
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
        }`}
      >
        <span>{label}</span>
        {active && (
          <span className="text-xs text-or font-semibold">{displayText}</span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""} ${
            active ? "text-white/60" : "text-gray-400"
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-[60] min-w-[260px] max-h-[320px] overflow-y-auto bg-white rounded-2xl border border-gray-200 p-3"
          style={{ boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12)" }}
        >
          <div onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
interface FiltresGlobauxProps {
  locale: Locale;
}

export function FiltresGlobaux({ locale }: FiltresGlobauxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = labels[locale];

  const [recherche, setRecherche] = useState(searchParams.get("q") || "");
  const [plusFiltres, setPlusFiltres] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setRecherche(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        pushParams({ q: value });
      }, 400);
    },
    [pushParams]
  );

  const getParam = (key: string) => searchParams.get(key) || "";

  const nbFiltresActifs = [
    "q", "transaction", "type_bien", "wilaya", "prix_min", "prix_max",
    "surface_min", "surface_max", "nb_pieces", "document",
    "ascenseur", "garage", "jardin", "citerne",
  ].filter((k) => searchParams.has(k)).length;

  const resetFiltres = () => {
    setRecherche("");
    router.push(pathname, { scroll: false });
  };

  const wilayaActive = getParam("wilaya");
  const wilayaLabel = wilayaActive
    ? WILAYAS.find((w) => w.id === parseInt(wilayaActive))
        ?.[locale === "ar" ? "nom_ar" : "nom_fr"] || ""
    : "";

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-8">
        {/* Search row */}
        <div className="py-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={t.rechercher}
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
            />
            {recherche && (
              <button
                onClick={() => handleSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips row — NO overflow hidden so dropdowns can escape */}
        <div className="flex items-center gap-2 pb-4 flex-wrap">
          {/* Transaction tabs */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 flex-shrink-0">
            {[
              { val: "", label: t.tous },
              { val: "Vente", label: t.vente },
              { val: "Location", label: t.location },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => pushParams({ transaction: val })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  getParam("transaction") === val ||
                  (!getParam("transaction") && val === "")
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-gray-200 flex-shrink-0" />

          {/* Wilaya */}
          <FilterDropdown
            label={t.wilaya}
            displayText={wilayaLabel}
            active={!!wilayaActive}
          >
            <div className="space-y-0.5">
              <button
                onClick={() => pushParams({ wilaya: "" })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !wilayaActive
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {t.toutes}
              </button>
              {WILAYAS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => pushParams({ wilaya: String(w.id) })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    wilayaActive === String(w.id)
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {wilayaActive === String(w.id) && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    {locale === "ar" ? w.nom_ar : w.nom_fr}
                  </span>
                  <span className="text-xs text-gray-400">{w.code}</span>
                </button>
              ))}
            </div>
          </FilterDropdown>

          {/* Type de bien */}
          <FilterDropdown
            label={t.typeBien}
            displayText={getParam("type_bien")}
            active={!!getParam("type_bien")}
          >
            <div className="space-y-0.5">
              <button
                onClick={() => pushParams({ type_bien: "" })}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  !getParam("type_bien")
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {t.tout_type}
              </button>
              {TYPES_BIEN.map((type) => (
                <button
                  key={type}
                  onClick={() => pushParams({ type_bien: type })}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    getParam("type_bien") === type
                      ? "bg-amber-50 text-amber-700 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {getParam("type_bien") === type && (
                    <Check className="inline h-3.5 w-3.5 mr-2" />
                  )}
                  {type}
                </button>
              ))}
            </div>
          </FilterDropdown>

          {/* Budget */}
          <FilterDropdown
            label={t.budget}
            displayText={
              getParam("prix_min") || getParam("prix_max")
                ? `${getParam("prix_min") || "0"} - ${getParam("prix_max") || "∞"}`
                : ""
            }
            active={!!(getParam("prix_min") || getParam("prix_max"))}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {t.prixMin}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    defaultValue={getParam("prix_min")}
                    onBlur={(e) => pushParams({ prix_min: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    {t.prixMax}
                  </label>
                  <input
                    type="number"
                    placeholder="∞"
                    defaultValue={getParam("prix_max")}
                    onBlur={(e) => pushParams({ prix_max: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { min: "", max: "5000000", label: "< 5M" },
                  { min: "5000000", max: "15000000", label: "5-15M" },
                  { min: "15000000", max: "30000000", label: "15-30M" },
                  { min: "30000000", max: "", label: "> 30M" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() =>
                      pushParams({ prix_min: preset.min, prix_max: preset.max })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      getParam("prix_min") === preset.min &&
                      getParam("prix_max") === preset.max
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {preset.label} {t.da}
                  </button>
                ))}
              </div>
            </div>
          </FilterDropdown>

          {/* Rooms */}
          <FilterDropdown
            label={t.pieces}
            displayText={
              getParam("nb_pieces")
                ? getParam("nb_pieces") === "5"
                  ? "5+"
                  : getParam("nb_pieces")
                : ""
            }
            active={!!getParam("nb_pieces")}
          >
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5"].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    pushParams({
                      nb_pieces: getParam("nb_pieces") === val ? "" : val,
                    })
                  }
                  className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all ${
                    getParam("nb_pieces") === val
                      ? "bg-bleu-nuit text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {val === "5" ? "5+" : val}
                </button>
              ))}
            </div>
          </FilterDropdown>

          {/* More filters */}
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

        {/* Expanded advanced filters */}
        {plusFiltres && (
          <div className="pb-5 pt-1 border-t border-gray-200">
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
                    defaultValue={getParam("surface_min")}
                    onBlur={(e) =>
                      pushParams({ surface_min: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                  <input
                    type="number"
                    placeholder={t.surfaceMax}
                    defaultValue={getParam("surface_max")}
                    onBlur={(e) =>
                      pushParams({ surface_max: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>

              {/* Document */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  {t.document}
                </label>
                <select
                  value={getParam("document")}
                  onChange={(e) =>
                    pushParams({ document: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 appearance-none cursor-pointer"
                >
                  <option value="">{t.tous}</option>
                  {DOCUMENTS.map((doc) => (
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
                      { key: "ascenseur", label: t.ascenseur },
                      { key: "garage", label: t.garage },
                      { key: "jardin", label: t.jardin },
                      { key: "citerne", label: t.citerne },
                    ] as const
                  ).map(({ key, label }) => {
                    const isActive = getParam(key) === "1";
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          pushParams({ [key]: isActive ? "" : "1" })
                        }
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          isActive
                            ? "bg-bleu-nuit text-white border-bleu-nuit"
                            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                            isActive
                              ? "bg-or border-or"
                              : "border-gray-300"
                          }`}
                        >
                          {isActive && (
                            <Check className="h-2.5 w-2.5 text-bleu-nuit" />
                          )}
                        </div>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
