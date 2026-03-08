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
    gradient: "from-gray-600 to-gray-700",
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
    gradient: "from-indigo-500 to-purple-500",
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
    gradient: "from-emerald-500 to-teal-500",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <Link href="/landing" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft size={14} /> Retour
        </Link>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Des tarifs simples et transparents
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Commence gratuitement. Passe en Premium quand tu es prêt à exploiter tout le potentiel de ton patrimoine.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.popular
                  ? "border-indigo-500/50 bg-indigo-500/5 shadow-xl shadow-indigo-500/10"
                  : "border-white/[0.08] bg-white/[0.02]"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium">
                  Le plus populaire
                </span>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm">
                    <Check size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center px-6 py-3 rounded-xl text-white font-medium transition text-sm ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 shadow-lg shadow-indigo-500/25`
                    : "border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.06]"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Annuel */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-center rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 mb-16">
          <h3 className="text-xl font-serif font-bold text-white mb-2">Abonnement annuel</h3>
          <p className="text-gray-400 mb-4">Économise 2 mois en choisissant le paiement annuel.</p>
          <div className="flex justify-center gap-8">
            <div>
              <span className="text-2xl font-bold text-indigo-400">100€</span>
              <span className="text-gray-500 text-sm"> /an</span>
              <div className="text-xs text-gray-500">Premium annuel</div>
            </div>
            <div>
              <span className="text-2xl font-bold text-emerald-400">500€</span>
              <span className="text-gray-500 text-sm"> /an</span>
              <div className="text-xs text-gray-500">Pro annuel</div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 pb-8">
          <p>Tous les prix sont en euros, hors taxes. Annulation possible à tout moment.</p>
          <p className="mt-1">
            <Link href="/confidentialite" className="text-gray-500 hover:text-white transition">Politique de confidentialité</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
