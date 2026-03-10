import Link from 'next/link';
import { Building2, Users, BarChart3, Globe, Shield, Zap, Search, MessageSquare, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroSearchBar } from '@/components/search/hero-search-bar';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bleu-nuit py-20 text-white md:py-28">
        <div className="container relative z-10">
          <div className="text-center">
            <h1 className="mx-auto max-w-4xl font-display text-display-xl leading-tight md:text-display">
              Trouvez votre bien immobilier,{' '}
              <span className="text-or">en toute confiance</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-body-lg text-white/70">
              Des milliers d'annonces vérifiées par des agences agréées à travers l'Algérie.
              Achat, location — trouvez le bien qui vous correspond.
            </p>
          </div>

          {/* Hero search bar */}
          <div className="mx-auto mt-10 max-w-3xl">
            <HeroSearchBar />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <p className="text-sm text-white/50">Vous êtes une agence ?</p>
            <Button size="sm" variant="or" asChild>
              <Link href="/signup">Créer mon agence gratuitement</Link>
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
    title: 'Recherche puissante',
    description: 'Trouvez le bien idéal avec notre moteur de recherche multi-critères : wilaya, budget, surface, type.',
    icon: Search,
  },
  {
    title: 'Site vitrine premium',
    description: 'Chaque agence dispose de son mini-site professionnel, personnalisable et optimisé pour le mobile.',
    icon: Globe,
  },
  {
    title: 'Messagerie intégrée',
    description: 'Contactez les agences directement via la plateforme. Historique complet, notifications email.',
    icon: MessageSquare,
  },
  {
    title: 'Favoris & alertes',
    description: 'Sauvegardez vos biens préférés et recevez des alertes quand de nouvelles annonces correspondent.',
    icon: Heart,
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
