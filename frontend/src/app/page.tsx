"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ChevronRight, Check, Building2, ClipboardList,
  TrendingUp, FileText, Thermometer, Wind, Layers, Zap,
  Users, BarChart3, Shield, Menu, X,
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  {
    label: "Simulateur",
    href: "/simulateur",
    sub: [
      { label: "Mon DPE — Estimation DPE", href: "/simulateur?tab=dpe" },
      { label: "Mes Aides — MPR, CEE, PTZ", href: "/simulateur?tab=aides" },
      { label: "Éco-PTZ — Simuler mon prêt", href: "/simulateur?tab=ecoptz" },
      { label: "Rénovation globale vs partielle", href: "/simulateur?tab=renovation" },
    ],
  },
  {
    label: "Aides & Primes",
    href: "/aides",
    sub: [
      { label: "MaPrimeRénov'", href: "/aides#maprimerenov" },
      { label: "Prime Énergie CEE", href: "/aides#cee" },
      { label: "Éco-PTZ", href: "/aides#eco-ptz" },
      { label: "TVA réduite 5,5 %", href: "/aides#tva" },
    ],
  },
  {
    label: "Guide des travaux",
    href: "/guide",
    sub: [
      { label: "Isolation thermique", href: "/guide#isolation" },
      { label: "Chauffage & PAC", href: "/guide#chauffage" },
      { label: "Ventilation VMC", href: "/guide#ventilation" },
      { label: "Menuiseries & fenêtres", href: "/guide#menuiseries" },
    ],
  },
  {
    label: "Ressources",
    href: "/faq",
    sub: [
      { label: "FAQ complète", href: "/faq" },
      { label: "Guide rénovation", href: "/guide" },
      { label: "Aides & financements", href: "/aides" },
      { label: "Espace professionnel", href: "/register" },
    ],
  },
];

const VALUE_PROPS = [
  "Méthodes de calcul réglementaires 3CL-DPE 2021, Th-CE-Ex et RE2020 intégrées",
  "Calcul automatique des aides MaPrimeRénov', CEE et Éco-PTZ par geste de travaux",
  "Rapports PDF professionnels conformes aux exigences ANAH et assemblée générale",
];

const QUICK_ACTIONS = [
  {
    icon: BarChart3,
    title: "Estimer mon DPE",
    desc: "Obtenez votre classe énergétique estimée, les travaux prioritaires et les aides associées.",
    href: "/simulateur?tab=dpe",
    color: `var(--brand-500)`,
    badge: "Gratuit",
  },
  {
    icon: TrendingUp,
    title: "Calculer mes aides",
    desc: "MPR, CEE, Éco-PTZ — calculez vos primes en sélectionnant vos gestes de travaux.",
    href: "/simulateur?tab=aides",
    color: "#000091",
    badge: "Instantané",
  },
  {
    icon: FileText,
    title: "Simuler mon Éco-PTZ",
    desc: "Calculez vos mensualités à taux zéro et vérifiez les plafonds par catégorie de travaux.",
    href: "/simulateur?tab=ecoptz",
    color: "#7C3AED",
    badge: "Taux 0 %",
  },
  {
    icon: Shield,
    title: "Stratégie de rénovation",
    desc: "Globale ou partielle ? Répondez à 3 questions pour trouver la meilleure approche.",
    href: "/simulateur?tab=renovation",
    color: "#D97706",
    badge: "Quiz",
  },
];

const WORKFLOW_STEPS = [
  {
    n: "1",
    title: "Créez votre projet",
    desc: "Définissez la méthode de calcul réglementaire, la zone climatique et le contact référent.",
    detail: "Méthode · Zone · Contact",
  },
  {
    n: "2",
    title: "Saisissez les bâtiments",
    desc: "Adresse, surface chauffée, systèmes énergie, enveloppe thermique — tout centralisé.",
    detail: "Bâtiments · Systèmes · Enveloppe",
  },
  {
    n: "3",
    title: "Lancez l'audit",
    desc: "Le moteur calcule la classe DPE, les kWhpe/m², le coût annuel et les émissions CO₂.",
    detail: "DPE · GES · Coût · CO₂",
  },
  {
    n: "4",
    title: "Livrables & aides",
    desc: "Rapport PDF professionnel + simulation des aides financières pour le plan de rénovation.",
    detail: "PDF · MPR · CEE · Éco-PTZ",
  },
];

const WORK_TYPES = [
  { icon: Layers,      label: "Isolation thermique",   sub: "ITE, ITI, combles, planchers" },
  { icon: Thermometer, label: "Chauffage & ECS",        sub: "PAC, chaudière, chauffe-eau solaire" },
  { icon: Wind,        label: "Ventilation & VMC",      sub: "VMC simple et double flux" },
  { icon: Building2,   label: "Menuiseries",            sub: "Fenêtres, volets, portes" },
  { icon: Zap,         label: "Énergies renouvelables", sub: "Solaire PV, biomasse" },
  { icon: ClipboardList, label: "Rénovation globale",   sub: "BBC Rénovation — 2 sauts DPE" },
];

const AIDS = [
  {
    img: "MPR",
    title: "MaPrimeRénov'",
    value: "jusqu'à 70 %",
    unit: "du coût des travaux",
    desc: "Prime versée par l'ANAH, cumulable CEE, pour ménages modestes et intermédiaires.",
    color: `var(--brand-500)`,
    bg: `var(--brand-50)`,
  },
  {
    img: "CEE",
    title: "Prime Énergie (CEE)",
    value: "jusqu'à 5 600 €",
    unit: "par geste éligible",
    desc: "Certificats d'Économies d'Énergie financés par les fournisseurs d'énergie obligés.",
    color: "#000091",
    bg: "#e8eeff",
  },
  {
    img: "PTZ",
    title: "Éco-PTZ",
    value: "jusqu'à 50 000 €",
    unit: "à taux zéro",
    desc: "Prêt sans intérêt pour financer les travaux de rénovation énergétique éligibles.",
    color: "#7C3AED",
    bg: "#f3e8ff",
  },
  {
    img: "TVA",
    title: "TVA réduite",
    value: "5,5 %",
    unit: "au lieu de 20 %",
    desc: "TVA à taux réduit applicable aux travaux d'amélioration énergétique en résidentiel.",
    color: "#D97706",
    bg: "#fffbeb",
  },
];

const NEWS = [
  {
    tag: "Réglementation",
    tagColor: `var(--brand-500)`,
    date: "Mars 2026",
    title: "MaPrimeRénov' 2026 : nouveaux plafonds et conditions d'éligibilité",
    summary: "L'ANAH renforce les critères de performance pour BBC Rénovation. Les ménages intermédiaires bénéficient d'une majoration de 10 % pour les rénovations globales.",
  },
  {
    tag: "Décret Tertiaire",
    tagColor: "#000091",
    date: "Févr. 2026",
    title: "Décret tertiaire : objectifs 2030 et obligations OPERAT pour les assujettis",
    summary: "Les bâtiments tertiaires de plus de 1 000 m² doivent déclarer leurs consommations sur OPERAT. Objectif : −40 % d'énergie finale d'ici 2030.",
  },
  {
    tag: "RE2020",
    tagColor: "#7C3AED",
    date: "Janv. 2026",
    title: "RE2020 : bilan de trois années d'application et évolution des seuils Bbio",
    summary: "Après trois ans de mise en œuvre, les constructions neuves affichent −30 % d'émissions CO₂ en phase construction. Les seuils Bbio seront renforcés en 2028.",
  },
];

const STATS = [
  { v: "3 200+", l: "Projets réalisés" },
  { v: "14 800+", l: "Bâtiments audités" },
  { v: "62 GWh", l: "Économies simulées" },
  { v: "980+", l: "Professionnels actifs" },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) { router.replace("/dashboard"); return; }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div style={{ fontFamily: "Outfit, system-ui, sans-serif", color: "#1e1e1e" }}>

      {/* ══════════════════════════════════════════════════════════════
          NAV
      ══════════════════════════════════════════════════════════════ */}
      <nav className="sticky top-0 z-50 bg-white" style={{ boxShadow: "0 1px 0 #e0e0e0" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16 gap-8">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-8 h-8 rounded flex items-center justify-center text-base"
                style={{ backgroundColor: `var(--brand-500)` }}>🌡️</div>
              <span className="font-bold text-lg">
                Thermo<span style={{ color: `var(--brand-500)` }}>Pilot</span> <span className="text-sm font-medium text-gray-400">AI</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-0 flex-1">
              {NAV_LINKS.map((nav) => (
                <div key={nav.label} className="relative"
                  onMouseEnter={() => setOpenMenu(nav.label)}
                  onMouseLeave={() => setOpenMenu(null)}>
                  <Link href={nav.href} className="flex items-center gap-1 px-4 py-5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                    {nav.label} <ChevronRight size={13} className="rotate-90 opacity-50" />
                  </Link>
                  {openMenu === nav.label && (
                    <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-lg py-2 min-w-[200px] z-50">
                      {nav.sub.map((s) => (
                        <Link key={s.label} href={s.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/faq" className="px-4 py-5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                FAQ
              </Link>
            </div>

            <div className="flex-1 lg:flex-none" />

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors">
                Connexion
              </Link>
              <Link href="/simulateur"
                className="inline-flex items-center gap-2 px-5 py-2 rounded text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: `var(--brand-500)` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
              >
                Simuler mon projet <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile burger */}
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-gray-100 py-4 space-y-1">
              {NAV_LINKS.map((nav) => (
                <div key={nav.label} className="px-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 px-2 py-1">{nav.label}</p>
                  {nav.sub.map((s) => (
                    <Link key={s.label} href={s.href} className="block px-2 py-1.5 text-sm text-gray-700 hover:text-gray-900">{s.label}</Link>
                  ))}
                </div>
              ))}
              <div className="pt-3 px-2 flex flex-col gap-2">
                <Link href="/login" className="btn-secondary text-center justify-center">Connexion</Link>
                <Link href="/register" className="btn-primary justify-center" style={{ backgroundColor: `var(--brand-500)` }}>Simuler mon projet</Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          HERO — image plein écran avec overlay
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[580px] flex items-center"
        style={{
          background: "linear-gradient(135deg, #0f2d1c 0%, #1a4a2a 40%, #0d3d28 100%)",
        }}>
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Green glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 50%, #3fb877 0%, transparent 60%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: "rgba(24,117,60,0.25)", color: "#6dc897", border: "1px solid rgba(24,117,60,0.35)" }}>
              ✦ Méthode 3CL-DPE 2021 · Conforme ADEME
            </div>

            <h1 className="text-4xl md:text-[52px] font-bold text-white leading-[1.12] mb-5">
              Envie de rénover ?<br />
              <span style={{ color: "#6dc897" }}>Découvrez l'audit énergétique</span><br />
              accompagné par l'IA
            </h1>

            <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-xl">
              Nos outils d'analyse automatisée sont à vos côtés pour guider pas à pas chaque mission d'audit, de la saisie terrain au rapport PDF professionnel.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/simulateur?tab=dpe"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded font-bold text-white text-sm transition-colors"
                style={{ backgroundColor: `var(--brand-500)` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
              >
                Je simule mon projet <ArrowRight size={16} />
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded font-bold text-white text-sm transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.07)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.13)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)")}
              >
                Accéder à mon espace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          VALUE PROPS — 3 points sous le hero
      ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_PROPS.map((v) => (
              <div key={v} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: `var(--brand-500)` }}>
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          QUICK ACTIONS — 4 cards avec icône
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "#f4f4f4" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
              Pour réussir chaque étape
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Audits, aides, rénovation… tout en un seul outil
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {QUICK_ACTIONS.map((q) => {
              const Icon = q.icon;
              return (
                <Link key={q.title} href={q.href}>
                  <div className="bg-white border border-gray-200 rounded-md p-6 h-full flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded flex items-center justify-center" style={{ backgroundColor: q.color + "15" }}>
                        <Icon size={22} style={{ color: q.color }} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: q.color + "15", color: q.color }}>{q.badge}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{q.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed flex-1">{q.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: q.color }}>
                      Démarrer <ChevronRight size={12} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          WORKFLOW — 4 étapes numérotées
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
              Votre projet d'audit avec ThermoPilot AI !
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 max-w-xl">
              Un workflow guidé de la saisie au livrable
            </h2>
          </div>

          <div className="space-y-0 divide-y divide-gray-100">
            {WORKFLOW_STEPS.map((s, i) => (
              <div key={s.n}
                className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 py-8 group hover:bg-gray-50 transition-colors px-4 -mx-4 rounded-md cursor-pointer">
                {/* Number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-colors"
                  style={{ borderColor: i === 0 ? `var(--brand-500)` : "#e0e0e0", color: i === 0 ? `var(--brand-500)` : "#999" }}>
                  {s.n}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {s.detail.split(" · ").map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `var(--brand-50)`, color: `var(--brand-500)` }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <ArrowRight size={18} className="hidden md:block flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/simulateur"
              className="inline-flex items-center gap-2 px-7 py-3 rounded font-bold text-sm text-white"
              style={{ backgroundColor: `var(--brand-500)` }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
            >
              Démarrer la simulation <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TYPES DE TRAVAUX — grille 3x2 avec flèche
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "#f4f4f4" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
              Gestes éligibles
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Tous les types de travaux couverts
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORK_TYPES.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.label}
                  className="bg-white border border-gray-200 rounded-md p-5 flex items-center gap-4 hover:shadow-md hover:border-green-200 transition-all group cursor-pointer">
                  <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `var(--brand-50)` }}>
                    <Icon size={22} style={{ color: `var(--brand-500)` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{w.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{w.sub}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-green-600 transition-colors flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          AIDES & PRIMES — 4 cards avec grand chiffre
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
              Aides & financements
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Calculez vos aides automatiquement
            </h2>
            <p className="text-gray-500 text-sm max-w-xl">
              ThermoPilot AI calcule en temps réel les subventions auxquelles chaque geste de travaux est éligible.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {AIDS.map((a) => (
              <div key={a.title}
                className="border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                {/* Color header */}
                <div className="h-2" style={{ backgroundColor: a.color }} />
                <div className="p-6">
                  {/* Badge icon */}
                  <div className="w-10 h-10 rounded flex items-center justify-center font-bold text-xs mb-4"
                    style={{ backgroundColor: a.bg, color: a.color }}>
                    {a.img}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: a.color }}>
                    {a.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-0.5">{a.value}</p>
                  <p className="text-xs text-gray-400 mb-3">{a.unit}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{a.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: a.color }}>
                    En savoir plus <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS — bande colorée
      ══════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: `var(--brand-500)` }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.l}>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{s.v}</p>
                <p className="text-sm text-green-200">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ACTUALITÉS — 3 colonnes
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20" style={{ backgroundColor: "#f4f4f4" }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: `var(--brand-500)` }}>
                Les Actus Réno !
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Restez à jour</h2>
            </div>
            <Link href="/faq"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold transition-colors px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-white">
              Voir la FAQ complète <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {NEWS.map((n) => (
              <article key={n.title}
                className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-md transition-all group cursor-pointer">
                {/* Image placeholder */}
                <div className="h-44 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: n.tagColor + "12" }}>
                  <div className="text-6xl opacity-20">🏗️</div>
                  <div className="absolute top-3 left-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded text-white"
                      style={{ backgroundColor: n.tagColor }}>
                      {n.tag}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-2">{n.date}</p>
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 group-hover:text-green-700 transition-colors line-clamp-2">
                    {n.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{n.summary}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: n.tagColor }}>
                    Lire la suite <ChevronRight size={12} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/faq" className="inline-flex items-center gap-2 text-sm font-semibold border border-gray-300 px-6 py-2.5 rounded text-gray-700 hover:bg-white transition-colors">
              Voir toutes les actualités & FAQ
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-md p-12 text-center relative overflow-hidden"
            style={{ backgroundColor: "#162a1e" }}>
            <div className="absolute inset-0 opacity-10"
              style={{ background: "radial-gradient(ellipse at 30% 50%, #3fb877 0%, transparent 60%)" }}
            />
            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-widest mb-4 text-green-300">
                Espace professionnel
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Rejoignez les professionnels<br />de la rénovation énergétique
              </h2>
              <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
                Bureaux d'études, diagnostiqueurs DPE, syndics, collectivités — ThermoPilot AI s'adapte à votre volume de missions et à votre organisation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded font-bold text-white text-sm"
                  style={{ backgroundColor: `var(--brand-500)` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-600)`)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `var(--brand-500)`)}
                >
                  Créer un compte professionnel <ArrowRight size={15} />
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded font-bold text-sm transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#fff", backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Accéder à mon espace
                </Link>
              </div>
              <p className="text-xs text-gray-500 mt-5">
                Essai gratuit 14 jours · Sans carte bancaire · Données hébergées en France 🇫🇷
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER — sombre multi-colonnes
      ══════════════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: "#0f1f15", color: "#a8c9b5" }}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

            {/* Brand col */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded flex items-center justify-center text-sm"
                  style={{ backgroundColor: `var(--brand-500)` }}>🌡️</div>
                <span className="font-bold text-white">ThermoPilot AI</span>
              </div>
              <p className="text-xs leading-relaxed opacity-70 mb-4">
                Plateforme SaaS d'audit énergétique automatisé pour les professionnels de l'immobilier.
              </p>
              <p className="text-[10px] opacity-40">Partenaire ADEME · Données hébergées en France</p>
            </div>

            {/* Link columns */}
            {[
              {
                title: "ThermoPilot AI",
                links: [
                  { label: "Simulateur gratuit",    href: "/simulateur" },
                  { label: "Espace professionnel",  href: "/register" },
                  { label: "Documentation API",     href: "/register" },
                  { label: "Tarifs",                href: "/register" },
                ],
              },
              {
                title: "Aides & Primes",
                links: [
                  { label: "MaPrimeRénov'",         href: "/aides#maprimerenov" },
                  { label: "Prime Énergie CEE",     href: "/aides#cee" },
                  { label: "Éco-PTZ",               href: "/aides#eco-ptz" },
                  { label: "TVA réduite 5,5 %",     href: "/aides#tva" },
                ],
              },
              {
                title: "Guide des travaux",
                links: [
                  { label: "Isolation thermique",   href: "/guide" },
                  { label: "Chauffage & PAC",       href: "/guide" },
                  { label: "VMC double flux",       href: "/guide" },
                  { label: "Menuiseries",           href: "/guide" },
                ],
              },
              {
                title: "Compte",
                links: [
                  { label: "Connexion",             href: "/login" },
                  { label: "Inscription",           href: "/register" },
                  { label: "FAQ & Support",         href: "/faq" },
                  { label: "Contact",               href: "/faq" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 opacity-50">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-xs opacity-70 hover:opacity-100 hover:text-white transition-all">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs opacity-40">© ThermoPilot AI — 2026 · Tous droits réservés</p>
            <div className="flex items-center gap-5">
              {["Mentions légales", "Politique de confidentialité", "Cookies", "Accessibilité : non conforme"].map((l) => (
                <a key={l} href="#" className="text-xs opacity-40 hover:opacity-70 transition-opacity">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
