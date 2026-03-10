import Link from 'next/link';
import { Building2, Users, BarChart3, Globe, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bleu-nuit py-24 text-white md:py-32">
        <div className="container relative z-10 text-center">
          <h1 className="mx-auto max-w-4xl font-display text-display-xl leading-tight md:text-display">
            Votre agence immobilière,{' '}
            <span className="text-or">visible et professionnelle</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/70">
            AqarVision donne à chaque agence algérienne les outils pour gérer ses annonces,
            convertir ses leads et renforcer sa crédibilité en ligne.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="or" asChild>
              <Link href="/signup">Créer mon agence gratuitement</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/demo">Voir la démo</Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bleu-nuit/50" />
      </section>

      {/* Features grid */}
      <section className="py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="font-display text-heading-2 text-bleu-nuit">
              Tout ce dont votre agence a besoin
            </h2>
            <p className="mt-4 text-body-lg text-muted-foreground">
              Une plateforme complète, pensée pour le marché immobilier algérien.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-white p-6 shadow-soft transition-shadow duration-200 hover:shadow-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bleu-nuit/5 text-bleu-nuit">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-heading-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-body-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-bleu-nuit py-20 text-white">
        <div className="container text-center">
          <h2 className="font-display text-heading-2">
            Prêt à digitaliser votre agence ?
          </h2>
          <p className="mt-4 text-body-lg text-white/70">
            Rejoignez les agences qui font confiance à AqarVision.
          </p>
          <Button size="lg" variant="or" className="mt-8" asChild>
            <Link href="/signup">Commencer maintenant</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

const FEATURES = [
  {
    title: 'Site vitrine premium',
    description: 'Chaque agence dispose de son mini-site professionnel, personnalisable et optimisé pour le mobile.',
    icon: Globe,
  },
  {
    title: 'Gestion des annonces',
    description: 'Créez, publiez et gérez vos biens immobiliers avec un dashboard simple et efficace.',
    icon: Building2,
  },
  {
    title: 'Suivi des leads',
    description: 'Suivez chaque prospect du premier contact à la conversion. Ne perdez plus aucune opportunité.',
    icon: Users,
  },
  {
    title: 'Tableau de bord',
    description: 'Visualisez vos performances : annonces publiées, leads reçus, taux de conversion.',
    icon: BarChart3,
  },
  {
    title: 'Sécurité & confiance',
    description: 'Badges de vérification, numéro de registre de commerce, isolation des données par agence.',
    icon: Shield,
  },
  {
    title: 'Rapide & moderne',
    description: 'Interface fluide, chargement rapide, expérience premium pour vos visiteurs et votre équipe.',
    icon: Zap,
  },
];
