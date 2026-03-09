import Link from "next/link";
import {
  Building2,
  Sparkles,
  Shield,
  ArrowRight,
  BarChart3,
  Globe,
  Camera,
  Check,
  ChevronRight,
  Users,
  Zap,
  Layout,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/shared/marketing-header";
import { MarketingFooter } from "@/components/shared/marketing-footer";
import { BarreRechercheHero } from "@/components/recherche/barre-recherche-hero";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-blanc-casse">
      <MarketingHeader />

      {/* ─── Hero avec recherche premium ─── */}
      <section className="relative bg-bleu-nuit overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,150,62,0.08),transparent_50%)]" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-or/[0.04] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="text-center mb-12">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 backdrop-blur-sm">
                <Search className="h-3.5 w-3.5" />
                +5 000 annonces sur 58 wilayas
              </div>
            </div>

            <h1 className="animate-fade-in-up delay-75 font-vitrine text-heading-1 md:text-display font-extrabold text-white mb-5">
              Trouvez votre bien immobilier{" "}
              <span className="text-or">idéal</span> en Algérie
            </h1>

            <p className="animate-fade-in-up delay-150 text-body-lg text-white/60 mb-12 max-w-2xl mx-auto">
              Recherchez parmi des milliers d&apos;annonces de vente et location
              publiées par des agences vérifiées sur toute l&apos;Algérie.
            </p>
          </div>

          {/* Barre de recherche premium */}
          <div className="animate-fade-in-up delay-200">
            <BarreRechercheHero />
          </div>

          {/* Social proof */}
          <div className="animate-fade-in-up delay-300 mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-white/50">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">+200 agences</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">58 wilayas</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Agences vérifiées</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bandeau recherche premium ─── */}
      <section className="py-12 bg-white border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-or/10 flex items-center justify-center flex-shrink-0">
                <Search className="h-6 w-6 text-or" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Moteur de recherche immobilier
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Recherche multi-agences avec filtres avancés, favoris et alertes personnalisées
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/fr/recherche">
                <Button variant="outline" size="sm">
                  Rechercher un bien
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Espace Agence
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bénéfices clés ─── */}
      <section id="fonctionnalites" className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
              Fonctionnalités
            </p>
            <h2 className="font-vitrine text-heading-2 md:text-heading-1 font-bold text-foreground mb-4">
              Tout ce dont votre agence a besoin
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Des outils pensés pour les professionnels de l&apos;immobilier en Algérie.
              Simples, puissants et élégants.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Layout,
                title: "Mini-site vitrine",
                desc: "Votre page publique professionnelle avec filtres, galerie photos et boutons de contact intégrés.",
              },
              {
                icon: Sparkles,
                title: "IA rédactionnelle",
                desc: "Transformez des points clés en descriptions professionnelles trilingues (FR/AR/EN) en un clic.",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Suivez vos vues, clics WhatsApp, contacts et recherches populaires en temps réel.",
              },
              {
                icon: Camera,
                title: "Photos optimisées",
                desc: "Compression automatique pour les connexions mobiles. Support iPhone HEIC inclus.",
              },
              {
                icon: Globe,
                title: "Multi-langue & RTL",
                desc: "Interface complète en Français, Arabe et Anglais avec support RTL natif.",
              },
              {
                icon: Shield,
                title: "Vérification documents",
                desc: "Acte, livret foncier, concession — renforcez la confiance de vos clients.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group glass-card p-7 rounded-2xl border border-border cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-5 group-hover:bg-or/10 transition-colors">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-or transition-colors" />
                </div>
                <h3 className="text-heading-4 font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Aperçu mini-site ─── */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
                  Mini-site agence
                </p>
                <h2 className="font-vitrine text-heading-2 font-bold text-foreground mb-5">
                  Une vitrine premium pour chaque agence
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Chaque agence dispose de son propre mini-site avec son
                  branding, ses annonces et ses coordonnées de contact. Un
                  véritable outil commercial.
                </p>
                <ul className="space-y-4">
                  {[
                    "Page publique personnalisée avec votre logo",
                    "Filtres de recherche par type et transaction",
                    "Boutons WhatsApp et appel intégrés",
                    "SEO optimisé pour votre wilaya",
                    "Support multilingue FR/AR/EN",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-body-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative">
                <div className="glass-card rounded-2xl border border-border shadow-elevated p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-bleu-nuit rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Immobilière El Djazair</div>
                      <div className="text-xs text-muted-foreground">Alger, Algérie</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: "F3 Bab Ezzouar", price: "12M DA" },
                      { title: "Villa Chéraga", price: "45K DA/mois" },
                      { title: "Local Hydra", price: "8.5M DA" },
                    ].map(({ title, price }) => (
                      <div key={title} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                        <div className="w-16 h-12 rounded-lg bg-muted flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="text-xs font-medium text-foreground">{title}</div>
                          <div className="h-2 bg-muted rounded w-1/2" />
                        </div>
                        <div className="text-xs font-semibold text-or self-center">
                          {price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Dashboard aperçu ─── */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-2xl border border-border bg-blanc-casse shadow-elevated p-6">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: "Annonces actives", value: "24" },
                      { label: "Leads ce mois", value: "18" },
                      { label: "Vues totales", value: "1.2K" },
                      { label: "Clics WhatsApp", value: "89" },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-4 rounded-xl bg-white border border-border">
                        <div className="text-xl font-bold text-foreground">{value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-foreground">Annonces récentes</span>
                      <span className="text-xs text-muted-foreground">Voir tout</span>
                    </div>
                    <div className="space-y-2">
                      {["F3 Bab Ezzouar", "Villa Chéraga", "Local Hydra"].map((t) => (
                        <div key={t} className="flex items-center justify-between py-1.5">
                          <span className="text-xs text-foreground">{t}</span>
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
                  Dashboard
                </p>
                <h2 className="font-vitrine text-heading-2 font-bold text-foreground mb-5">
                  Gérez tout depuis un seul endroit
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Publiez vos annonces, suivez vos performances et gérez vos
                  leads depuis un tableau de bord clair et intuitif.
                </p>
                <ul className="space-y-4">
                  {[
                    "Publication d'annonces en quelques clics",
                    "Suivi des vues et clics en temps réel",
                    "Gestion des leads centralisée",
                    "Branding personnalisable",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                      </div>
                      <span className="text-body-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "58", label: "Wilayas couvertes" },
              { value: "200+", label: "Agences actives" },
              { value: "5K+", label: "Annonces publiées" },
              { value: "99.9%", label: "Uptime garanti" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-heading-2 md:text-heading-1 font-extrabold text-foreground">
                  {value}
                </div>
                <div className="text-caption text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ─── */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
              Simple
            </p>
            <h2 className="font-vitrine text-heading-2 md:text-heading-1 font-bold text-foreground">
              Lancez-vous en 3 étapes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Créez votre compte",
                desc: "Inscription gratuite en 30 secondes. 14 jours d'essai Pro inclus, aucune carte requise.",
              },
              {
                step: "02",
                title: "Ajoutez vos annonces",
                desc: "Photos, description IA, localisation. Tout est simplifié pour publier rapidement.",
              },
              {
                step: "03",
                title: "Recevez des contacts",
                desc: "Vos clients vous contactent via WhatsApp ou appel direct depuis votre vitrine.",
              },
            ].map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-px bg-border -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-bleu-nuit text-white text-lg font-bold flex items-center justify-center mb-5">
                    {step}
                  </div>
                  <h3 className="text-heading-4 font-semibold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-body-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing teaser ─── */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
              Tarifs
            </p>
            <h2 className="font-vitrine text-heading-2 md:text-heading-1 font-bold text-foreground mb-4">
              Des formules adaptées à chaque agence
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              À partir de 2 500 DA/mois. Tous les plans incluent un essai
              gratuit de 14 jours.
            </p>

            <div className="grid md:grid-cols-3 gap-5 text-left">
              {[
                {
                  nom: "Starter",
                  prix: "2 500",
                  desc: "Pour les agents indépendants",
                  features: ["10 annonces", "Page publique", "Support email"],
                },
                {
                  nom: "Pro",
                  prix: "5 500",
                  desc: "Pour les agences ambitieuses",
                  features: ["50 annonces", "IA trilingue", "Analytics complets", "Badge vérifié"],
                  popular: true,
                },
                {
                  nom: "Enterprise",
                  prix: "Sur devis",
                  desc: "Pour les réseaux d'agences",
                  features: ["Illimité", "Multi-agences", "API & CRM", "Account manager"],
                },
              ].map((plan) => (
                <div
                  key={plan.nom}
                  className={`rounded-2xl p-7 transition-all duration-200 ${
                    plan.popular
                      ? "bg-bleu-nuit text-white shadow-float ring-1 ring-bleu-nuit"
                      : "glass-card border border-border shadow-soft cursor-pointer"
                  }`}
                >
                  {plan.popular && (
                    <div className="text-xs font-medium text-or mb-4">Le plus populaire</div>
                  )}
                  <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? "text-white" : "text-foreground"}`}>
                    {plan.nom}
                  </h3>
                  <p className={`text-xs mb-5 ${plan.popular ? "text-white/60" : "text-muted-foreground"}`}>
                    {plan.desc}
                  </p>
                  <div className="mb-6">
                    <span className={`text-heading-2 font-extrabold ${plan.popular ? "text-white" : "text-foreground"}`}>
                      {plan.prix}
                    </span>
                    {plan.prix !== "Sur devis" && (
                      <span className={`text-sm ml-1 ${plan.popular ? "text-white/50" : "text-muted-foreground"}`}>
                        DA/mois
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <Check className={`h-3.5 w-3.5 flex-shrink-0 ${plan.popular ? "text-or" : "text-emerald-500"}`} />
                        <span className={plan.popular ? "text-white/80" : "text-foreground"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register">
                    <Button
                      variant={plan.popular ? "or" : "outline"}
                      className="w-full"
                    >
                      Commencer
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <Link href="/pricing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-8">
              Voir tous les détails des plans
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-vitrine text-heading-2 font-bold text-foreground">
                Questions fréquentes
              </h2>
            </div>

            <div className="divide-y divide-border">
              {[
                {
                  q: "Dois-je payer pour essayer ?",
                  a: "Non. Chaque plan inclut 14 jours d'essai gratuit, sans carte bancaire. Vous pouvez tester toutes les fonctionnalités Pro avant de vous engager.",
                },
                {
                  q: "Comment mes clients me contactent-ils ?",
                  a: "Votre mini-site vitrine intègre un bouton WhatsApp et un bouton d'appel direct. Les messages sont pré-remplis avec le titre du bien concerné.",
                },
                {
                  q: "L'IA génère-t-elle les descriptions automatiquement ?",
                  a: "Oui. En un clic, l'IA transforme vos points clés en une description professionnelle en Français, Arabe et Anglais.",
                },
                {
                  q: "Puis-je utiliser mon propre nom de domaine ?",
                  a: "Avec le plan Enterprise, vous pouvez connecter votre propre domaine (ex: www.votre-agence.com) à votre mini-site vitrine.",
                },
                {
                  q: "Est-ce que ça fonctionne sur mobile ?",
                  a: "Absolument. Le mini-site et le dashboard sont optimisés pour mobile. Les photos sont compressées automatiquement pour les connexions 3G/4G.",
                },
              ].map(({ q, a }) => (
                <details key={q} className="group py-5">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-body font-medium text-foreground pr-4">{q}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <p className="text-body-sm text-muted-foreground mt-3 pr-8 leading-relaxed">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ─── */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center rounded-3xl bg-bleu-nuit p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,150,62,0.08),transparent_50%)]" />
            <div className="absolute top-10 right-10 w-64 h-64 bg-or/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative">
              <h2 className="font-vitrine text-heading-2 md:text-heading-1 font-bold text-white mb-4">
                Prêt à digitaliser votre agence ?
              </h2>
              <p className="text-white/60 mb-8 max-w-md mx-auto">
                Rejoignez les agences qui font confiance à AqarVision pour
                développer leur activité en ligne.
              </p>
              <Link href="/auth/register">
                <Button variant="or" size="lg">
                  Démarrer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
