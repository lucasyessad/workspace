"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Home,
  Building2,
  ArrowRight,
  Check,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { WILAYAS } from "@/lib/wilayas";

const TYPES_TRANSACTION = [
  { val: "", label: "Tous", labelAr: "الكل", labelEn: "All" },
  { val: "Vente", label: "Acheter", labelAr: "شراء", labelEn: "Buy" },
  { val: "Location", label: "Louer", labelAr: "إيجار", labelEn: "Rent" },
];

const TYPES_BIEN = [
  { val: "", label: "Tout type", labelAr: "الكل", labelEn: "All types" },
  { val: "Appartement F1", label: "F1" },
  { val: "Appartement F2", label: "F2" },
  { val: "Appartement F3", label: "F3" },
  { val: "Appartement F4", label: "F4" },
  { val: "Appartement F5+", label: "F5+" },
  { val: "Villa", label: "Villa" },
  { val: "Studio", label: "Studio" },
  { val: "Duplex", label: "Duplex" },
  { val: "Terrain", label: "Terrain", labelAr: "أرض", labelEn: "Land" },
  { val: "Local Commercial", label: "Local", labelAr: "محل", labelEn: "Commercial" },
  { val: "Bureau", label: "Bureau", labelAr: "مكتب", labelEn: "Office" },
  { val: "Hangar", label: "Hangar" },
];

const BUDGETS = [
  { val: "", max: "", label: "Tout budget" },
  { val: "", max: "5000000", label: "< 5M DA" },
  { val: "5000000", max: "15000000", label: "5 – 15M DA" },
  { val: "15000000", max: "30000000", label: "15 – 30M DA" },
  { val: "30000000", max: "", label: "> 30M DA" },
];

/* ── Dropdown select ── */
function DropdownSelect({
  label,
  icon: Icon,
  value,
  displayValue,
  children,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  displayValue: string;
  children: React.ReactNode;
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
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-start group"
      >
        <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
            {label}
          </p>
          <p className={`text-sm font-medium truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
            {displayValue}
          </p>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-gray-400 transition-transform flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-[60] w-full min-w-[240px] max-h-[300px] overflow-y-auto bg-white rounded-2xl border border-gray-200 p-2"
          style={{ boxShadow: "0 8px 30px -8px rgba(0,0,0,0.12), 0 4px 12px -4px rgba(0,0,0,0.06)" }}
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
export function BarreRechercheHero() {
  const router = useRouter();

  const [transaction, setTransaction] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [typeBien, setTypeBien] = useState("");
  const [budget, setBudget] = useState({ min: "", max: "" });
  const [recherche, setRecherche] = useState("");
  const [showMore, setShowMore] = useState(false);

  const wilayaObj = wilaya ? WILAYAS.find((w) => w.id === parseInt(wilaya)) : null;

  function handleSearch() {
    const params = new URLSearchParams();
    if (recherche) params.set("q", recherche);
    if (transaction) params.set("transaction", transaction);
    if (wilaya) params.set("wilaya", wilaya);
    if (typeBien) params.set("type_bien", typeBien);
    if (budget.min) params.set("prix_min", budget.min);
    if (budget.max) params.set("prix_max", budget.max);

    const qs = params.toString();
    router.push(`/fr/recherche${qs ? `?${qs}` : ""}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Transaction tabs */}
      <div className="flex items-center gap-1 mb-3">
        {TYPES_TRANSACTION.map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setTransaction(val)}
            className={`px-5 py-2 rounded-t-xl text-sm font-semibold transition-all ${
              transaction === val
                ? "bg-white text-gray-900 shadow-sm"
                : "bg-white/50 text-gray-400 hover:bg-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main search card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Top row: text search */}
        <div className="flex items-center border-b border-gray-200">
          <div className="flex-1 flex items-center px-5">
            <Search className="h-5 w-5 text-or flex-shrink-0" />
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Quartier, ville, mot-clé..."
              className="w-full h-14 px-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {recherche && (
              <button
                onClick={() => setRecherche("")}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-stretch divide-x divide-gray-200">
          {/* Wilaya */}
          <DropdownSelect
            label="Localisation"
            icon={MapPin}
            value={wilaya}
            displayValue={wilayaObj ? wilayaObj.nom_fr : "Toute l'Algérie"}
          >
            <button
              onClick={() => setWilaya("")}
              className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                !wilaya ? "bg-amber-50 text-amber-700 font-medium" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              Toute l&apos;Algérie
            </button>
            {WILAYAS.map((w) => (
              <button
                key={w.id}
                onClick={() => setWilaya(String(w.id))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  wilaya === String(w.id)
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  {wilaya === String(w.id) && <Check className="h-3.5 w-3.5" />}
                  {w.nom_fr}
                </span>
                <span className="text-xs text-gray-400">{w.code}</span>
              </button>
            ))}
          </DropdownSelect>

          {/* Type de bien */}
          <DropdownSelect
            label="Type de bien"
            icon={Home}
            value={typeBien}
            displayValue={
              typeBien
                ? TYPES_BIEN.find((t) => t.val === typeBien)?.label || typeBien
                : "Tout type"
            }
          >
            {TYPES_BIEN.map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setTypeBien(val)}
                className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                  typeBien === val
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {typeBien === val && (
                  <Check className="inline h-3.5 w-3.5 me-2" />
                )}
                {label}
              </button>
            ))}
          </DropdownSelect>

          {/* Budget */}
          <DropdownSelect
            label="Budget"
            icon={Building2}
            value={budget.min || budget.max ? "set" : ""}
            displayValue={
              budget.min || budget.max
                ? BUDGETS.find(
                    (b) => b.val === budget.min && b.max === budget.max
                  )?.label || `${budget.min || "0"} – ${budget.max || "∞"}`
                : "Tout budget"
            }
          >
            {BUDGETS.map(({ val, max, label }) => (
              <button
                key={label}
                onClick={() => setBudget({ min: val, max })}
                className={`w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${
                  budget.min === val && budget.max === max
                    ? "bg-amber-50 text-amber-700 font-medium"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {budget.min === val && budget.max === max && (
                  <Check className="inline h-3.5 w-3.5 me-2" />
                )}
                {label}
              </button>
            ))}
          </DropdownSelect>

          {/* Search button */}
          <div className="flex items-center px-3">
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 h-12 px-6 bg-or hover:bg-or/90 text-bleu-nuit font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Rechercher</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="flex items-center justify-between mt-4 px-1">
        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>Populaire :</span>
          {[
            { label: "Alger", wilayaId: "16" },
            { label: "Oran", wilayaId: "31" },
            { label: "Constantine", wilayaId: "25" },
            { label: "Tizi Ouzou", wilayaId: "15" },
          ].map(({ label, wilayaId }) => (
            <button
              key={wilayaId}
              onClick={() => {
                setWilaya(wilayaId);
                handleSearch();
              }}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all text-xs font-medium backdrop-blur-sm"
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push("/fr/recherche")}
          className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
        >
          Recherche avancée
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
