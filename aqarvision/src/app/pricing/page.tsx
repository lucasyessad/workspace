import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingHeader } from "@/components/shared/marketing-header";
import { MarketingFooter } from "@/components/shared/marketing-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tarifs - AqarVision | Plateforme Immobilière Algérie",
  description:
    "Découvrez nos formules adaptées aux agences immobilières algériennes. À partir de 2 500 DA/mois.",
};

const plans = [
  {
    nom: "Starter",
    prix: "2 500",
    devise: "DA/mois",
    description: "Pour les agents indépendants qui démarrent",
    populaire: false,
    fonctionnalites: [
      "10 annonces actives",
      "Page publique agence",
      "Upload 5 photos/annonce",
      "Contact WhatsApp",
      "Support email",
    ],
    limites: [
      "Pas de génération IA",
      "Pas d'analytics",
      "Pas de multi-langue",
    ],
  },
  {
    nom: "Pro",
    prix: "5 500",
    devise: "DA/mois",
    description: "Pour les agences qui veulent se démarquer",
    populaire: true,
    fonctionnalites: [
      "50 annonces actives",
      "Page publique personnalisée",
      "Upload 15 photos/annonce",
      "Génération IA trilingue (FR/AR/EN)",
      "Analytics complets",
      "Compression photos auto",
      "Badge agence vérifiée",
      "Support prioritaire",
    ],
    limites: [],
  },
  {
    nom: "Enterprise",
    prix: "Sur devis",
    devise: "",
    description: "Pour les grandes agences et réseaux",
    populaire: false,
    fonctionnalites: [
      "Annonces illimitées",
      "Multi-agences / Réseau",
      "API personnalisée",
      "Intégration CRM",
      "WhatsApp Business API",
      "Formation dédiée",
      "Account Manager",
      "SLA garanti",
    ],
    limites: [],
  },
];

const allFeatures = [
  { nom: "Annonces actives", starter: "10", pro: "50", enterprise: "Illimité" },
  { nom: "Photos par annonce", starter: "5", pro: "15", enterprise: "Illimité" },
  { nom: "Page publique agence", starter: true, pro: true, enterprise: true },
  { nom: "Contact WhatsApp", starter: true, pro: true, enterprise: true },
  { nom: "Support email", starter: true, pro: true, enterprise: true },
  { nom: "Génération IA trilingue", starter: false, pro: true, enterprise: true },
  { nom: "Analytics complets", starter: false, pro: true, enterprise: true },
  { nom: "Compression photos auto", starter: false, pro: true, enterprise: true },
  { nom: "Badge agence vérifiée", starter: false, pro: true, enterprise: true },
  { nom: "Support prioritaire", starter: false, pro: true, enterprise: true },
  { nom: "Page personnalisée", starter: false, pro: true, enterprise: true },
  { nom: "Multi-agences / Réseau", starter: false, pro: false, enterprise: true },
  { nom: "API personnalisée", starter: false, pro: false, enterprise: true },
  { nom: "Intégration CRM", starter: false, pro: false, enterprise: true },
  { nom: "WhatsApp Business API", starter: false, pro: false, enterprise: true },
  { nom: "Formation dédiée", starter: false, pro: false, enterprise: true },
  { nom: "Account Manager", starter: false, pro: false, enterprise: true },
  { nom: "SLA garanti", starter: false, pro: false, enterprise: true },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return (
      <span className="text-body-sm font-medium text-foreground">{value}</span>
    );
  }
  if (value) {
    return (
      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
        <Check className="h-3 w-3 text-emerald-600" />
      </div>
    );
  }
  return <span className="text-muted-foreground">&mdash;</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-blanc-casse">
      <MarketingHeader />

      {/* Hero */}
      <section className="section-padding">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <p className="animate-fade-in-up text-xs font-semibold text-or uppercase tracking-widest mb-3">
            Tarifs
          </p>
          <h1 className="animate-fade-in-up delay-75 font-vitrine text-heading-1 text-foreground mb-5">
            Des tarifs adaptés à votre agence
          </h1>
          <p className="animate-fade-in-up delay-100 text-body-lg text-muted-foreground max-w-xl mx-auto">
            Choisissez la formule qui correspond à vos besoins.
            Tous les plans incluent un essai gratuit de 14 jours.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <div
              key={plan.nom}
              className={`animate-fade-in-up ${
                index === 0
                  ? "delay-100"
                  : index === 1
                  ? "delay-150"
                  : "delay-200"
              } relative rounded-2xl p-8 transition-all ${
                plan.populaire
                  ? "bg-bleu-nuit text-white shadow-float md:scale-105 md:-my-4 z-10"
                  : "glass-card border border-border shadow-card cursor-pointer"
              }`}
            >
              {plan.populaire && (
                <p className="text-xs font-semibold text-or uppercase tracking-widest mb-4">
                  Le plus populaire
                </p>
              )}

              <div className="mb-6">
                <h3
                  className={`text-heading-4 mb-1 ${
                    plan.populaire ? "text-white" : "text-foreground"
                  }`}
                >
                  {plan.nom}
                </h3>
                <p
                  className={`text-body-sm ${
                    plan.populaire ? "text-white/60" : "text-muted-foreground"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span
                  className={`text-display font-bold tracking-tight ${
                    plan.populaire ? "text-white" : "text-foreground"
                  }`}
                >
                  {plan.prix}
                </span>
                {plan.devise && (
                  <span
                    className={`ml-2 text-body-sm ${
                      plan.populaire ? "text-white/50" : "text-muted-foreground"
                    }`}
                  >
                    {plan.devise}
                  </span>
                )}
              </div>

              <Link href="/auth/register" className="block mb-8">
                <Button
                  variant={plan.populaire ? "or" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  Essai gratuit 14 jours
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>

              <div
                className={`border-t ${
                  plan.populaire ? "border-white/10" : "border-border"
                } pt-6`}
              >
                <p
                  className={`text-caption font-semibold uppercase tracking-wider mb-4 ${
                    plan.populaire ? "text-white/40" : "text-muted-foreground"
                  }`}
                >
                  Inclus
                </p>
                <ul className="space-y-3">
                  {plan.fonctionnalites.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-body-sm">
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          plan.populaire
                            ? "bg-or/15 text-or"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span
                        className={
                          plan.populaire ? "text-white/80" : "text-foreground"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                  {plan.limites.map((l) => (
                    <li
                      key={l}
                      className="flex items-start gap-3 text-body-sm"
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.populaire
                            ? "text-white/20"
                            : "text-muted-foreground/40"
                        }`}
                      >
                        &mdash;
                      </span>
                      <span
                        className={`line-through ${
                          plan.populaire
                            ? "text-white/25"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {l}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-white">
        <div className="section-padding">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <p className="animate-fade-in-up text-xs font-semibold text-or uppercase tracking-widest mb-3">
                Comparatif
              </p>
              <h2 className="animate-fade-in-up delay-75 font-vitrine text-heading-2 text-foreground">
                Toutes les fonctionnalités en détail
              </h2>
            </div>

            <div className="animate-fade-in-up delay-100 rounded-2xl border border-border overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-4 bg-blanc-casse border-b border-border">
                <div className="p-5">
                  <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wider">
                    Fonctionnalité
                  </span>
                </div>
                <div className="p-5 text-center">
                  <span className="text-body-sm font-semibold text-foreground">
                    Starter
                  </span>
                </div>
                <div className="p-5 text-center bg-bleu-nuit/5">
                  <span className="text-body-sm font-semibold text-foreground">
                    Pro
                  </span>
                  <span className="ml-2 text-xs text-or font-medium">
                    Populaire
                  </span>
                </div>
                <div className="p-5 text-center">
                  <span className="text-body-sm font-semibold text-foreground">
                    Enterprise
                  </span>
                </div>
              </div>

              {/* Table Rows */}
              {allFeatures.map((feature, i) => (
                <div
                  key={feature.nom}
                  className={`grid grid-cols-4 ${
                    i < allFeatures.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="p-5 flex items-center">
                    <span className="text-body-sm text-foreground">
                      {feature.nom}
                    </span>
                  </div>
                  <div className="p-5 flex items-center justify-center">
                    <FeatureCell value={feature.starter} />
                  </div>
                  <div className="p-5 flex items-center justify-center bg-bleu-nuit/[0.02]">
                    <FeatureCell value={feature.pro} />
                  </div>
                  <div className="p-5 flex items-center justify-center">
                    <FeatureCell value={feature.enterprise} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="animate-fade-in-up max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold text-or uppercase tracking-widest mb-3">
              Prêt à commencer
            </p>
            <h2 className="font-vitrine text-heading-2 text-foreground mb-4">
              Lancez votre agence en ligne dès aujourd&apos;hui
            </h2>
            <p className="text-body text-muted-foreground mb-8 max-w-lg mx-auto">
              Essayez AqarVision gratuitement pendant 14 jours.
              Aucune carte bancaire requise.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  En savoir plus
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
