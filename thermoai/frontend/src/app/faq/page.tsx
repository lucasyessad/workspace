"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ArrowRight, Search } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    id: "aides",
    label: "Aides & Primes",
    color: `var(--brand-500)`,
    questions: [
      {
        q: "Qu'est-ce que MaPrimeRénov' et qui peut en bénéficier ?",
        a: "MaPrimeRénov' (MPR) est une aide de l'État versée par l'ANAH. Elle est accessible à tous les propriétaires occupants, bailleurs et copropriétés, sans condition de revenus pour le Parcours par geste. Son montant varie de 15 % à 70 % du coût des travaux selon votre tranche de revenus.",
      },
      {
        q: "Peut-on cumuler MaPrimeRénov' et les CEE ?",
        a: "Oui, MaPrimeRénov' et les Certificats d'Économies d'Énergie (CEE) sont cumulables pour la plupart des gestes. La somme des aides ne peut cependant pas dépasser 100 % du coût des travaux. L'Éco-PTZ est également cumulable avec ces deux aides.",
      },
      {
        q: "Comment sont calculés les plafonds de revenus pour MaPrimeRénov' ?",
        a: "Les plafonds sont calculés en fonction du revenu fiscal de référence (RFR) du foyer et du nombre de personnes composant le ménage. Ils varient selon la zone géographique : Île-de-France (zone A/A bis) vs province (zones B1, B2, C). En 2025, un ménage de 2 personnes est considéré très modeste avec un RFR ≤ 22 461 € en IdF ou ≤ 16 229 € en province.",
      },
      {
        q: "Qu'est-ce que la Prime Énergie (CEE) ?",
        a: "La Prime Énergie, ou prime CEE (Certificats d'Économies d'Énergie), est financée par les fournisseurs d'énergie qui ont l'obligation légale de promouvoir l'efficacité énergétique. Elle est accessible à tous les ménages sans condition de revenus et varie en fonction du type de travaux, de la zone climatique et de vos revenus.",
      },
      {
        q: "Combien peut-on emprunter avec l'Éco-PTZ ?",
        a: "L'Éco-PTZ permet d'emprunter jusqu'à 15 000 € pour 1-2 travaux éligibles, 30 000 € pour 3 travaux ou plus, et 50 000 € pour une rénovation globale avec gain ≥ 2 classes DPE. Le remboursement s'étale sur 3 à 20 ans sans intérêts, auprès d'une banque partenaire.",
      },
      {
        q: "La TVA à 5,5 % s'applique-t-elle automatiquement ?",
        a: "Oui, l'artisan applique directement le taux de 5,5 % sur sa facture pour les travaux éligibles (logement de plus de 2 ans, travaux d'amélioration énergétique). Aucune démarche supplémentaire n'est nécessaire de votre côté.",
      },
    ],
  },
  {
    id: "travaux",
    label: "Types de travaux",
    color: "#DC2626",
    questions: [
      {
        q: "Par quels travaux commencer pour une rénovation globale ?",
        a: "L'ordre recommandé est : 1. Isolation de l'enveloppe (murs, toiture, planchers) — réduit les besoins de chauffage, 2. Remplacement du système de chauffage (PAC, chaudière condensation), 3. Ventilation (VMC double flux pour une bonne qualité d'air), 4. Fenêtres et menuiseries. Un audit énergétique préalable permet d'établir la priorité selon votre logement.",
      },
      {
        q: "Quelle est la différence entre ITE et ITI ?",
        a: "L'ITE (Isolation Thermique par l'Extérieur) pose l'isolant sur la façade extérieure — elle ne réduit pas la surface habitable et supprime les ponts thermiques. L'ITI (par l'Intérieur) est moins coûteuse mais réduit la surface habitable de 5 à 15 cm par mur traité. L'ITE est généralement préférée en rénovation globale.",
      },
      {
        q: "Qu'est-ce qu'une pompe à chaleur (PAC) et quelles sont ses performances ?",
        a: "Une PAC est un système de chauffage qui puise les calories dans l'air extérieur (PAC air/eau) ou dans le sol (géothermique) pour chauffer votre logement et produire de l'eau chaude sanitaire. Son coefficient de performance (COP) moyen est de 3 à 4, signifiant que pour 1 kWh d'électricité consommé, elle produit 3 à 4 kWh de chaleur.",
      },
      {
        q: "Une VMC double flux est-elle obligatoire après isolation ?",
        a: "Pas obligatoire légalement, mais fortement recommandée. Une isolation renforcée rend le bâtiment plus étanche, ce qui peut dégrader la qualité de l'air intérieur si la ventilation n'est pas adaptée. La VMC double flux assure un renouvellement d'air efficace tout en récupérant 75-85 % de la chaleur de l'air extrait.",
      },
      {
        q: "Doit-on obligatoirement remplacer toutes les fenêtres ?",
        a: "Non. Si vos fenêtres sont en double vitrage récent (post 2000), leur remplacement n'est pas prioritaire. En revanche, le simple vitrage génère des pertes importantes et son remplacement est éligible aux aides MPR et CEE. La priorité reste l'isolation de l'enveloppe opaque (murs, toiture).",
      },
    ],
  },
  {
    id: "audit",
    label: "Audit énergétique & DPE",
    color: "#7C3AED",
    questions: [
      {
        q: "Quelle est la différence entre un DPE et un audit énergétique ?",
        a: "Le DPE (Diagnostic de Performance Énergétique) est un diagnostic obligatoire lors de la vente ou location. Il classe le logement de A à G et dure environ 2-3 heures. L'audit énergétique est une étude approfondie (6-8 heures sur site) qui identifie les travaux prioritaires, simule les scénarios de rénovation et est obligatoire pour le Parcours accompagné MPR.",
      },
      {
        q: "Combien coûte un audit énergétique ?",
        a: "Le prix d'un audit énergétique varie de 800 € à 1 500 € pour une maison individuelle selon la superficie et la complexité. L'ANAH prend en charge une partie du coût via MaPrimeRénov' (dans le cadre du Parcours accompagné). Depuis le 1er avril 2023, l'audit est obligatoire pour la vente des biens classés F ou G.",
      },
      {
        q: "Qu'est-ce qu'un logement 'passoire thermique' ?",
        a: "Un logement est qualifié de passoire thermique lorsqu'il est classé F ou G au DPE. Environ 5,2 millions de logements en France sont dans cette situation. Ces logements sont progressivement interdits à la location : G depuis janvier 2025, F en 2028, E en 2034. Des travaux de rénovation sont obligatoires pour maintenir un bien à la location.",
      },
      {
        q: "Le DPE est-il fiable ?",
        a: "Depuis la réforme de juillet 2021, le DPE est devenu opposable et repose sur les caractéristiques physiques du bâtiment (et non plus sur les factures). Sa fiabilité a été améliorée mais reste perfectible, notamment pour les bâtiments anciens atypiques. Un audit énergétique complémentaire est recommandé pour les projets de rénovation globale.",
      },
      {
        q: "Qui peut réaliser un audit énergétique ?",
        a: "L'audit énergétique doit être réalisé par un professionnel qualifié : auditteur certifié RGE mention 'Audit énergétique en maison individuelle', un architecte ou un Mon Accompagnateur Rénov' (MAR) habilité par l'ANAH. Vérifiez les qualifications sur le site qualit-enr.org ou france-renov.gouv.fr.",
      },
    ],
  },
  {
    id: "financement",
    label: "Financement & démarches",
    color: "#000091",
    questions: [
      {
        q: "Dans quel ordre effectuer les démarches pour MaPrimeRénov' ?",
        a: "1. Vérifiez votre éligibilité sur maprimerenov.gouv.fr, 2. Trouvez un artisan RGE certifié, 3. Demandez un devis AVANT le début des travaux, 4. Créez un dossier sur maprimerenov.gouv.fr et soumettez le devis, 5. Attendez l'accord de l'ANAH, 6. Réalisez les travaux, 7. Envoyez les factures pour recevoir le virement.",
      },
      {
        q: "Combien de temps faut-il pour recevoir MaPrimeRénov' ?",
        a: "Le délai de traitement des dossiers par l'ANAH est en général de 1 à 3 mois. Après réception des justificatifs de travaux terminés, le virement est effectué sous 2 à 4 semaines. L'Avance Immédiate MaPrimeRénov' (via Mon Accompagnateur Rénov') permet de recevoir l'aide avant les travaux.",
      },
      {
        q: "Que signifie 'artisan RGE' et comment en trouver un ?",
        a: "RGE signifie 'Reconnu Garant de l'Environnement'. C'est une certification obligatoire pour que vos travaux ouvrent droit aux aides nationales (MPR, CEE). Vous pouvez trouver des artisans RGE près de chez vous sur le site france-renov.gouv.fr ou qualit-enr.org. Comparez toujours au moins 3 devis.",
      },
      {
        q: "Qu'est-ce que Mon Accompagnateur Rénov' (MAR) ?",
        a: "Mon Accompagnateur Rénov' est un conseiller agréé par l'ANAH qui vous accompagne tout au long de votre projet de rénovation globale. Son intervention est obligatoire pour le Parcours accompagné MPR (travaux > 2 sauts de classes DPE). Sa mission couvre l'audit, le choix des travaux, la recherche d'artisans et le suivi du dossier. Son coût est pris en charge par MPR à 50-100 %.",
      },
      {
        q: "Peut-on commencer les travaux avant d'avoir la réponse de l'ANAH ?",
        a: "Non, pour MaPrimeRénov', vous devez impérativement attendre l'accord de l'ANAH avant de commencer les travaux. Débuter les travaux avant l'accord entraîne la perte de l'aide. Pour les CEE, le devis doit être accepté avant le début des travaux, mais l'accord est généralement rapide.",
      },
    ],
  },
];

function AccordionItem({ q, a, color }: { q: string; a: string; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-md"
      >
        <p className="text-sm font-semibold text-gray-900 leading-relaxed">{q}</p>
        <ChevronDown
          size={17}
          className="flex-shrink-0 mt-0.5 transition-transform"
          style={{ color, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="pb-4 text-sm text-gray-600 leading-relaxed"
          style={{ borderLeft: `3px solid ${color}`, paddingLeft: "1rem", marginLeft: "0" }}>
          {a}
        </div>
      )}
    </div>
  );
}

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

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState("aides");
  const [search, setSearch] = useState("");

  const active = FAQ_CATEGORIES.find((c) => c.id === activeCategory)!;
  const filteredQ = search.trim()
    ? FAQ_CATEGORIES.flatMap((c) => c.questions.map((q) => ({ ...q, color: c.color }))).filter(
        (q) => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <div style={{ fontFamily: "Outfit, system-ui, sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      <PublicNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600">Accueil</Link>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-medium">FAQ</span>
          </div>
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
              Questions fréquentes
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Toutes vos questions sur la rénovation énergétique
            </h1>
            <p className="text-gray-500 leading-relaxed mb-6">
              Aides financières, types de travaux, audit énergétique, démarches administratives — retrouvez les réponses aux questions les plus fréquentes.
            </p>
            {/* Search */}
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une question…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": `var(--brand-500)` } as React.CSSProperties}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredQ ? (
          /* Search results */
          <div>
            <p className="text-sm text-gray-500 mb-6">{filteredQ.length} résultat{filteredQ.length !== 1 ? "s" : ""} pour "{search}"</p>
            {filteredQ.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-md p-10 text-center">
                <p className="text-gray-500 mb-4">Aucune question ne correspond à votre recherche.</p>
                <button onClick={() => setSearch("")}
                  className="text-sm font-semibold" style={{ color: `var(--brand-500)` }}>
                  Effacer la recherche
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-md p-6 space-y-2">
                {filteredQ.map((q) => (
                  <AccordionItem key={q.q} q={q.q} a={q.a} color={q.color} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Category navigation */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar categories */}
            <aside className="lg:w-56 flex-shrink-0">
              <nav className="bg-white border border-gray-200 rounded-md overflow-hidden sticky top-20">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-sm font-medium text-left transition-colors border-b border-gray-50 last:border-0"
                    style={{
                      backgroundColor: activeCategory === cat.id ? cat.color + "10" : "transparent",
                      color:           activeCategory === cat.id ? cat.color : "#555",
                      borderLeft:      activeCategory === cat.id ? `3px solid ${cat.color}` : "3px solid transparent",
                    }}
                  >
                    {cat.label}
                    <ChevronRight size={13} style={{ opacity: 0.5 }} />
                  </button>
                ))}
              </nav>
            </aside>

            {/* Questions */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: active.color }} />
                <h2 className="font-bold text-gray-900">{active.label}</h2>
                <span className="text-xs text-gray-400 ml-auto">{active.questions.length} questions</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-6 space-y-2">
                {active.questions.map((q) => (
                  <AccordionItem key={q.q} q={q.q} a={q.a} color={active.color} />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-6 bg-white border border-gray-200 rounded-md p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Vous n'avez pas trouvé votre réponse ?</p>
                  <p className="text-xs text-gray-500 mt-0.5">Notre simulateur calcule vos aides personnalisées en 5 minutes.</p>
                </div>
                <Link href="/simulateur"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-sm text-white flex-shrink-0"
                  style={{ backgroundColor: `var(--brand-500)` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
                >
                  Simuler mon projet <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© 2026 ThermoPilot AI · Questions & réponses sur la rénovation énergétique</p>
          <div className="flex gap-4">
            <Link href="/aides" className="text-xs text-gray-400 hover:text-gray-600">Aides & Primes</Link>
            <Link href="/guide" className="text-xs text-gray-400 hover:text-gray-600">Guide travaux</Link>
            <Link href="/simulateur" className="text-xs text-gray-400 hover:text-gray-600">Simulateur</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
