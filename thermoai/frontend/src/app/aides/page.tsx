"use client";
import Link from "next/link";
import { ArrowRight, ChevronRight, Check, Info } from "lucide-react";

const BREADCRUMB = ["Accueil", "Aides & Primes"];

const AIDS_DETAIL = [
  {
    id: "maprimerenov",
    title: "MaPrimeRénov'",
    short: "MPR",
    tagline: "L'aide principale de l'État pour la rénovation énergétique",
    color: `var(--brand-500)`,
    bg: `var(--brand-50)`,
    max: "70 %",
    maxLabel: "du coût des travaux",
    who: "Tous les propriétaires",
    description: "MaPrimeRénov' est versée par l'ANAH et accessible à tous les propriétaires occupants, bailleurs et copropriétés. Son montant varie en fonction des revenus fiscaux de référence et du type de travaux.",
    variants: [
      { label: "Parcours par geste", desc: "Isolation, chauffage, VMC — geste unique ou combiné", amount: "15 %–70 % selon revenus" },
      { label: "Parcours accompagné", desc: "Rénovation globale avec gain ≥ 2 classes DPE (MAR obligatoire)", amount: "jusqu'à 70 % + bonus" },
      { label: "Copropriété", desc: "30 % à 45 % du coût des parties communes", amount: "jusqu'à 25 000 € / logement" },
    ],
    table: [
      { profile: "Très modeste",  color: `var(--brand-500)`, isolation: "70 %", chauffage: "70 %", fenetres: "40 %" },
      { profile: "Modeste",       color: "#3b82f6", isolation: "60 %", chauffage: "60 %", fenetres: "40 %" },
      { profile: "Intermédiaire", color: "#f59e0b", isolation: "45 %", chauffage: "50 %", fenetres: "15 %" },
      { profile: "Aisé",          color: "#ef4444", isolation: "30 %", chauffage: "40 %", fenetres: "15 %" },
    ],
    conditions: [
      "Travaux réalisés par un artisan RGE",
      "Logement construit depuis plus de 15 ans",
      "Résidence principale occupée",
      "Revenus fiscaux sous plafonds ANAH",
    ],
  },
  {
    id: "cee",
    title: "Prime Énergie (CEE)",
    short: "CEE",
    tagline: "Financée par les fournisseurs d'énergie, sans condition de revenus",
    color: "#000091",
    bg: "#e8eeff",
    max: "5 600 €",
    maxLabel: "pour une pompe à chaleur",
    who: "Tous ménages",
    description: "Les Certificats d'Économies d'Énergie (CEE) sont financés par les fournisseurs d'énergie qui ont l'obligation légale de promouvoir l'efficacité énergétique. La prime est versée directement sans condition de revenus.",
    variants: [
      { label: "Prime classique", desc: "Calculée sur les kWh d'économies générées par les travaux", amount: "variable selon geste" },
      { label: "Coup de pouce Chauffage", desc: "Remplacement d'une chaudière fioul ou charbon", amount: "jusqu'à 4 000 €" },
      { label: "Coup de pouce Rénovation performante", desc: "Rénovation globale avec gain ≥ 2 classes DPE", amount: "majoration + 50 %" },
    ],
    table: [
      { profile: "Très modeste",  color: `var(--brand-500)`, isolation: "2 000 €", chauffage: "4 000 €", fenetres: "800 €" },
      { profile: "Modeste",       color: "#3b82f6", isolation: "1 500 €", chauffage: "3 000 €", fenetres: "600 €" },
      { profile: "Intermédiaire", color: "#f59e0b", isolation: "1 200 €", chauffage: "2 000 €", fenetres: "500 €" },
      { profile: "Aisé",          color: "#ef4444", isolation: "800 €",   chauffage: "1 500 €", fenetres: "400 €" },
    ],
    conditions: [
      "Travaux réalisés par un professionnel RGE",
      "Devis signé après le dépôt du dossier",
      "Cumulable avec MaPrimeRénov'",
      "Accessible aux propriétaires et locataires",
    ],
  },
  {
    id: "eco-ptz",
    title: "Éco-PTZ",
    short: "Éco-PTZ",
    tagline: "Prêt à taux zéro pour financer le reste à charge",
    color: "#7C3AED",
    bg: "#f3e8ff",
    max: "50 000 €",
    maxLabel: "sans intérêts — jusqu'à 20 ans",
    who: "Propriétaires occupants & bailleurs",
    description: "L'Éco-Prêt à Taux Zéro permet de financer les travaux de rénovation énergétique sans payer d'intérêts. Il est cumulable avec MaPrimeRénov' et les CEE pour couvrir le reste à charge.",
    variants: [
      { label: "Éco-PTZ geste unique", desc: "1 ou 2 travaux éligibles", amount: "jusqu'à 15 000 €" },
      { label: "Éco-PTZ multi-gestes", desc: "3 travaux éligibles ou plus", amount: "jusqu'à 30 000 €" },
      { label: "Éco-PTZ global",       desc: "Rénovation globale accompagnée", amount: "jusqu'à 50 000 €" },
    ],
    table: [
      { profile: "Geste unique",   color: "#7C3AED", isolation: "15 000 €", chauffage: "15 000 €", fenetres: "15 000 €" },
      { profile: "Multi-gestes",   color: "#7C3AED", isolation: "30 000 €", chauffage: "30 000 €", fenetres: "30 000 €" },
      { profile: "Rénovation globale", color: "#7C3AED", isolation: "50 000 €", chauffage: "50 000 €", fenetres: "50 000 €" },
    ],
    conditions: [
      "Logement construit depuis plus de 2 ans",
      "Résidence principale ou secondaire",
      "Remboursement sur 3 à 20 ans",
      "Cumulable avec MPR et CEE",
    ],
  },
  {
    id: "tva",
    title: "TVA réduite à 5,5 %",
    short: "TVA",
    tagline: "Applicable directement sur la facture de l'artisan",
    color: "#D97706",
    bg: "#fffbeb",
    max: "5,5 %",
    maxLabel: "au lieu de 20 % — sur main-d'œuvre et matériaux",
    who: "Tous logements de + de 2 ans",
    description: "La TVA à taux réduit de 5,5 % s'applique automatiquement aux travaux de rénovation énergétique sur les logements achevés depuis plus de 2 ans. L'artisan l'applique directement sur sa facture.",
    variants: [
      { label: "Sur la main-d'œuvre", desc: "Coût de pose et installation", amount: "5,5 % au lieu de 20 %" },
      { label: "Sur les matériaux",    desc: "Équipements et matériaux éligibles", amount: "5,5 % au lieu de 20 %" },
      { label: "Économie moyenne",     desc: "Pour un projet de 20 000 € TTC", amount: "≈ 2 500 € économisés" },
    ],
    table: [
      { profile: "Isolation murs",   color: "#D97706", isolation: "5,5 %", chauffage: "—",    fenetres: "—" },
      { profile: "Pompe à chaleur",  color: "#D97706", isolation: "—",     chauffage: "5,5 %", fenetres: "—" },
      { profile: "Fenêtres",         color: "#D97706", isolation: "—",     chauffage: "—",     fenetres: "5,5 %" },
    ],
    conditions: [
      "Logement achevé depuis plus de 2 ans",
      "Travaux réalisés par une entreprise",
      "Ne concerne pas les travaux en auto-construction",
      "Applicable sans condition de revenus",
    ],
  },
];

const BONUS_AIDS = [
  { label: "Aides locales et régionales", desc: "Complément de 1 000 € à 10 000 € selon la collectivité. Cumulables avec les aides nationales.", color: "#0891B2" },
  { label: "Action Logement",             desc: "Jusqu'à 20 000 € pour les salariés du secteur privé employeur adhérent.", color: "#059669" },
  { label: "Prêt Avance Rénovation",      desc: "Prêt hypothécaire remboursable lors de la vente du bien. Pour les ménages modestes.", color: "#7C3AED" },
  { label: "Denormandie",                 desc: "Réduction d'impôt pour les propriétaires bailleurs en zone Action Cœur de Ville.", color: "#DC2626" },
];

function PublicNav() {
  return (
    <header className="bg-white sticky top-0 z-10" style={{ borderBottom: "2px solid #18753c" }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded flex items-center justify-center text-sm" style={{ backgroundColor: `var(--brand-500)` }}>🌡️</div>
          <span className="font-bold">ThermoPilot <span style={{ color: `var(--brand-500)` }}>AI</span></span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/simulateur" className="text-sm font-semibold px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Simuler mes aides
          </Link>
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded text-white transition-colors"
            style={{ backgroundColor: `var(--brand-500)` }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
          >
            Espace pro
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function AidesPage() {
  return (
    <div style={{ fontFamily: "Outfit, system-ui, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            {BREADCRUMB.map((b, i) => (
              <span key={b} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={11} />}
                <span className={i === BREADCRUMB.length - 1 ? "text-gray-700 font-medium" : ""}>{b}</span>
              </span>
            ))}
          </div>

          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
              Aides & Primes
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Aides à la rénovation énergétique : tout ce que vous devez savoir
            </h1>
            <p className="text-gray-500 leading-relaxed mb-6">
              MaPrimeRénov', CEE, Éco-PTZ, TVA réduite… Les aides pour financer vos travaux de rénovation sont nombreuses et cumulables. Découvrez lesquelles vous concernent et calculez vos montants.
            </p>
            <Link href="/simulateur"
              className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm text-white"
              style={{ backgroundColor: `var(--brand-500)` }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
            >
              Calculer mes aides en 5 minutes <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Vue d'ensemble — 4 cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AIDS_DETAIL.map((a) => (
              <a key={a.id} href={`#${a.id}`}
                className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all group block cursor-pointer">
                <div className="h-1.5" style={{ backgroundColor: a.color }} />
                <div className="p-5">
                  <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-xs mb-4"
                    style={{ backgroundColor: a.bg, color: a.color }}>
                    {a.short}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: a.color }}>{a.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-0.5">{a.max}</p>
                  <p className="text-xs text-gray-400 mb-2">{a.maxLabel}</p>
                  <p className="text-xs text-gray-500">{a.tagline}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: a.color }}>
                    En savoir plus <ChevronRight size={12} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Détail chaque aide */}
      {AIDS_DETAIL.map((a) => (
        <section key={a.id} id={a.id} className="py-16 scroll-mt-16"
          style={{ backgroundColor: a.id === "cee" || a.id === "tva" ? "#f4f4f4" : "#ffffff" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contenu principal */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white"
                    style={{ backgroundColor: a.color }}>
                    {a.short.slice(0, 3)}
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: a.color }}>{a.title}</p>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{a.tagline}</h2>
                <p className="text-gray-500 leading-relaxed mb-8">{a.description}</p>

                {/* Variants */}
                <h3 className="font-bold text-gray-800 mb-4">Différents parcours disponibles</h3>
                <div className="space-y-3 mb-8">
                  {a.variants.map((v) => (
                    <div key={v.label} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-md">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{v.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
                      </div>
                      <p className="text-sm font-bold flex-shrink-0" style={{ color: a.color }}>{v.amount}</p>
                    </div>
                  ))}
                </div>

                {/* Conditions */}
                <h3 className="font-bold text-gray-800 mb-3">Conditions d'éligibilité</h3>
                <ul className="space-y-2">
                  {a.conditions.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className="flex-shrink-0 mt-0.5" style={{ color: a.color }} />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                {/* Chiffre clé */}
                <div className="rounded-md p-6 text-center" style={{ backgroundColor: a.bg, border: `2px solid ${a.color}30` }}>
                  <p className="text-4xl font-bold mb-1" style={{ color: a.color }}>{a.max}</p>
                  <p className="text-sm text-gray-600">{a.maxLabel}</p>
                  <p className="text-xs text-gray-400 mt-1">Accessible à : {a.who}</p>
                </div>

                {/* Tableau par profil */}
                <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Montants indicatifs</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <div className="grid grid-cols-4 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase">
                      <span>Profil</span><span>Isolation</span><span>Chauffage</span><span>Fenêtres</span>
                    </div>
                    {a.table.map((row) => (
                      <div key={row.profile} className="grid grid-cols-4 px-4 py-2.5 text-xs items-center">
                        <span className="font-semibold" style={{ color: row.color }}>{row.profile}</span>
                        <span>{row.isolation}</span>
                        <span>{row.chauffage}</span>
                        <span>{row.fenetres}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA simulateur */}
                <div className="bg-white border border-gray-200 rounded-md p-5 text-center">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Calculez votre aide personnalisée</p>
                  <p className="text-xs text-gray-500 mb-4">Simulation gratuite en 5 minutes</p>
                  <Link href="/simulateur"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded font-bold text-sm text-white"
                    style={{ backgroundColor: a.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    Simuler <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Autres aides */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>Complémentaires</p>
            <h2 className="text-2xl font-bold text-gray-900">Autres aides & dispositifs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BONUS_AIDS.map((b) => (
              <div key={b.label} className="bg-white border border-gray-200 rounded-md p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: b.color }} />
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{b.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bas de page */}
      <section className="py-16" style={{ backgroundColor: "#162a1e" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-start gap-3 p-4 rounded-md mb-8 text-left"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Info size={15} className="flex-shrink-0 mt-0.5 text-green-300" />
            <p className="text-xs text-gray-300">
              Les montants indiqués sont indicatifs et basés sur les barèmes 2025–2026. Les aides sont soumises à conditions et peuvent évoluer. Pour un calcul personnalisé, utilisez notre simulateur ou créez un compte professionnel.
            </p>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Prêt à calculer vos aides ?</h2>
          <p className="text-gray-300 mb-6 text-sm">Notre simulateur gratuit calcule MPR, CEE et Éco-PTZ en 5 minutes selon votre projet.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/simulateur"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-bold text-sm text-white"
              style={{ backgroundColor: `var(--brand-500)` }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
            >
              Démarrer la simulation <ArrowRight size={15} />
            </Link>
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-bold text-sm transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Espace professionnel
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 ThermoPilot AI · Données indicatives basées sur les barèmes ANAH 2025</p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">Accueil</Link>
            <Link href="/guide" className="text-xs text-gray-400 hover:text-gray-600">Guide travaux</Link>
            <Link href="/faq" className="text-xs text-gray-400 hover:text-gray-600">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
