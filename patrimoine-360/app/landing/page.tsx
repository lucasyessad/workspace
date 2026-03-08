"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Brain, FileText, Shield, Smartphone, Target, TrendingUp, Zap, Sparkles } from "lucide-react";
import { useState } from "react";

const features = [
  { icon: <BarChart3 size={24} />, title: "Bilan patrimonial complet", desc: "Visualise ton patrimoine net, ta répartition d'actifs et ton score de santé financière en un coup d'œil." },
  { icon: <Brain size={24} />, title: "Analyse IA personnalisée", desc: "Un copilote intelligent qui interprète tes données et génère des recommandations concrètes et priorisées." },
  { icon: <TrendingUp size={24} />, title: "Projections financières", desc: "Simule ta retraite, tes investissements et tes scénarios patrimoniaux avec des modèles de calcul éprouvés." },
  { icon: <Target size={24} />, title: "Plan d'action clair", desc: "Obtiens une feuille de route 30/90/365 jours pour optimiser ton patrimoine pas à pas." },
  { icon: <FileText size={24} />, title: "Rapports PDF premium", desc: "Génère des rapports professionnels à partager avec ton conjoint, ton conseiller ou ton comptable." },
  { icon: <Shield size={24} />, title: "Données sécurisées", desc: "Authentification sécurisée, chiffrement, Row Level Security. Tes données restent les tiennes." },
];

const modules = [
  { num: "01", title: "Diagnostic patrimonial", icon: "📊" },
  { num: "02", title: "Planification retraite", icon: "🏖️" },
  { num: "03", title: "Stratégie d'investissement", icon: "📈" },
  { num: "04", title: "Optimisation fiscale", icon: "🧾" },
  { num: "05", title: "Gestion des dettes", icon: "💳" },
  { num: "06", title: "Fonds d'urgence", icon: "🛡️" },
  { num: "07", title: "Planification successorale", icon: "📜" },
  { num: "08", title: "Immobilier résidentiel", icon: "🎓" },
  { num: "09", title: "Expatriation et mobilité", icon: "🔒" },
  { num: "10", title: "Investissement locatif", icon: "🏠" },
  { num: "11", title: "Budget mensuel", icon: "💰" },
  { num: "12", title: "Bilan global & plan d'action", icon: "🗺️" },
];

const faqs = [
  { q: "Est-ce que Patrimoine 360° remplace un conseiller financier ?", a: "Non. Patrimoine 360° est un outil d'aide à la décision. Il vous aide à comprendre et structurer votre situation, mais ne se substitue pas à un conseil professionnel individualisé." },
  { q: "Mes données sont-elles en sécurité ?", a: "Oui. Nous utilisons Supabase avec authentification sécurisée, Row Level Security et chiffrement en transit. Vos données ne sont jamais partagées avec des tiers." },
  { q: "Comment fonctionne l'analyse IA ?", a: "Chaque module dispose de prompts spécialisés. Vos données sont analysées par Claude (Anthropic) qui génère une interprétation structurée avec recommandations priorisées." },
  { q: "Puis-je utiliser Patrimoine 360° gratuitement ?", a: "Oui, le plan gratuit donne accès au bilan patrimonial, au budget mensuel et à un aperçu de votre score de santé financière." },
  { q: "L'application est-elle disponible sur mobile ?", a: "Oui, en version web (PWA installable) et en application native React Native via Expo." },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold-glow">
              <Sparkles size={16} className="text-navy-950" />
            </div>
            <span className="text-lg font-serif font-bold text-white">
              Patrimoine <span className="text-gradient-gold">360°</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-navy-300 hover:text-white transition hidden sm:block">Tarifs</Link>
            <Link href="/confidentialite" className="text-sm text-navy-300 hover:text-white transition hidden sm:block">Confidentialité</Link>
            <Link href="/" className="btn-primary">
              Démarrer mon bilan
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 text-gold-400 text-xs font-medium mb-6">
              Copilote financier intelligent
            </span>
            <h1 className="text-display-lg sm:text-display-xl font-serif text-white leading-tight mb-6">
              Visualise, analyse et optimise ton patrimoine avec{" "}
              <span className="text-gradient-gold">
                l&apos;intelligence artificielle
              </span>
            </h1>
            <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-10">
              Patrimoine 360° centralise ta situation financière, produit des analyses intelligentes
              et te fournit un plan d&apos;action concret pour mieux épargner, investir et préparer l&apos;avenir.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="btn-primary px-8 py-4 text-base shadow-gold-glow">
                Commencer mon bilan <ArrowRight size={18} />
              </Link>
              <Link href="#modules" className="btn-secondary px-8 py-4 border-white/10 text-white hover:border-gold-400">
                Voir les modules
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/[0.06] bg-navy-950/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "12", label: "modules patrimoniaux" },
            { value: "IA", label: "analyses en français" },
            { value: "PDF", label: "export premium" },
            { value: "PWA", label: "web + mobile" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="text-2xl font-bold text-gold-400 font-mono">{item.value}</div>
              <div className="text-caption text-navy-400">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display font-serif text-[var(--color-text-primary)] mb-6">Le problème</h2>
          <p className="text-body-lg text-[var(--color-text-secondary)] mb-8">
            Comptes dispersés, investissements fragmentés, fiscalité incomprise, absence de stratégie long terme.
            Les outils existants sont trop techniques, fragmentés ou coûteux.
          </p>
          <p className="text-body-lg text-[var(--color-text-primary)] font-medium">
            Le besoin n&apos;est pas d&apos;avoir des chiffres. C&apos;est d&apos;obtenir une{" "}
            <span className="text-gold-500">interprétation fiable et utile</span> de ces chiffres.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-[var(--color-bg-secondary)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-display font-serif text-[var(--color-text-primary)] text-center mb-12">Ce que Patrimoine 360° te permet de faire</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="surface-card p-6 hover:border-gold-500/30 transition">
                <div className="text-gold-500 mb-4">{f.icon}</div>
                <h3 className="text-[var(--color-text-primary)] font-medium mb-2">{f.title}</h3>
                <p className="text-body-sm text-[var(--color-text-tertiary)]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-display font-serif text-[var(--color-text-primary)] text-center mb-4">12 modules experts</h2>
          <p className="text-body-lg text-[var(--color-text-secondary)] text-center mb-12 max-w-xl mx-auto">
            Chaque module combine formulaire structuré, calculs locaux, analyse IA et export premium.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {modules.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="surface-card p-4 text-center hover:border-gold-500/30 transition">
                <span className="text-2xl">{m.icon}</span>
                <span className="block text-overline text-gold-600 dark:text-gold-400 mt-1">Module {m.num}</span>
                <span className="block text-body-sm text-[var(--color-text-secondary)] mt-1">{m.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Copilot CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-gold-500/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <Zap className="mx-auto text-gold-400 mb-4" size={32} />
          <h2 className="text-display font-serif text-[var(--color-text-primary)] mb-4">Copilote financier conversationnel</h2>
          <p className="text-body-lg text-[var(--color-text-secondary)] mb-8">
            Pose tes questions librement : &quot;Puis-je acheter un appartement à 350 000 € ?&quot;,
            &quot;Dois-je rembourser mon crédit ou investir ?&quot;. L&apos;IA analyse tes données et propose une stratégie.
          </p>
          <Link href="/copilote" className="btn-primary px-8 py-4 text-base shadow-gold-glow">
            Essayer le copilote <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Smartphone className="mx-auto text-gold-400 mb-4" size={32} />
          <h2 className="text-display font-serif text-[var(--color-text-primary)] mb-4">Disponible sur mobile</h2>
          <p className="text-body-lg text-[var(--color-text-secondary)]">
            Consulte ton score, mets à jour ton budget, lance un bilan rapide. L&apos;app mobile est conçue pour une utilisation
            en consultation rapide avec toutes les fonctionnalités essentielles.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-[var(--color-bg-secondary)]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-display font-serif text-[var(--color-text-primary)] text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="surface-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between">
                  <span className="text-body-sm text-[var(--color-text-primary)] font-medium">{faq.q}</span>
                  <span className="text-[var(--color-text-muted)] text-lg ml-4">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-4">
                    <p className="text-body-sm text-[var(--color-text-secondary)]">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-display font-serif text-[var(--color-text-primary)] mb-4">Prêt à reprendre le contrôle ?</h2>
          <p className="text-body-lg text-[var(--color-text-secondary)] mb-8">Commence ton bilan patrimonial gratuit en moins de 5 minutes.</p>
          <Link href="/" className="btn-primary px-10 py-4 text-lg shadow-gold-glow">
            Démarrer gratuitement <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-caption text-[var(--color-text-muted)]">
          <span>&copy; {new Date().getFullYear()} Patrimoine 360°. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-[var(--color-text-primary)] transition">Tarifs</Link>
            <Link href="/confidentialite" className="hover:text-[var(--color-text-primary)] transition">Confidentialité</Link>
            <Link href="/" className="hover:text-[var(--color-text-primary)] transition">Application</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
