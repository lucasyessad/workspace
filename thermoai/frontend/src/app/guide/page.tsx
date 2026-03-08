"use client";
import Link from "next/link";
import { ArrowRight, ChevronRight, Layers, Thermometer, Wind, DoorOpen, Snowflake, Zap, Leaf, Building2 } from "lucide-react";

const CATEGORIES = [
  {
    slug: "isolation",
    label: "Isolation thermique",
    icon: Layers,
    color: `var(--brand-500)`,
    bg: `var(--brand-50)`,
    desc: "L'isolation est le premier geste de rénovation — elle réduit les déperditions de chaleur jusqu'à 30 %.",
    works: [
      { label: "Isolation murs extérieurs (ITE)",   mpr: "jusqu'à 15 000 €", href: "#ite" },
      { label: "Isolation murs intérieurs (ITI)",    mpr: "jusqu'à 10 000 €", href: "#iti" },
      { label: "Isolation des combles perdus",       mpr: "jusqu'à 8 000 €",  href: "#combles" },
      { label: "Isolation des planchers bas",        mpr: "jusqu'à 7 000 €",  href: "#planchers" },
      { label: "Rampants et toiture-terrasse",       mpr: "jusqu'à 7 000 €",  href: "#toiture" },
    ],
    keyFact: "30 % des pertes de chaleur passent par les murs non isolés.",
  },
  {
    slug: "chauffage",
    label: "Chauffage & ECS",
    icon: Thermometer,
    color: "#DC2626",
    bg: "#fef2f2",
    desc: "Remplacer votre système de chauffage par un équipement performant peut diviser la facture énergétique par 3.",
    works: [
      { label: "Pompe à chaleur air/eau",           mpr: "jusqu'à 12 000 €", href: "#pac-aieau" },
      { label: "Pompe à chaleur géothermique",       mpr: "jusqu'à 12 000 €", href: "#pac-geo" },
      { label: "Chaudière à condensation gaz",       mpr: "jusqu'à 6 000 €",  href: "#chaudiere" },
      { label: "Poêle à granulés / bois",            mpr: "jusqu'à 8 000 €",  href: "#poele" },
      { label: "Chauffe-eau thermodynamique",        mpr: "jusqu'à 4 000 €",  href: "#cet" },
    ],
    keyFact: "La PAC air/eau affiche un COP moyen de 3,5 — pour 1 kWh consommé, 3,5 kWh de chaleur produits.",
  },
  {
    slug: "ventilation",
    label: "Ventilation",
    icon: Wind,
    color: "#0891B2",
    bg: "#e0f2fe",
    desc: "Une bonne ventilation est indispensable après l'isolation pour assurer la qualité de l'air et éviter les problèmes d'humidité.",
    works: [
      { label: "VMC double flux autoréglable",       mpr: "jusqu'à 5 000 €",  href: "#vmc-df" },
      { label: "VMC simple flux hygroréglable",      mpr: "jusqu'à 3 000 €",  href: "#vmc-sf" },
      { label: "VMC hygroréglable de type B",        mpr: "jusqu'à 3 000 €",  href: "#vmc-b" },
    ],
    keyFact: "Une VMC double flux récupère jusqu'à 85 % de la chaleur de l'air extrait.",
  },
  {
    slug: "menuiseries",
    label: "Fenêtres & menuiseries",
    icon: DoorOpen,
    color: "#7C3AED",
    bg: "#f3e8ff",
    desc: "Le remplacement des fenêtres simple vitrage réduit les pertes thermiques de 10 à 15 % et améliore le confort acoustique.",
    works: [
      { label: "Fenêtres double vitrage",            mpr: "jusqu'à 4 000 €",  href: "#fenetres-dv" },
      { label: "Fenêtres triple vitrage",            mpr: "jusqu'à 4 000 €",  href: "#fenetres-tv" },
      { label: "Porte d'entrée isolante",            mpr: "jusqu'à 1 500 €",  href: "#porte" },
      { label: "Volets isolants",                    mpr: "éligible CEE",      href: "#volets" },
    ],
    keyFact: "15 % des déperditions thermiques passent par les fenêtres simple vitrage.",
  },
  {
    slug: "energies-renouvelables",
    label: "Énergies renouvelables",
    icon: Zap,
    color: "#D97706",
    bg: "#fffbeb",
    desc: "Panneaux solaires, biomasse, géothermie — complétez votre rénovation par de la production d'énergie verte.",
    works: [
      { label: "Panneaux solaires photovoltaïques",  mpr: "prime à l'auto-conso", href: "#pv" },
      { label: "Chauffe-eau solaire individuel",     mpr: "jusqu'à 4 000 €",  href: "#cesi" },
      { label: "Système solaire combiné",            mpr: "jusqu'à 10 000 €", href: "#ssc" },
    ],
    keyFact: "Un CESI couvre 50 à 70 % des besoins annuels en eau chaude sanitaire.",
  },
  {
    slug: "renovation-globale",
    label: "Rénovation globale",
    icon: Building2,
    color: "#059669",
    bg: "#d1fae5",
    desc: "La rénovation globale (≥ 2 sauts de classe DPE) permet d'accéder au Parcours accompagné et aux bonifications MPR.",
    works: [
      { label: "BBC Rénovation (≥ 2 sauts DPE)",   mpr: "jusqu'à 70 % + bonus", href: "#bbc" },
      { label: "Mon Accompagnateur Rénov'",          mpr: "obligatoire MPR accompagné", href: "#mar" },
      { label: "Audit énergétique obligatoire",      mpr: "coût pris en charge", href: "#audit" },
    ],
    keyFact: "La rénovation globale est la seule voie pour sortir d'une passoire thermique (F ou G).",
  },
];

const PROCESS = [
  { n: "1", title: "Réaliser un audit énergétique",      desc: "Obligatoire pour le Parcours accompagné. Permet d'identifier les travaux prioritaires et d'estimer les aides." },
  { n: "2", title: "Choisir un artisan RGE",              desc: "Reconnu Garant de l'Environnement — obligatoire pour toutes les aides nationales (MPR, CEE)." },
  { n: "3", title: "Demander des devis",                  desc: "Comparez au minimum 3 devis détaillés avant de signer. N'engagez pas les travaux avant accord ANAH." },
  { n: "4", title: "Monter le dossier d'aides",           desc: "Déposez votre dossier MPR sur maprimerenov.gouv.fr. Les CEE sont gérés par votre fournisseur d'énergie." },
  { n: "5", title: "Réaliser les travaux",                desc: "Les travaux démarrent après accord des aides. Conservez toutes les factures." },
  { n: "6", title: "Recevoir les aides",                  desc: "MPR versée après vérification des travaux. CEE déduites de la facture ou versées directement." },
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
          <Link href="/login" className="text-sm font-semibold px-4 py-2 rounded text-white"
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

export default function GuidePage() {
  return (
    <div style={{ fontFamily: "Outfit, system-ui, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600">Accueil</Link>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-medium">Guide des travaux</span>
          </div>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>Guide des travaux</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tous les travaux de rénovation énergétique
            </h1>
            <p className="text-gray-500 leading-relaxed mb-6">
              Isolation, chauffage, ventilation, menuiseries, énergies renouvelables — découvrez pour chaque geste les solutions techniques, les aides disponibles et les bonnes pratiques.
            </p>
            <Link href="/simulateur"
              className="inline-flex items-center gap-2 px-6 py-3 rounded font-bold text-sm text-white"
              style={{ backgroundColor: `var(--brand-500)` }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
            >
              Simuler mon projet <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Catégories — 6 cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.slug} className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all group">
                  <div className="h-1" style={{ backgroundColor: cat.color }} />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: cat.bg }}>
                        <Icon size={20} style={{ color: cat.color }} />
                      </div>
                      <h2 className="font-bold text-gray-900 text-sm">{cat.label}</h2>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">{cat.desc}</p>

                    {/* Key fact */}
                    <div className="flex items-start gap-2 p-3 rounded mb-4"
                      style={{ backgroundColor: cat.bg }}>
                      <Leaf size={13} className="flex-shrink-0 mt-0.5" style={{ color: cat.color }} />
                      <p className="text-xs text-gray-700">{cat.keyFact}</p>
                    </div>

                    {/* Works list */}
                    <ul className="space-y-2">
                      {cat.works.map((w) => (
                        <li key={w.label} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-xs text-gray-700 flex items-center gap-1.5">
                            <ChevronRight size={11} style={{ color: cat.color }} />
                            {w.label}
                          </span>
                          <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: cat.color }}>{w.mpr}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: cat.color }}>
                      Voir le guide complet <ChevronRight size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Processus en 6 étapes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>Mode d'emploi</p>
            <h2 className="text-2xl font-bold text-gray-900">Bien démarrer sa rénovation en 6 étapes</h2>
          </div>

          <div className="space-y-0 divide-y divide-gray-100">
            {PROCESS.map((s, i) => (
              <div key={s.n} className="flex items-start gap-6 py-6 hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-md group cursor-pointer">
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ borderColor: i === 0 ? `var(--brand-500)` : "#e0e0e0", color: i === 0 ? `var(--brand-500)` : "#999" }}>
                  {s.n}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-1">{s.title}</p>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors hidden sm:block mt-1 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA simulateur */}
      <section className="py-16" style={{ backgroundColor: "#162a1e" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Quel geste pour votre logement ?</h2>
          <p className="text-gray-300 mb-6 text-sm">Notre simulateur analyse votre situation et vous guide vers les travaux prioritaires et les aides disponibles.</p>
          <Link href="/simulateur"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded font-bold text-sm text-white"
            style={{ backgroundColor: `var(--brand-500)` }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
          >
            Démarrer la simulation <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 ThermoPilot AI</p>
          <div className="flex gap-4">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">Accueil</Link>
            <Link href="/aides" className="text-xs text-gray-400 hover:text-gray-600">Aides & Primes</Link>
            <Link href="/faq" className="text-xs text-gray-400 hover:text-gray-600">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
