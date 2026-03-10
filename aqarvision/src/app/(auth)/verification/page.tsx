import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerificationPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-or/10">
        <Mail className="h-8 w-8 text-or" />
      </div>
      <h2 className="text-heading-3 font-bold text-bleu-nuit">Vérifiez votre email</h2>
      <p className="mt-3 text-body-sm text-muted-foreground">
        Un email de confirmation a été envoyé à{' '}
        {searchParams.email && <strong>{searchParams.email}</strong>}.
        Cliquez sur le lien dans l'email pour activer votre compte.
      </p>

      <div className="mt-8 space-y-3">
        <Button variant="outline" asChild>
          <Link href="/login">Retour à la connexion</Link>
        </Button>
      </div>
    </div>
  );
}
