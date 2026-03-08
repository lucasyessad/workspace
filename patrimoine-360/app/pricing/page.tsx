"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Découvre les bases de ta situation patrimoniale.",
    features: [
      "Onboarding intelligent",
      "Bilan patrimonial (Module 01)",
      "Budget mensuel (Module 11)",
      "Aperçu du score de santé financière",
      "1 analyse IA / mois",
      "Export PDF basique",
    ],
    cta: "Commencer gratuitement",
    href: "/",
    popular: false,
  },
  {
    name: "Premium",
    price: "10€",
    period: "/mois",
    description: "Accès complet pour piloter ton patrimoine.",
    features: [
      "Accès aux 12 modules",
      "Analyses IA illimitées",
      "Copilote conversationnel",
      "Export PDF premium & Excel",
      "Historique comparatif",
      "Bilan global consolidé",
      "Scénarios prudent / équilibré / offensif",
      "Centre d'objectifs",
      "Rappels intelligents",
      "Sync cloud sécurisé",
    ],
    cta: "Démarrer l'essai gratuit",
    href: "/",
    popular: true,
  },
  {
    name: "Pro",
    price: "50€",
    period: "/mois",
    description: "Pour les professionnels du conseil patrimonial.",
    features: [
      "Tout le plan Premium",
      "Espace multi-clients",
      "Création de dossiers clients",
      "Rapports marque blanche",
      "Analytics d'usage",
      "Support prioritaire",
      "Export Excel multi-onglets",
      "API d'intégration",
    ],
    cta: "Contacter l'équipe",
    href: "mailto:contact@patrimoine360.app",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-8 bg-[var(--color-bg)]">
      <div className="max-w-6xl mx-auto">
        <Link href="/landing" className="btn-ghost text-sm mb-8 inline-flex">
          <ArrowLeft size={14} /> Retour
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-display-lg font-serif text-[var(--color-text-primary)] mb-4">
            Des tarifs simples et transparents
          </h1>
          <p className="text-body-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Commence gratuitement. Passe en Premium quand tu es prêt à exploiter tout le potentiel de ton patrimoine.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16" role="list" aria-label="Plans tarifaires">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              role="listitem"
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-gold-500/50 bg-gold-500/5 shadow-premium-lg"
                  : "surface-card"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-navy-950 text-xs font-semibold">
                  Le plus populaire
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-heading text-[var(--color-text-primary)] mb-1">{plan.name}</h3>
                <p className="text-body-sm text-[var(--color-text-tertiary)] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-display font-serif text-[var(--color-text-primary)]">{plan.price}</span>
                  <span className="text-body-sm text-[var(--color-text-muted)]">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-body-sm">
                    <Check size={16} className="text-success-500 flex-shrink-0 mt-0.5" />
                    <span className="text-[var(--color-text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center px-6 py-3 rounded-xl font-medium transition text-sm ${
                  plan.popular
                    ? "btn-primary justify-center w-full shadow-gold-glow"
                    : "btn-secondary justify-center w-full"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center surface-card p-8 mb-16">
          <h3 className="text-heading-lg font-serif text-[var(--color-text-primary)] mb-2">Abonnement annuel</h3>
          <p className="text-body-sm text-[var(--color-text-secondary)] mb-4">Économise 2 mois en choisissant le paiement annuel.</p>
          <div className="flex justify-center gap-8">
            <div>
              <span className="text-2xl font-bold text-gold-500">100€</span>
              <span className="text-body-sm text-[var(--color-text-muted)]"> /an</span>
              <div className="text-caption text-[var(--color-text-muted)]">Premium annuel</div>
            </div>
            <div>
              <span className="text-2xl font-bold text-success-500">500€</span>
              <span className="text-body-sm text-[var(--color-text-muted)]"> /an</span>
              <div className="text-caption text-[var(--color-text-muted)]">Pro annuel</div>
            </div>
          </div>
        </motion.div>

        <div className="text-center text-caption text-[var(--color-text-muted)] pb-8">
          <p>Tous les prix sont en euros, hors taxes. Annulation possible à tout moment.</p>
          <p className="mt-1">
            <Link href="/confidentialite" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition">Politique de confidentialité</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
