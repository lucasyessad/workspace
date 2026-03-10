import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = { title: 'Démo' };

export default function DemoPage() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-heading-1 text-bleu-nuit">
            Découvrez AqarVision en action
          </h1>
          <p className="mt-4 text-body-lg text-muted-foreground">
            Explorez notre agence de démonstration pour voir comment AqarVision
            peut transformer votre activité immobilière.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="or" asChild>
              <Link href="/agence/immobiliere-el-djazair">
                Voir l'agence démo
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">
                Créer mon agence
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
