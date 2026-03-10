import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Tarifs' };

const PLANS = [
  {
    name: 'Starter',
    price: 'Gratuit',
    period: '30 jours d\'essai',
    description: 'Pour découvrir la plateforme',
    features: [
      'Jusqu\'à 10 annonces',
      'Mini-site agence',
      'Gestion des leads',
      '1 utilisateur',
    ],
    cta: 'Essai gratuit',
    popular: false,
  },
  {
    name: 'Pro',
    price: '9 900 DA',
    period: '/mois',
    description: 'Pour les agences actives',
    features: [
      'Annonces illimitées',
      'Mini-site personnalisé',
      'Gestion des leads avancée',
      'Jusqu\'à 5 utilisateurs',
      'Badges de vérification',
      'Support prioritaire',
    ],
    cta: 'Commencer',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Sur devis',
    period: '',
    description: 'Pour les grands groupes',
    features: [
      'Tout dans Pro',
      'Utilisateurs illimités',
      'Domaine personnalisé',
      'API dédiée',
      'Account manager',
      'SLA garanti',
    ],
    cta: 'Nous contacter',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center">
          <h1 className="font-display text-heading-1 text-bleu-nuit">
            Des tarifs simples et transparents
          </h1>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Choisissez le plan qui correspond à la taille de votre agence.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular ? 'relative border-or shadow-elevated' : ''}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
                  Populaire
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-bleu-nuit">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-6 w-full cursor-pointer"
                  variant={plan.popular ? 'or' : 'outline'}
                  asChild
                >
                  <Link href="/signup">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
