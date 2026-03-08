"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BarChart3, Brain, FileText, Shield, Smartphone, Target, TrendingUp, Zap } from "lucide-react";
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
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/landing" className="text-xl font-serif font-bold text-white">
            Patrimoine <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">360°</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition hidden sm:block">Tarifs</Link>
            <Link href="/confidentialite" className="text-sm text-gray-400 hover:text-white transition hidden sm:block">Confidentialité</Link>
            <Link href="/" className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition">
              Démarrer mon bilan
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6">
              Copilote financier intelligent
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
              Visualise, analyse et optimise ton patrimoine avec{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                l&apos;intelligence artificielle
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
              Patrimoine 360° centralise ta situation financière, produit des analyses intelligentes
              et te fournit un plan d&apos;action concret pour mieux épargner, investir et préparer l&apos;avenir.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition shadow-xl shadow-indigo-500/25">
                Commencer mon bilan <ArrowRight size={18} />
              </Link>
              <Link href="#modules" className="px-8 py-4 rounded-xl border border-white/[0.1] text-gray-300 hover:bg-white/[0.04] hover:text-white transition">
                Voir les modules
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Preuves */}
      <section className="py-12 border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center gap-8 text-center">
          {[
            { value: "12", label: "modules patrimoniaux" },
            { value: "IA", label: "analyses en français" },
            { value: "PDF", label: "export premium" },
            { value: "PWA", label: "web + mobile" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="text-2xl font-bold text-indigo-400 font-mono">{item.value}</div>
              <div className="text-xs text-gray-500">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problème */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-6">Le problème</h2>
          <p className="text-gray-400 mb-8">
            Comptes dispersés, investissements fragmentés, fiscalité incomprise, absence de stratégie long terme.
            Les outils existants sont trop techniques, fragmentés ou coûteux.
          </p>
          <p className="text-lg text-white font-medium">
            Le besoin n&apos;est pas d&apos;avoir des chiffres. C&apos;est d&apos;obtenir une{" "}
            <span className="text-indigo-400">interprétation fiable et utile</span> de ces chiffres.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">Ce que Patrimoine 360° te permet de faire</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-indigo-500/30 transition">
                <div className="text-indigo-400 mb-4">{f.icon}</div>
                <h3 className="text-white font-medium mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white text-center mb-4">12 modules experts</h2>
          <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Chaque module combine formulaire structuré, calculs locaux, analyse IA et export premium.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {modules.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-center hover:border-indigo-500/30 transition">
                <span className="text-2xl">{m.icon}</span>
                <span className="block text-xs text-indigo-400 font-mono mt-1">Module {m.num}</span>
                <span className="block text-sm text-gray-300 mt-1">{m.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Copilote */}
      <section className="py-20 px-4 bg-gradient-to-b from-indigo-500/5 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <Zap className="mx-auto text-indigo-400 mb-4" size={32} />
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Copilote financier conversationnel</h2>
          <p className="text-gray-400 mb-8">
            Pose tes questions librement : &quot;Puis-je acheter un appartement à 350 000 € ?&quot;,
            &quot;Dois-je rembourser mon crédit ou investir ?&quot;. L&apos;IA analyse tes données et propose une stratégie.
          </p>
          <Link href="/copilote" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition shadow-xl shadow-indigo-500/25">
            Essayer le copilote <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Smartphone className="mx-auto text-indigo-400 mb-4" size={32} />
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Disponible sur mobile</h2>
          <p className="text-gray-400">
            Consulte ton score, mets à jour ton budget, lance un bilan rapide. L&apos;app mobile est conçue pour une utilisation
            en consultation rapide avec toutes les fonctionnalités essentielles.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-white text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{faq.q}</span>
                  <span className="text-gray-500 text-lg ml-4">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-5 pb-4">
                    <p className="text-sm text-gray-400">{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">Prêt à reprendre le contrôle ?</h2>
          <p className="text-gray-400 mb-8">Commence ton bilan patrimonial gratuit en moins de 5 minutes.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-lg hover:from-indigo-600 hover:to-purple-600 transition shadow-xl shadow-indigo-500/25">
            Démarrer gratuitement <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Patrimoine 360°. Tous droits réservés.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-white transition">Tarifs</Link>
            <Link href="/confidentialite" className="hover:text-white transition">Confidentialité</Link>
            <Link href="/" className="hover:text-white transition">Application</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
