import { Building2, Users, Palette, Shield, BarChart3, Globe } from 'lucide-react';

export const metadata = { title: 'Fonctionnalités' };

const FEATURES = [
  {
    icon: Globe,
    title: 'Mini-site agence',
    description: 'Chaque agence dispose de son propre site vitrine avec un design professionnel et premium. Personnalisez les couleurs, le logo, le slogan et les informations de contact.',
  },
  {
    icon: Building2,
    title: 'Gestion des annonces',
    description: 'Publiez vos biens en quelques clics. Types de biens variés (appartement, villa, terrain, local commercial), photos multiples, géolocalisation, et filtres avancés.',
  },
  {
    icon: Users,
    title: 'Suivi des leads',
    description: 'Chaque visiteur qui contacte votre agence est automatiquement enregistré comme lead. Suivez le statut de chaque prospect : nouveau, contacté, qualifié, converti.',
  },
  {
    icon: Palette,
    title: 'Branding personnalisé',
    description: 'Logo, couleurs, slogan : votre identité visuelle est mise en avant sur votre site et vos annonces. Renforcez votre image de marque professionnelle.',
  },
  {
    icon: Shield,
    title: 'Sécurité & confiance',
    description: 'Vos données sont isolées et sécurisées. Badges de vérification d\'agence et d\'annonces pour renforcer la confiance des visiteurs.',
  },
  {
    icon: BarChart3,
    title: 'Tableau de bord',
    description: 'Visualisez en un coup d\'oeil vos KPIs : annonces actives, leads reçus, taux de conversion. Prenez des décisions éclairées.',
  },
];

export default function FeaturesPage() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-heading-1 text-bleu-nuit">
            Fonctionnalités
          </h1>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Tous les outils dont votre agence a besoin pour se digitaliser et se démarquer.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className={`flex flex-col items-center gap-8 md:flex-row ${
                i % 2 !== 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-2xl bg-bleu-nuit/5">
                <feature.icon className="h-12 w-12 text-bleu-nuit" />
              </div>
              <div>
                <h2 className="text-heading-3 font-semibold text-bleu-nuit">{feature.title}</h2>
                <p className="mt-3 text-body text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
